<!-- eslint-disable @typescript-eslint/no-dynamic-delete -->
<script setup lang="ts">
import type { Ticket, TicketItem } from '~/types/ticket/ticket.interface'
import { computed } from 'vue'
import { Location, Unlock, Delete, Edit, Rank, CloseBold, CopyDocument } from '@element-plus/icons-vue'
import { formatCurrencyWithoutSymbol } from '~/lib/formatCurrency'
import { listTrip, valueSelectedTrip } from '~/composables/trip/useTripGlobal';
import DialogEditTicket from '~/components/ticket/dialog/DialogEditTicket.vue';
import { API_CancelTickets, API_GetTicketByTripId, API_MoveTickets, API_UpdateTickets } from '~/services/booking-service/ticket/bms-ticket.api';


import { API_GetTripSummaryById } from '~/services/booking-service/trip/bms-trip.api';
import { useTicketActions } from '~/composables/ticket/useTicketActions';
import { activeModeTicket, listTicket, lockedByOthers, selectedTickets } from '~/composables/ticket/useTicketGlobal';



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
    tickets: Ticket[]
    loading: boolean
}>()

const activeTickets = computed(() =>
    props.tickets.filter(t => t.seat?.status === true)
)
const floors = computed(() => {
    const set = new Set<number>()
    activeTickets.value.forEach(t => set.add(t.seat!.floor))
    return Array.from(set).sort((a, b) => a - b)
})
const getRawRowsByFloor = (floor: number): Ticket[][] => {
    const floorTickets = activeTickets.value.filter(
        t => t.seat!.floor === floor
    )
    if (!floorTickets.length) return []
    const rowsMap = new Map<number, Ticket[]>()
    floorTickets.forEach(ticket => {
        const row = ticket.seat!.row
        if (!rowsMap.has(row)) rowsMap.set(row, [])
        rowsMap.get(row)!.push(ticket)
    })
    return Array.from(rowsMap.entries())
        .sort((a, b) => a[ 0 ] - b[ 0 ])
        .map(([ _, tickets ]) =>
            [ ...tickets ].sort(
                (a, b) => a.seat!.column - b.seat!.column
            )
        )
}
const getSeatCountLevels = (rows: Ticket[][]): number[] => {
    return Array.from(new Set(rows.map(r => r.length))).sort((a, b) => a - b)
}
const padRowToNextLevel = (
    row: (Ticket | null)[],
    levels: number[]
): (Ticket | null)[] => {
    const currentSize = row.length
    const nextLevel = levels.find(l => l > currentSize)
    if (!nextLevel) return row
    const need = nextLevel - currentSize
    const result = [ ...row ]
    const insertAt = Math.floor(result.length / 2)
    for (let i = 0; i < need; i++) {
        result.splice(insertAt, 0, null)
    }
    return result
}
const getFloorSeats = (floor: number): (Ticket | null)[][] => {
    const rawRows = getRawRowsByFloor(floor)
    if (!rawRows.length) return []
    const levels = getSeatCountLevels(rawRows)
    const minSize = levels[ 0 ]
    const nextSize = levels.find(l => l > minSize)
    if (!nextSize) return rawRows
    return rawRows.map(row => {
        if (row.length !== minSize) {
            return row
        }
        return padRowToNextLevel(row, levels)
    })
}

const {
    handleClickTicket,
    isTicketSelected,
    dialogEditTicket,
    handleOpenDialogEditTicket,
    handleCloseDialogEditTicket,
    isLockedByOther,
    lockedUserName,
    handleForceUnlock,
    handleRemoveAllSelectedTickets,
    handleUpdateTickets,
    isLoadingTicket,
    addLoadingTickets,
    removeLoadingTickets,
    handleCancelTickets,
    handleStartActionTicket,
} = useTicketActions();




