<!-- eslint-disable @typescript-eslint/no-dynamic-delete -->
<script setup lang="ts">
import type { DTO_RQ_Ticket, TicketItem } from '~/types/ticket/ticket.interface'
import { computed } from 'vue'
import { Location, Unlock, Delete, Edit, Rank, CloseBold } from '@element-plus/icons-vue'
import { formatCurrencyWithoutSymbol } from '~/lib/formatCurrency'
import { valueSelectedTrip } from '~/composables/trip/useTripGlobal';
import EditTicketDialog from '~/components/dialog/EditTicketDialog.vue'
import { API_CancelTickets, API_UpdateTickets } from '~/api/booking-service/ticket/bms_ticket.api';


const CONTACT_STATUSES = [
    { value: 1, label: 'Chưa gọi', color: 'bg-white' },
    { value: 2, label: 'Phòng vé đã gọi', color: 'bg-blue-500' },
    { value: 3, label: 'Phòng vé gọi không nghe', color: 'bg-yellow-300' },
    { value: 4, label: 'Tài xế đã gọi', color: 'bg-green-500' },
    { value: 5, label: 'Tài xế gọi không nghe', color: 'bg-amber-700' },
    { value: 6, label: 'Số điện thoại không đúng', color: 'bg-pink-500' },
    { value: 7, label: 'Đã gọi cho tài xế', color: 'bg-cyan-400' },
    { value: 8, label: 'Thuê bao không gọi được', color: 'bg-purple-400' },
    { value: 9, label: 'Tài xế báo hủy', color: 'bg-red-500' },
    { value: 10, label: 'Đã nhận tin', color: 'bg-yellow-100' },
    { value: 11, label: 'Đã nhận tin trung chuyển', color: 'bg-emerald-200' },
    { value: 12, label: 'Sai địa chỉ đón', color: 'bg-orange-600' },
    { value: 13, label: 'Chuyển chuyến khác', color: 'bg-teal-600' }
] as const

const props = defineProps<{
    tickets: TicketItem[]
    loading: boolean
}>()
// Nhóm vé theo tầng
const ticketsByFloor = computed(() => {
    const grouped = new Map<number, TicketItem[]>()

    props.tickets.forEach(ticket => {
        const floor = ticket.seat_floor ?? 0
        if (!grouped.has(floor)) {
            grouped.set(floor, [])
        }
        grouped.get(floor)!.push(ticket)
    })

    return Array.from(grouped.entries())
        .sort((a, b) => a[ 0 ] - b[ 0 ])
})

const floors = computed(() => {
    return ticketsByFloor.value.map(item => item[ 0 ])
})

// Lấy ghế theo row/column trong một tầng
const getFloorSeats = (floor: number) => {
    const floorTickets = props.tickets.filter(t => t.seat_floor === floor)

    if (floorTickets.length === 0) return []

    const maxRow = Math.max(...floorTickets.map(t => t.seat_row ?? 0))
    const maxCol = Math.max(...floorTickets.map(t => t.seat_column ?? 0))

    const seats: (TicketItem | null)[][] = []

    for (let r = 1; r <= maxRow; r++) {
        seats[ r - 1 ] = []
        for (let c = 1; c <= maxCol; c++) {
            const ticket = floorTickets.find(
                t => t.seat_row === r && t.seat_column === c
            )
            seats[ r - 1 ][ c - 1 ] = ticket || null
        }
    }

    return seats
}
const allTickets = ref<TicketItem[]>([]);
const getContactStatusInfo = (status: number | null | undefined) => {
    return CONTACT_STATUSES.find(s => s.value === status) || CONTACT_STATUSES[ 0 ]
}

const { $firebase } = useNuxtApp();
const useUserStore = userStore();
const useOffice = useOfficeStore();
const selectedTickets = ref<TicketItem[]>([]); // Vé user hiện tại chọn
// Tất cả vé từ Firebase, bao gồm selectedBy người khác

const tripId = computed(() => valueSelectedTrip.value?.id)

const ticketsRef = computed(() => {
    if (!tripId.value) return null
    return $firebase.ref($firebase.db, `tickets/${tripId.value}`)
})