const { $socket } = useNuxtApp()
const countdownTimers = new Map<string, ReturnType<typeof setInterval>>()
const startCountdown = (ticketId: string) => {
    if (countdownTimers.has(ticketId)) return
    const timer = setInterval(() => {
        const lock = lockedByOthers.value[ ticketId ]
        if (!lock) {
            clearInterval(timer)
            countdownTimers.delete(ticketId)
            return
        }
        const remain = Math.floor(
            (lock.lockedUntil - Date.now()) / 1000
        )
        lock.remaining = Math.max(remain, 0)

        if (remain <= 0) {
            clearInterval(timer)
            countdownTimers.delete(ticketId)
        }
    }, 1000)
    countdownTimers.set(ticketId, timer)
}

onMounted(() => {

    if (!$socket.connected) {
        console.log('🔌 Connecting WS...')
        $socket.connect()
    }
    if (!valueSelectedTrip.value?.id) return

    const tripId = valueSelectedTrip.value.id

    /* ======================
       JOIN TRIP
       ====================== */
    $socket.emit('join-trip', { tripId })

    /* ======================
       🔒 LOCK VÉ
       ====================== */
    $socket.on('ticket:locked', ({ trip_id, tickets }) => {
        if (trip_id !== tripId) return

        tickets.forEach(t => {
            lockedByOthers.value[ t.id ] = {
                seatName: t.seat_name,
                userId: t.user_select_id,
                userName: t.user_select_name,
                lockedUntil: t.locked_until,
                remaining: Math.max(
                    Math.floor((t.locked_until - Date.now()) / 1000),
                    0
                ),
            }

            startCountdown(t.id)
        })
    })

    /* ======================
       🔓 UNLOCK VÉ
       ====================== */
    $socket.on('seat-released', ({ ticketId }) => {
        delete lockedByOthers.value[ ticketId ]

        if (countdownTimers.has(ticketId)) {
            clearInterval(countdownTimers.get(ticketId)!)
            countdownTimers.delete(ticketId)
        }

        const index = selectedTickets.value.findIndex(
            t => t.id === ticketId
        )
        if (index !== -1) {
            selectedTickets.value.splice(index, 1)
        }
    })

    /* ======================
       🔄 LOADING REALTIME
       ====================== */
    $socket.on('ticket:updating', ({ trip_id, ticket_ids }) => {
        if (trip_id !== tripId) return
        addLoadingTickets(ticket_ids)
    })

    $socket.on('ticket:updated', ({ trip_id, ticket_ids }) => {
        if (trip_id !== tripId) return
        removeLoadingTickets(ticket_ids)
    })

    /* ======================
       📦 DATA UPDATED (🔥 THIẾU Ở BẠN)
       ====================== */
    $socket.on('ticket:data-updated', ({ trip_id, tickets }) => {
        // if (trip_id !== tripId) return

        console.log('📦 WS ticket data updated:', tickets)

        listTicket.value = listTicket.value.map(t => {
            const updated = tickets.find((u: any) => u.id === t.id)
            if (updated) {
                // Unselect if the ticket is now unbooked
                if (!updated.booked_status) {
                    const index = selectedTickets.value.findIndex(sel => sel.id === updated.id)
                    if (index !== -1) {
                        selectedTickets.value.splice(index, 1)
                    }
                }
                return { ...t, ...updated }
            }
            return t
        })

    })
})


onUnmounted(() => {
    $socket.off('ticket:locked')
    $socket.off('seat-released')
    $socket.off('ticket:updating')
    $socket.off('ticket:updated')
    $socket.off('ticket:data-updated')

    // 🔥 clear toàn bộ countdown
    countdownTimers.forEach(timer => clearInterval(timer))
    countdownTimers.clear()
    if ($socket.connected) {
        console.log('🔌 Disconnecting WS...')
        $socket.disconnect()
    }
})



const lockedRemainTime = (ticket: Ticket) => {
    const remain = lockedByOthers.value[ ticket.id ]?.remaining ?? 0
    const m = Math.floor(remain / 60).toString().padStart(2, '0')
    const s = (remain % 60).toString().padStart(2, '0')
    return `${m}:${s}`
}




const allTickets = ref<TicketItem[]>([]);
const getContactStatusInfo = (status: number | null | undefined) => {
    return CONTACT_STATUSES.find(s => s.value === status) || CONTACT_STATUSES[ 0 ]
}

const { $firebase } = useNuxtApp();


const isMoveTickets = ref(false);
const listMoveTickets = ref<TicketItem[]>([]);


const handleClearAll = () => {
    selectedTickets.value.forEach(t => removeTicketFromFirebase(t))
    selectedTickets.value = []
    isMoveTickets.value = false;
    listMoveTickets.value = [];
}





const removeTicketFromFirebase = (ticket: TicketItem, tripId?: number) => {
    const tid = tripId ?? ticket.trip_id;
    const ref = $firebase.ref($firebase.db, `tickets/${tid}/${ticket.id}`);
    $firebase.remove(ref);
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



// Dừng countdown (bỏ chọn)
const stopCountdown = (ticketId: number) => {
    countdowns[ ticketId ] = 0;
    if (intervals[ ticketId ]) {
        clearInterval(intervals[ ticketId ]);
        delete intervals[ ticketId ];
        isMoveTickets.value = false;
        listMoveTickets.value = [];
    }
};




const activeMode = ref<'move' | 'copy' | null>(null);
const actionTickets = ref<TicketItem[]>([]);


const resetSelection = () => {
    // 1) Reset mode action (MOVE / COPY)
    activeMode.value = null;
    actionTickets.value = [];

    // 2) Bỏ chọn tất cả vé đang được chọn local
    selectedTickets.value.forEach(t => {
        removeTicketFromFirebase(t);
        stopCountdown(t.id!);
    });

    selectedTickets.value = [];

    // 3) Xóa danh sách ghế local (nếu bạn có dùng)
    if (typeof handleClearAll === 'function') {
        handleClearAll();
    }

    // 4) Xóa trạng thái loading (nếu còn sót)
    loadingTickets.value = [];
};



// Số lượng vé đã book
const bookedTicketsCount = computed(() =>
    selectedTickets.value.filter(t => t.booked_status === true).length
);




const loadingTickets = ref<number[]>([]);



// Action: Huỷ vé


// Reset toàn bộ state
const resetActionState = () => {
    activeMode.value = null;
    actionTickets.value = [];
};

// Notify theo kiểu đẹp & tự động
const notifyAction = (mode: 'move' | 'copy') => {
    if (actionTickets.value.length === 0) return;

    const seatNames = actionTickets.value.map(t => t.seat_name).join(", ");
    const actionName = mode === 'move' ? "Di chuyển" : "Sao chép";

    notifySuccess(`${actionName} vé: ${seatNames}`);
};
const startAction = (mode: 'move' | 'copy') => {
    // Không chọn vé → không làm gì
    if (selectedTickets.value.length === 0) {
        notifyWarning("Bạn chưa chọn vé");
        return;
    }

    // Reset toàn bộ state trước khi bật mode mới
    resetActionState();

    // Bật mode mới
    activeMode.value = mode;

    // Snapshot danh sách vé
    actionTickets.value = [ ...selectedTickets.value ];

    // Notify
    notifyAction(mode);
};


// Kiểm tra xem vé có đang được chọn để MOVE
const isSelectedForMove = (ticket: TicketItem) => {
    return activeMode.value === 'move' &&
        actionTickets.value.some(t => t.id === ticket.id);
};




</script>

<template>
    <div v-if="loading" v-loading="loading" element-loading-text="Đang tải danh sách vé..."
        class="text-center py-8 text-gray-500 min-h-[200px]" />

    <div v-else class="space-y-6 ">
        <!-- {{ props.tickets }} -->
        <!-- Seat maps by floor - displayed horizontally LEFT TO RIGHT FULL WIDTH -->
        <div class="flex gap-3 w-full pb-4">
            <div v-for="floor in floors" :key="floor" class="flex-1">

                <!-- Grid layout cho hàng ghế -->
                <div class="space-y-1">


                    <!-- Each row -->
                    <div v-for="(row, rowIdx) in getFloorSeats(floor)" :key="rowIdx" class="grid gap-1 items-stretch"
                        :style="{ gridTemplateColumns: `repeat(${row.length}, 1fr)`, minHeight: '120px' }">

                        <!-- EACH CELL (LUÔN TỒN TẠI) -->
                        <div v-for="(ticket, colIdx) in row" :key="`${rowIdx}-${colIdx}`"
                            class="relative w-full h-full rounded-lg">

                            <!-- ================= GHẾ THẬT ================= -->
                            <div v-if="ticket"
                                @click="!isLockedByOther(ticket) && !isLoadingTicket(ticket) && handleClickTicket(ticket)"
                                class="relative border-2 rounded-lg overflow-hidden transition-shadow flex flex-col w-full h-full"
                                :class="[
                                    // 🔒 Bị người khác giữ
                                    isLockedByOther(ticket)
                                        ? 'border-red-400 cursor-not-allowed opacity-80'
                                        // 🔄 Đang update
                                        : isLoadingTicket(ticket)
                                            ? 'cursor-wait opacity-70'
                                            // ✅ Bình thường
                                            : 'cursor-pointer hover:shadow-lg',

                                    // 🎯 trạng thái chọn
                                    isSelectedForMove(ticket)
                                        ? 'border-transparent'
                                        : isTicketSelected(ticket)
                                            ? 'border-[#0072bc]'
                                            : 'border-gray-300'
                                ]" v-loading="isLoadingTicket(ticket)" element-loading-text="Đang cập nhật...">





                                <!-- BỊ CHỌN BỞI NGƯỜI KHÁC -->
                                <div v-if="isLockedByOther(ticket)" class="absolute inset-0 z-20">
                                    <!-- LỚP CHẶN CLICK (không cho click vé) -->
                                    <div class="absolute bottom-0 left-0 w-full h-[70%]
           bg-gray-200 bg-opacity-60
           pointer-events-none
           rounded-t"></div>

                                    <!-- LỚP NỘI DUNG (CHO CLICK) -->
                                    <div class="absolute bottom-0 left-0 w-full h-[70%]
           flex flex-col items-center justify-center
           text-gray-700 text-sm font-semibold
           z-30">
                                        <div class="text-center">
                                            {{ lockedUserName(ticket) || '' }}
                                        </div>

                                        <div class="mt-1">
                                            <el-button type="danger" size="small" :icon="Unlock" circle
                                                @click.stop="handleForceUnlock(ticket)" />
                                        </div>

                                        <div>
                                            <span class="text-[12px] text-red-600 font-semibold">
                                                {{ lockedRemainTime(ticket) }}
                                            </span>
                                        </div>
                                    </div>
                                </div>



                                <!-- ================= NỘI DUNG GHẾ ================= -->
                                <div class="p-1">
                                    <div class="flex items-center justify-between mb-1 gap-2">
                                        <span class="font-semibold text-[#339933] text-base">
                                            {{ ticket.seat?.name }}
                                        </span>

                                        <div v-if="ticket.booked_status">
                                            <el-tooltip :content="getContactStatusInfo(ticket.contact_status).label"
                                                placement="top" effect="dark">
                                                <div :class="[
                                                    'border-1 rounded px-1 border-gray-300 transition-colors cursor-help',
                                                    getContactStatusInfo(ticket.contact_status).color
                                                ]">
                                                    <span>{{ ticket.customer?.phone }}</span>
                                                </div>
                                            </el-tooltip>
                                        </div>
                                    </div>

                                    <div v-if="ticket.booked_status && ticket.customer?.name">
                                        <el-tooltip :content="ticket.customer?.name" placement="top" effect="dark">
                                            <span class="text-[15px] font-medium">{{ ticket.customer?.name }}</span>
                                        </el-tooltip>
                                    </div>

                                    <div v-if="ticket.booked_status">
                                        <div v-if="ticket.point?.point_up"
                                            class="flex items-center gap-1 text-gray-600">
                                            <el-icon color="#CC0000">
                                                <Location />
                                            </el-icon>
                                            <el-tooltip :content="ticket.point?.point_up" placement="top" effect="dark">
                                                <span class="text-[14px] font-medium line-clamp-1">
                                                    {{ ticket.point?.point_up }}
                                                </span>
                                            </el-tooltip>

                                        </div>

                                        <div v-if="ticket.point?.point_down"
                                            class="flex items-center gap-1 text-gray-600">
                                            <el-icon color="#0033FF">
                                                <Location />
                                            </el-icon>
                                            <el-tooltip :content="ticket.point?.point_down" placement="top"
                                                effect="dark">
                                                <span class="text-[14px] font-medium line-clamp-1">
                                                    {{ ticket.point?.point_down }}
                                                </span>
                                            </el-tooltip>
                                        </div>
                                    </div>
                                    <div v-if="ticket.booked_status" class="flex">
                                        <span class="ml-auto pr-1 text-[12px] font-medium text-gray-600">
                                            ({{ ticket.ticket_code }})
                                        </span>
                                    </div>

                                    <div v-if="ticket.booked_status && ticket.ticket_note" class="px-1">
                                        <span class="text-[14px] font-medium text-[#0072bc] line-clamp-2">
                                            * {{ ticket.ticket_note }}
                                        </span>
                                    </div>
                                </div>

                                <!-- ================= FOOTER ================= -->
                                <div class="mt-auto px-1 pt-1">


                                    <div v-if="ticket.booked_status">
                                        <div
                                            class="flex justify-between items-center text-[14px] font-medium text-gray-600">
                                            <span>
                                                {{ formatCurrencyWithoutSymbol(ticket.price?.money_paid || 0)
                                                }}/
                                                {{ formatCurrencyWithoutSymbol((ticket.price?.total_price || 0) +
                                                    (ticket.price?.surcharge || 0))
                                                }}
                                            </span>
                                            <span class="text-[12px]">{{ ticket.price?.payment_method }}</span>
                                        </div>
                                        <div class="h-[5px] bg-[#0072bc] rounded-lg" />
                                    </div>

                                    <div v-if="ticket.booked_status">
                                        <el-tooltip
                                            :content="ticket.user_created?.name + ' / ' + ticket.office_created?.name"
                                            placement="top" effect="dark">
                                            <span class="text-[12px] text-gray-600 line-clamp-1">P: {{
                                                ticket.user_created?.name }} / {{ ticket.office_created?.name }}</span>
                                        </el-tooltip>

                                    </div>
                                </div>

                            </div>
                            <!-- ================= Ô TRỐNG ================= -->
                            <div v-else class="w-full" />

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

            <!-- ================== MODE MOVE ================== -->
            <div v-if="activeMode === 'move'"
                class="absolute -top-[70px] left-0 bg-white border border-gray-300 shadow-lg transition-all duration-300 rounded-xl min-w-[300px] max-w-[600px]">
                <!-- Header -->
                <div
                    class="flex items-center justify-between px-4 py-1 bg-blue-50 rounded-t-xl border-b border-gray-200">
                    <div class="flex items-center gap-2">
                        <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span class="text-sm font-semibold text-gray-700">Di chuyển vé</span>
                        <span class="text-xs text-gray-500">({{ selectedTickets.length }} vé)</span>
                    </div>

                    <el-icon @click="resetSelection"
                        class="cursor-pointer hover:text-red-500 hover:bg-red-50 p-1 rounded transition-all">
                        <CloseBold />
                    </el-icon>
                </div>

                <!-- List tickets -->
                <div class="px-4 py-2">
                    <div class="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                        <el-tag v-for="ticket in selectedTickets" :key="ticket.id" type="warning" effect="dark"
                            size="small" class="animate-fade-in">
                            <span class="text-sm font-medium">{{ ticket.seat?.name }}</span>
                        </el-tag>
                    </div>
                </div>
            </div>


            <!-- ================== MAIN BOTTOM BAR ================== -->
            <div class="bg-white border border-gray-300 shadow-md transition-transform duration-300 rounded-xl">
                <div class="flex items-stretch justify-between gap-4 h-full">

                    <!-- LEFT: Count -->
                    <div
                        class="bg-gray-100 px-4 py-2 rounded-l-xl text-sm font-medium text-gray-700 flex items-center justify-center flex-shrink-0">
                        <div class="flex items-center gap-x-2">
                            <el-icon class="cursor-pointer hover:text-red-500 transition"
                                @click="handleRemoveAllSelectedTickets">
                                <CloseBold />
                            </el-icon>
                            <span class="text-[16px]">
                                Số vé đang chọn:
                                <span class="text-[#FF9900]">{{ selectedTickets.length }}</span>
                            </span>
                        </div>
                    </div>

                    <!-- MIDDLE: Selected tickets -->
                    <div
                        class="px-4 py-3 text-sm text-blue-800 flex-1 flex flex-wrap gap-2 items-center rounded-none overflow-hidden">
                        <el-tag v-for="ticket in selectedTickets" :key="ticket.id" type="warning" effect="dark">
                            <span class="text-[15px]">{{ ticket.seat?.name }}</span>
                        </el-tag>
                    </div>

                    <!-- RIGHT: ACTION BUTTONS -->
                    <div
                        class="bg-purple-50 px-4 py-2 rounded-r-xl flex gap-2 items-center justify-center flex-shrink-0">



                        <!-- ========== COPY MODE ========== -->
                        <template v-if="bookedTicketsCount > 0">

                            <!-- Cancel Copy -->
                            <div v-if="activeModeTicket === 'COPY'">
                                <el-tooltip content="Huỷ sao chép vé" placement="top">
                                    <el-button type="info" :icon="CloseBold" circle @click="resetSelection" />
                                </el-tooltip>
                            </div>

                            <!-- Copy -->
                            <div>
                                <el-tooltip content="Sao chép vé" placement="top">
                                    <el-button color="#626aef" :icon="CopyDocument" circle
                                        @click="() => handleStartActionTicket('COPY')" />
                                </el-tooltip>
                            </div>

                            <!-- ========== MOVE MODE ========== -->
                            <div v-if="activeModeTicket === 'MOVE'">
                                <el-tooltip content="Huỷ di chuyển vé" placement="top">
                                    <el-button type="info" :icon="CloseBold" circle @click="resetSelection" />
                                </el-tooltip>
                            </div>

                            <div>
                                <el-tooltip content="Di chuyển vé" placement="top">
                                    <el-button type="primary" :icon="Rank" circle
                                        @click="() => handleStartActionTicket('MOVE')" />
                                </el-tooltip>
                            </div>

                            <!-- Cancel ticket -->
                            <div>
                                <el-tooltip content="Hủy vé" placement="top">
                                    <el-button type="danger" :icon="Delete" circle @click="handleCancelTickets" />
                                </el-tooltip>
                            </div>
                        </template>
                        <!-- Edit -->
                        <el-tooltip content="Cập nhật thông tin vé" placement="top">
                            <el-button type="success" :icon="Edit" circle @click="handleOpenDialogEditTicket" />
                        </el-tooltip>

                    </div>
                </div>
            </div>

        </div>



    </div>
    <DialogEditTicket v-model="dialogEditTicket" :tickets="selectedTickets" @closed="handleCloseDialogEditTicket"
        @save="handleUpdateTickets" />
</template>
<!-- VIỀN CHUYỂN GHẾ -->
<!-- <svg v-if="isSelectedForMove(ticket)" viewBox="0 0 calc(100% + 4px) calc(100% + 4px)"
                                    class="absolute -top-0.5 -left-0.5 w-[calc(100%+4px)] h-[calc(100%+4px)] pointer-events-none z-20">
                                    <rect x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)" rx="6" ry="6"
                                        fill="none" stroke="#0072bc" stroke-width="4" stroke-dasharray="8 4">
                                        <animate attributeName="stroke-dashoffset" values="0;12" dur="1s"
                                            repeatCount="indefinite" />
                                    </rect>
                                </svg> -->