// --- Helpers ---
const isTicketSelected = (ticket: TicketItem) => {
    if (!ticket?.id) return false
    return selectedTickets.value.some(t => t.id === ticket.id)
}

// Kiểm tra vé có đang được bất kỳ ai (bao gồm user hiện tại) chọn trên Firebase
const isTicketBeingSelectedByAnyone = (ticket: TicketItem) => {
    const t = allTickets.value.find(x => x.id === ticket.id)
    return !!t && !!t.selected
}

// Lấy tên người đang chọn vé (nếu có)
const getTicketSelectedBy = (ticket: TicketItem) => {
    const t = allTickets.value.find(x => x.id === ticket.id)
    return t?.selectedBy ?? null
}


// --- Firebase helpers ---
const setTicketSelectedOnFirebase = (t: TicketItem, byName: string | null) => {
    if (!ticketsRef.value || !t?.id) return
    const ticketRef = $firebase.ref($firebase.db, `tickets/${tripId.value}/${t.id}`)
    const selected = !!byName
    $firebase.set(ticketRef, { ...t, selected, selectedBy: byName })
}

// --- Local add/remove for selectedTickets (user's own selected list) ---
const addLocalSelected = (t: TicketItem) => {
    if (!isTicketSelected(t)) selectedTickets.value.push(t)
}
const removeLocalSelected = (t: TicketItem) => {
    selectedTickets.value = selectedTickets.value.filter(x => x.id !== t.id)
}
const removeTicketFromFirebase = (t: TicketItem) => {
    if (!ticketsRef.value || !t?.id) return;
    const ticketRef = $firebase.ref($firebase.db, `tickets/${tripId.value}/${t.id}`);
    $firebase.remove(ticketRef);
};


// Bắt đầu countdown cho ticket
interface TicketCountdown {
    [ ticketId: number ]: number; // thời gian còn lại tính bằng giây
}

interface TicketInterval {
    [ ticketId: number ]: number; // lưu ID interval để clear
}

const countdowns = reactive<TicketCountdown>({});
const intervals: TicketInterval = {};

// Bắt đầu countdown cho 1 vé
const startCountdown = (ticketId: number) => {
    // Reset countdown 10 phút
    countdowns[ ticketId ] = 10 * 60;

    // Nếu vé này đã có interval thì clear trước
    if (intervals[ ticketId ]) {
        clearInterval(intervals[ ticketId ]);
    }

    // Tạo interval riêng cho vé này
    intervals[ ticketId ] = window.setInterval(() => {
        if (countdowns[ ticketId ] > 0) {
            countdowns[ ticketId ]--;
        } else {
            // Hết countdown -> bỏ chọn vé
            stopCountdown(ticketId);
            const ticket = allTickets.value.find(t => t.id === ticketId);
            if (ticket && isTicketSelected(ticket)) {
                removeLocalSelected(ticket);
                removeTicketFromFirebase(ticket); // nếu muốn đồng bộ Firebase
            }
            clearInterval(intervals[ ticketId ]);
            delete intervals[ ticketId ];
        }
    }, 1000);
};

// Dừng countdown (bỏ chọn)
const stopCountdown = (ticketId: number) => {
    countdowns[ ticketId ] = 0;
    if (intervals[ ticketId ]) {
        clearInterval(intervals[ ticketId ]);
        delete intervals[ ticketId ];
    }
};



// --- Click handling (keeps group-by-phone rules) ---
// --- Click handler ---
const handleSeatClick = (ticket: TicketItem) => {
    if (!ticket?.id || !ticketsRef.value) return;
    const phone = ticket.phone?.trim();
    const userFullName = useUserStore.full_name || 'N/A';
    const currentlySelected = isTicketSelected(ticket);

    const groupOfPhone = (phoneVal: string | undefined | null) =>
        props.tickets.filter(t => t.phone?.trim() === (phoneVal ?? ''));

    // 1️⃣ Vé không có phone
    if (!phone) {
        // Bỏ các vé local có phone
        const removedPhoneLocals = selectedTickets.value.filter(t => !!t.phone);
        removedPhoneLocals.forEach(t => {
            removeLocalSelected(t);
            removeTicketFromFirebase(t);
            stopCountdown(t.id!);
        });

        if (currentlySelected) {
            removeLocalSelected(ticket);
            removeTicketFromFirebase(ticket);
            stopCountdown(ticket.id!);
        } else {
            addLocalSelected(ticket);
            setTicketSelectedOnFirebase(ticket, userFullName);
            startCountdown(ticket.id!);
        }
        return;
    }

    // 2️⃣ Vé có phone → bỏ vé local không phone
    const removedNoPhoneLocals = selectedTickets.value.filter(t => !t.phone);
    removedNoPhoneLocals.forEach(t => {
        removeLocalSelected(t);
        removeTicketFromFirebase(t);
        stopCountdown(t.id!);
    });

    // 2a️⃣ Bỏ vé cùng phone khác với vé mới
    const removedDifferentPhoneLocals = selectedTickets.value.filter(t => t.phone && t.phone !== phone);
    removedDifferentPhoneLocals.forEach(t => {
        removeLocalSelected(t);
        removeTicketFromFirebase(t);
        stopCountdown(t.id!);
    });

    // Nhóm vé cùng phone mới
    const group = groupOfPhone(phone);

    // Kiểm tra xem nhóm đã có vé nào được chọn chưa
    const groupSelected = group.some(t => isTicketSelected(t));

    // 3️⃣ Nếu vé đã chọn -> bỏ vé đó
    if (currentlySelected) {
        removeLocalSelected(ticket);
        removeTicketFromFirebase(ticket);
        stopCountdown(ticket.id!);
        return;
    }

    // 4️⃣ Nếu nhóm chưa chọn -> chọn toàn bộ nhóm
    if (!groupSelected) {
        group.forEach(t => {
            addLocalSelected(t);
            setTicketSelectedOnFirebase(t, userFullName);
            startCountdown(t.id!);
        });
    }
};

// Số lượng vé đã book
const bookedTicketsCount = computed(() =>
    selectedTickets.value.filter(t => t.booked_status === true).length
);


// --- Realtime sync: get ALL tickets under trip and keep local derived list updated ---
const syncAllTickets = () => {
    if (!ticketsRef.value) return

    $firebase.onValue(ticketsRef.value, (snapshot) => {
        const data = snapshot.val() || {}
        const ticketsArray: TicketItem[] = Object.values(data)

        console.log('🔥 Firebase Raw Data:', data)
        console.log('🔥 Tickets Array:', ticketsArray)

        // allTickets giữ snapshot realtime
        allTickets.value = ticketsArray

        // Cập nhật thông tin realtime vào props.tickets mà không mất vé chưa chỉnh sửa
        props.tickets.forEach(ticket => {
            const updated = allTickets.value.find(t => t.id === ticket.id)
            if (updated) {
                Object.assign(ticket, updated)
            }
        })

        // Cập nhật selectedTickets của user hiện tại
        selectedTickets.value = allTickets.value.filter(
            t => t.selected && t.selectedBy === (useUserStore.full_name || '')
        )
        console.log('👤 selectedTickets (current user):', selectedTickets.value)
    })
}


// --- Clear all local selected (and unselect on firebase) ---
const handleClearAll = () => {
    selectedTickets.value.forEach(t => removeTicketFromFirebase(t))
    selectedTickets.value = []
}


// lifecycle
onMounted(() => {
    syncAllTickets()
})

onBeforeUnmount(() => {
    if (ticketsRef.value) $firebase.off(ticketsRef.value);
});




/// Dialog Edit Ticket
const dialogEditTicket = ref(false);
const handleOpenDialogEditTicket = () => {
    dialogEditTicket.value = true;
};
const handleCloseDialogEditTicket = () => {
    dialogEditTicket.value = false;
};

const loadingTickets = ref<number[]>([]);

// Actions: Cập nhật thông tin vé
const handleUpdateTickets = async (data: DTO_RQ_Ticket) => {
    const ids = selectedTickets.value
        .map(ticket => ticket.id)
        .filter((id): id is number => id !== undefined && id !== null);
    const tripID = valueSelectedTrip.value?.id;
    if (tripID === undefined || tripID === null) {
        notifyError('Dữ liệu chuyến không hợp lệ. Vui lòng thử lại.');
        return;
    }
    const user = {
        user_id: useUserStore.id,
        user_name: useUserStore.full_name,
        office_id: useOffice.id,
        office_name: useOffice.name
    }
    try {
        loadingTickets.value.push(...ids);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const response = await API_UpdateTickets(tripID, ids, data, user);
        if (response.success && response.result) {
            notifySuccess('Cập nhật thông tin vé thành công.');
            // Cập nhật local
            response.result.forEach((updatedTicket: TicketItem) => {
                const local = props.tickets.find(t => t.id === updatedTicket.id);
                if (local) {
                    Object.assign(local, updatedTicket); // cập nhật thông tin local
                }
                // Đồng bộ lên Firebase để các user khác cũng nhận được
                const itemRef = $firebase.ref($firebase.db, `tickets/${tripId.value}/${updatedTicket.id}`);
                $firebase.set(itemRef, {
                    ...updatedTicket,
                    selected: false,
                    selectedBy: null,
                    updatedAt: Date.now() // để trigger real-time sync
                });
            });
            const bookedTickets = props.tickets.filter(t => t.booked_status === true);
            if (valueSelectedTrip.value) {
                valueSelectedTrip.value.ticket_booked = bookedTickets.length;
                valueSelectedTrip.value.total_price = bookedTickets.reduce((sum, t) => sum + (t.total_price || 0), 0);
                valueSelectedTrip.value.money_paid = bookedTickets.reduce((sum, t) => sum + (t.money_paid || 0), 0);
            }
        } else {
            notifyError(response.message || 'Cập nhật thông tin vé thất bại. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error updating tickets:', error);
        notifyError('Cập nhật thông tin vé thất bại. Vui lòng thử lại.');
    } finally {
        loadingTickets.value = loadingTickets.value.filter(id => !ids.includes(id));
        dialogEditTicket.value = false;
        handleClearAll();
    }
};

// Action: Huỷ vé
const handleCancelTickets = async () => {
    const ids = selectedTickets.value
        .map(ticket => ticket.id)
        .filter((id): id is number => id !== undefined && id !== null);
    const tripID = valueSelectedTrip.value?.id;
    if (tripID === undefined || tripID === null) {
        notifyError('Dữ liệu chuyến không hợp lệ. Vui lòng thử lại.');
        return;
    }
    const user = {
        user_id: useUserStore.id,
        user_name: useUserStore.full_name,
        office_id: useOffice.id,
        office_name: useOffice.name
    }

    try {
        loadingTickets.value.push(...ids);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const response = await API_CancelTickets(tripID, ids, user);
        if (response.success && response.result) {
            notifySuccess('Hủy vé thành công.');
            // Cập nhật local
            response.result.forEach((canceledTicket: TicketItem) => {
                const local = props.tickets.find(t => t.id === canceledTicket.id);
                if (local) {
                    Object.assign(local, canceledTicket); // cập nhật thông tin local
                }
                // Đồng bộ lên Firebase để các user khác cũng nhận được
                const itemRef = $firebase.ref($firebase.db, `tickets/${tripId.value}/${canceledTicket.id}`);
                $firebase.set(itemRef, {
                    ...canceledTicket,
                    selected: false,
                    selectedBy: null,
                    updatedAt: Date.now() // để trigger real-time sync
                });
            });
            const bookedTickets = props.tickets.filter(t => t.booked_status === true);
            if (valueSelectedTrip.value) {
                valueSelectedTrip.value.ticket_booked = bookedTickets.length;
                valueSelectedTrip.value.total_price = bookedTickets.reduce((sum, t) => sum + (t.total_price || 0), 0);
                valueSelectedTrip.value.money_paid = bookedTickets.reduce((sum, t) => sum + (t.money_paid || 0), 0);
            }
        } else {
            notifyError(response.message || 'Hủy vé thất bại. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error canceling tickets:', error);
        notifyError('Hủy vé thất bại. Vui lòng thử lại.');
    } finally {
        loadingTickets.value = loadingTickets.value.filter(id => !ids.includes(id));
        handleClearAll();
    }
}


</script>

<template>
    <div v-if="loading" v-loading="loading" element-loading-text="Đang tải danh sách vé..."
        class="text-center py-8 text-gray-500 min-h-[200px]" />

    <div v-else class="space-y-6 ">
        <!-- Seat maps by floor - displayed horizontally LEFT TO RIGHT FULL WIDTH -->
        <div class="flex gap-3 w-full pb-4">
            <div v-for="floor in floors" :key="floor" class="flex-1">

                <!-- Grid layout cho hàng ghế -->
                <div class="space-y-1">
                    <!-- Each row -->
                    <div v-for="(row, rowIdx) in getFloorSeats(floor)" :key="rowIdx" class="flex gap-3 items-start">

                        <!-- Seats in this row -->
                        <div class="flex gap-1 flex-1">
                            <div v-for="(ticket, colIdx) in row" :key="`${rowIdx}-${colIdx}`" class="flex-1">
                                <!-- Ticket Card -->
                                <div v-if="ticket" @click="handleSeatClick(ticket)"
                                    class="relative w-full h-full min-h-[120px] border-2 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow flex flex-col"
                                    :class="isTicketSelected(ticket) ? 'border-[#0072bc]' : 'border-gray-300'"
                                    v-loading="ticket.id != null && loadingTickets.includes(ticket.id)"
                                    element-loading-text="Đang cập nhật...">


                                    <!-- Header -->
                                    <div v-if="isTicketBeingSelectedByAnyone(ticket)"
                                        class="absolute bottom-0 left-0 w-full h-[70%] bg-gray-200 bg-opacity-50 flex flex-col items-center justify-center text-gray-700 text-sm font-semibold z-20 pointer-events-none rounded-t">

                                        <div>{{ getTicketSelectedBy(ticket) || 'N/A' }}</div>
                                        <div v-if="ticket.id != null && countdowns[ ticket.id ] !== undefined"
                                            class="mt-1">
                                            {{ Math.floor(countdowns[ ticket.id ] / 60) }}:
                                            {{ String(countdowns[ ticket.id ] % 60).padStart(2, '0') }}
                                        </div>

                                    </div>




                                    <div class="p-1">
                                        <div class="flex items-center justify-between mb-1 gap-2">
                                            <div class="">
                                                <span class=" font-semibold text-[#339933] text-base">{{
                                                    ticket.seat_name }}
                                                </span>
                                            </div>
                                            <div v-if="ticket.booked_status">
                                                <el-tooltip :content="getContactStatusInfo(ticket.contact_status).label"
                                                    placement="top" effect="dark">
                                                    <div :class="[ 'border-1 rounded px-1 border-gray-300 transition-colors cursor-help',
                                                        getContactStatusInfo(ticket.contact_status).color ]">
                                                        {{ ticket.phone }}
                                                    </div>
                                                </el-tooltip>
                                            </div>
                                        </div>
                                        <div v-if="ticket.booked_status && ticket.name"
                                            class="text-base font-medium text-[15px]">
                                            {{ ticket.name }}
                                        </div>
                                        <!-- Locations -->
                                        <div v-if="ticket.booked_status" class="px-1">
                                            <div class="flex items-center gap-1 text-gray-600" v-if="ticket.point_up">
                                                <el-icon color="#CC0000">
                                                    <Location />
                                                </el-icon>
                                                <span class="text-[14px] font-medium">{{ ticket.point_up }}</span>
                                            </div>
                                            <div class="flex items-center gap-1 text-gray-600" v-if="ticket.point_down">
                                                <el-icon color="#0033FF">
                                                    <Location />
                                                </el-icon>
                                                <span class="text-[14px] font-medium">{{ ticket.point_down }}</span>
                                            </div>
                                        </div>

                                    </div>
                                    <div class="mt-auto px-1">
                                        <div v-if="ticket.booked_status" class="flex">
                                            <span class="ml-auto pr-1 text-[12px] font-medium text-gray-600">({{
                                                ticket.id }})</span>
                                        </div>
                                        <div v-if="ticket.booked_status" class="px-1">
                                            <span class="text-[14px] font-medium text-[#0072bc]">* {{ ticket.note
                                            }}</span>
                                        </div>

                                        <div v-if="ticket.booked_status">
                                            <div
                                                class="flex justify-between items-center text-[14px] font-medium text-gray-600">
                                                <span>{{ formatCurrencyWithoutSymbol(ticket.money_paid || 0)}}/{{ formatCurrencyWithoutSymbol(ticket.total_price || 0)
                                                    }}</span>
                                                <span>{{ ticket.payment_method }}</span>
                                            </div>
                                            <div class="h-[5px] bg-[#0072bc] rounded-lg" />
                                        </div>
                                        <div v-if="ticket.booked_status" class="text-[12px] text-gray-600">
                                            P: {{ ticket.user_name }} / {{ ticket.office_name }}
                                        </div>
                                    </div>
                                </div>

                                <!-- Empty placeholder -->
                                <div v-else class="flex-1"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty state -->
        <div v-if="!tickets.length" class="text-center py-12 text-gray-500">
            <p class="text-lg">Không có dữ liệu vé</p>
        </div>


        <div v-if="selectedTickets.length > 0" class="fixed left-1/2 transform -translate-x-1/2 w-[90%] max-w-5xl z-50"
            style="bottom: 8px;">
            <div class="bg-white border border-gray-300 shadow-md transition-transform duration-300 rounded-xl">
                <div class="flex items-stretch justify-between gap-4 h-full">
                    <!-- Left section - Selected count -->
                    <div
                        class="bg-gray-100 px-4 py-2 rounded-l-xl text-sm font-medium text-gray-700 flex items-center justify-center flex-shrink-0">
                        <div class="flex items-center gap-x-2">
                            <el-icon class="cursor-pointer hover:text-red-500 transition" @click="handleClearAll">
                                <CloseBold />
                            </el-icon>
                            <span class="text-[16px]">
                                Số vé đang chọn:
                                <span class="text-[#FF9900]">{{ selectedTickets.length }}</span>
                            </span>
                        </div>
                    </div>

                    <!-- Middle section - Selected tickets -->
                    <div
                        class="px-4 py-3 text-sm text-blue-800 flex-1 flex flex-wrap gap-2 items-center rounded-none overflow-hidden">
                        <el-tag v-for="ticket in selectedTickets" :key="ticket.id" type="warning" effect="dark">
                            <span class="text-[15px]">{{ ticket.seat_name }}</span>
                        </el-tag>
                    </div>

                    <!-- Right section - Action buttons -->
                    <div
                        class="bg-purple-50 px-4 py-2 rounded-r-xl flex gap-2 items-center justify-center flex-shrink-0">
                        <!-- Paste button -->
                        <!-- <div v-if="isCopyTicket">
                        <el-tooltip v-if="selectedTickets.filter(t => t.booked_status === false).length > 0"
                            content="Dán vé" placement="top">
                            <el-button type="success" :icon="CopyDocument" circle @click="$emit('paste')" />
                        </el-tooltip>
                    </div> -->

                        <!-- Edit button -->
                        <div>
                            <el-tooltip content="Cập nhật thông tin vé" placement="top">
                                <el-button type="warning" :icon="Edit" circle @click="handleOpenDialogEditTicket" />
                            </el-tooltip>
                        </div>

                        <!-- Copy button -->
                        <!-- <div v-if="bookedTicketsCount > 0 && !hasDifferentPhoneNumbers">
                        <el-tooltip content="Sao chép vé" placement="top">
                            <el-button color="#626aef" :icon="CopyDocument" circle @click="$emit('copy')" />
                        </el-tooltip>
                    </div> -->

                        <!-- Move button -->
                        <div v-if="bookedTicketsCount > 0">
                            <el-tooltip content="Di chuyển vé" placement="top">
                                <el-button type="primary" :icon="Rank" circle @click="$emit('move')" />
                            </el-tooltip>
                        </div>

                        <!-- Cancel button -->
                        <div v-if="bookedTicketsCount > 0">
                            <el-tooltip content="Hủy vé" placement="top">
                                <el-button type="danger" :icon="Delete" circle @click="handleCancelTickets" />
                            </el-tooltip>
                        </div>
                    </div>
                </div>
            </div>
        </div>


    </div>
    <EditTicketDialog v-model="dialogEditTicket" :selected-tickets="selectedTickets"
        @closed="handleCloseDialogEditTicket" @save="handleUpdateTickets" />
</template>