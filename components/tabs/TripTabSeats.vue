<!-- eslint-disable @typescript-eslint/no-dynamic-delete -->
<script setup lang="ts">
import type { DTO_RQ_Ticket, TicketItem } from '~/types/ticket/ticket.interface'
import { computed } from 'vue'
import { Location, Unlock, Delete, Edit, Rank, CloseBold, CopyDocument } from '@element-plus/icons-vue'
import { formatCurrencyWithoutSymbol } from '~/lib/formatCurrency'
import { listItemTrip, valueSelectedTrip } from '~/composables/trip/useTripGlobal';
import EditTicketDialog from '~/components/dialog/EditTicketDialog.vue'
import { API_CancelTickets, API_GetTicketByTripId, API_MoveTickets, API_UpdateTickets } from '~/api/booking-service/ticket/bms_ticket.api';


import { API_GetTripSummaryById } from '~/api/booking-service/trip/bms_trip.api';
import { listItemTicket } from '~/composables/ticket/useTicketGlobal';


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
        .sort((a, b) => a[0] - b[0])
})

const floors = computed(() => {
    return ticketsByFloor.value.map(item => item[0])
})

// Lấy ghế theo row/column trong một tầng
const getFloorSeats = (floor: number) => {
    const floorTickets = props.tickets.filter(t => t.seat_floor === floor)

    if (floorTickets.length === 0) return []

    const maxRow = Math.max(...floorTickets.map(t => t.seat_row ?? 0))
    const maxCol = Math.max(...floorTickets.map(t => t.seat_column ?? 0))

    const seats: (TicketItem | null)[][] = []

    for (let r = 1; r <= maxRow; r++) {
        seats[r - 1] = []
        for (let c = 1; c <= maxCol; c++) {
            const ticket = floorTickets.find(
                t => t.seat_row === r && t.seat_column === c
            )
            seats[r - 1][c - 1] = ticket || null
        }
    }

    return seats
}
const allTickets = ref<TicketItem[]>([]);
const getContactStatusInfo = (status: number | null | undefined) => {
    return CONTACT_STATUSES.find(s => s.value === status) || CONTACT_STATUSES[0]
}

const { $firebase } = useNuxtApp();
const useUserStore = userStore();
const useOffice = useOfficeStore();
const selectedTickets = ref<TicketItem[]>([]); // Vé user hiện tại chọn

const isMoveTickets = ref(false);
const listMoveTickets = ref<TicketItem[]>([]);

const isCopyTickets = ref(false);
const listCopyTickets = ref<TicketItem[]>([]);

// --- Clear all local selected (and unselect on firebase) ---
const handleClearAll = () => {
    selectedTickets.value.forEach(t => removeTicketFromFirebase(t))
    selectedTickets.value = []
    isMoveTickets.value = false;
    listMoveTickets.value = [];
}

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
const removeTicketFromFirebase = (ticket: TicketItem, tripId?: number) => {
    const tid = tripId ?? ticket.trip_id;
    const ref = $firebase.ref($firebase.db, `tickets/${tid}/${ticket.id}`);
    $firebase.remove(ref);
};






// Bắt đầu countdown cho ticket
interface TicketCountdown {
    [ticketId: number]: number; // thời gian còn lại tính bằng giây
}

interface TicketInterval {
    [ticketId: number]: number; // lưu ID interval để clear
}

const countdowns = reactive<TicketCountdown>({});
const intervals: TicketInterval = {};

// Bắt đầu countdown cho 1 vé
const startCountdown = (ticketId: number) => {
    // Reset countdown 10 phút
    countdowns[ticketId] = 10 * 60;

    // Nếu vé này đã có interval thì clear trước
    if (intervals[ticketId]) {
        clearInterval(intervals[ticketId]);
    }

    // Tạo interval riêng cho vé này
    intervals[ticketId] = window.setInterval(() => {
        if (countdowns[ticketId] > 0) {
            countdowns[ticketId]--;
        } else {
            // Hết countdown -> bỏ chọn vé
            stopCountdown(ticketId);
            const ticket = allTickets.value.find(t => t.id === ticketId);
            if (ticket && isTicketSelected(ticket)) {
                removeLocalSelected(ticket);
                removeTicketFromFirebase(ticket); // nếu muốn đồng bộ Firebase
            }
            clearInterval(intervals[ticketId]);
            delete intervals[ticketId];
        }
    }, 1000);
};

// Dừng countdown (bỏ chọn)
const stopCountdown = (ticketId: number) => {
    countdowns[ticketId] = 0;
    if (intervals[ticketId]) {
        clearInterval(intervals[ticketId]);
        delete intervals[ticketId];
        isMoveTickets.value = false;
        listMoveTickets.value = [];
    }
};



const MODES = {
    MOVE: 'move',
    COPY: 'copy',
    NONE: null
};

const activeMode = ref<'move' | 'copy' | null>(null);
const actionTickets = ref<TicketItem[]>([]);

// --- Click handler ---
const handleSeatClick = async (ticket: TicketItem) => {
    if (!ticket?.id || !ticketsRef.value) return;

    const currentlySelected = isTicketSelected(ticket);
    const phone = ticket.phone?.trim();
    const userFullName = useUserStore.full_name || "N/A";

    // ====================== MODE MOVE ======================
    // ====================== MODE MOVE ======================
    if (activeMode.value === MODES.MOVE) {
        if (ticket.booked_status) {
            notifyWarning("Ghế này đã có người đặt!");
            return;
        }

        const oldTicket = actionTickets.value.shift();
        if (!oldTicket?.id) {
            notifyError("Vé nguồn không hợp lệ.");
            return;
        }

        try {
            loadingTickets.value.push(ticket.id);

            const response = await API_MoveTickets(
                valueSelectedTrip.value?.id || 0,
                oldTicket.id,
                ticket.id
            );

            if (!response.success) {
                notifyError(response.message || "Di chuyển vé thất bại.");
                actionTickets.value.unshift(oldTicket);
                return;
            }

            const { newTicket, oldTicket: resetOld } = response.result;

            const oldTripId = Number(resetOld.trip_id);
            const newTripId = Number(newTicket.trip_id);

            // ============================================================
            // 🔥🔥 FIREBASE SYNC — CHUẨN NHẤT
            // ============================================================

            // 1) PUSH VÉ CŨ ĐÃ RESET LÊN TRIP CŨ
            // 1) XÓA node realtime cũ hoàn toàn (tránh bị click lại)
            const oldRealtimeRef = $firebase.ref(
                $firebase.db,
                `tickets/${oldTripId}/${resetOld.id}`
            );
            $firebase.remove(oldRealtimeRef);

            // 2) Tạo realtime node mới cho newTicket (không đẩy full info lên)
            const newRealtimeRef = $firebase.ref(
                $firebase.db,
                `tickets/${newTripId}/${newTicket.id}`
            );
            $firebase.set(newRealtimeRef, {
                selected: false,
                selectedBy: null,
                countdown: null,
                updatedAt: Date.now()
            });



            // 2) PUSH VÉ MỚI ĐÃ ĐƯỢC COPY INF0 LÊN TRIP MỚI
            const newRef = $firebase.ref(
                $firebase.db,
                `tickets/${newTripId}/${newTicket.id}`
            );

            $firebase.set(newRef, {
                ...newTicket,
                selected: false,
                selectedBy: null,
                countdown: null,
                updatedAt: Date.now()
            });

            // ============================================================
            // 🔥🔥 LOCAL UI UPDATE
            // ============================================================

            // Xóa selected local vé cũ
            removeLocalSelected(resetOld);
            stopCountdown(resetOld.id);
            selectedTickets.value = selectedTickets.value.filter(t => t.id !== resetOld.id);

            // Update UI local 2 vé
            updateTicketsOnUI(newTicket, resetOld);

            // ============================================================
            // 🔥🔥 UPDATE SUMMARY LOCAL
            // ============================================================
            await updateTripSummaryAfterMove(oldTripId, newTripId);

            // ============================================================
            // 🔥🔥 REFRESH NẾU ĐANG ĐỨNG TRONG TRIP ĐÓ
            // ============================================================
            const currentTripId = Number(valueSelectedTrip.value?.id);

            if (currentTripId === oldTripId) {
                await refreshTicketListForTrip(oldTripId);
            }
            if (currentTripId === newTripId) {
                await refreshTicketListForTrip(newTripId);
            }

            notifySuccess(`Đã di chuyển ${resetOld.seat_name} → ${newTicket.seat_name}`);

            if (actionTickets.value.length === 0) {
                resetSelection();
            }

        } catch (err) {
            console.error("MOVE ERROR:", err);
            actionTickets.value.unshift(oldTicket);
            notifyError("Không thể di chuyển vé.");
        } finally {
            loadingTickets.value = loadingTickets.value.filter(id => id !== ticket.id);
        }

        return;
    }


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

const updateTicketsOnUI = (newTicket: TicketItem, resetOldTicket: TicketItem) => {
    const currentTripId = Number(valueSelectedTrip.value?.id);

    listItemTicket.value = listItemTicket.value
        .map(t => {
            if (t.id === newTicket.id) return { ...t, ...newTicket };
            if (t.id === resetOldTicket.id) return { ...t, ...resetOldTicket };
            return t;
        })
        // ❗ Loại bỏ vé KHÔNG thuộc trip đang xem
        .filter(t => Number(t.trip_id) === currentTripId);
};




const refreshTicketListForTrip = async (tripId: number) => {
    try {
        const res = await API_GetTicketByTripId(tripId);
        if (res.success && res.result) {
            listItemTicket.value = res.result;
        }
    } catch (err) {
        console.error("Lỗi tải danh sách vé:", err);
    }
};

const updateTripSummaryAfterMove = async (oldTripId: number, newTripId: number) => {
    try {
        const [oldRes, newRes] = await Promise.all([
            API_GetTripSummaryById(oldTripId),
            API_GetTripSummaryById(newTripId),
        ]);

        if (!oldRes.success || !newRes.success) return;

        const oldData = oldRes.result;
        const newData = newRes.result;

        // ===== 1. UPDATE listItemTrip (sidebar + list trips) =====
        listItemTrip.value = listItemTrip.value.map(trip => {
            const tid = Number(trip.id);

            if (tid === oldTripId) {
                return {
                    ...trip,
                    total_booked: oldData.total_booked,
                    total_price: oldData.total_price,
                    money_paid: oldData.money_paid,
                    total_surcharge: oldData.total_surcharge
                };
            }

            if (tid === newTripId) {
                return {
                    ...trip,
                    total_booked: newData.total_booked,
                    total_price: newData.total_price,
                    money_paid: newData.money_paid,
                    total_surcharge: newData.total_surcharge
                };
            }

            return trip;
        });

        // ===== 2. UPDATE TRIP ĐANG ĐƯỢC SELECT =====
        if (valueSelectedTrip.value) {
            const current = Number(valueSelectedTrip.value.id);

            if (current === oldTripId) {
                Object.assign(valueSelectedTrip.value, {
                    total_booked: oldData.total_booked,
                    total_price: oldData.total_price,
                    money_paid: oldData.money_paid,
                    total_surcharge: oldData.total_surcharge
                });
            }

            if (current === newTripId) {
                Object.assign(valueSelectedTrip.value, {
                    total_booked: newData.total_booked,
                    total_price: newData.total_price,
                    money_paid: newData.money_paid,
                    total_surcharge: newData.total_surcharge
                });
            }
        }

        // DEBUG
        console.log("----- SUMMARY UPDATE CHECK -----");
        console.log("valueSelectedTrip AFTER:", JSON.parse(JSON.stringify(valueSelectedTrip.value)));
        console.log("listItemTrip AFTER:", JSON.parse(JSON.stringify(listItemTrip.value)));

    } catch (err) {
        console.error("❌ updateTripSummaryAfterMove error:", err);
        notifyError("Không thể cập nhật thông tin chuyến. Vui lòng tải lại trang.");
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


// watch(tripId, (newTripId, oldTripId) => {
//     console.log("🔥 Trip changed → re-sync Firebase");

//     // Tắt listener cũ
//     if (oldTripId) {
//         const oldRef = $firebase.ref($firebase.db, `tickets/${oldTripId}`);
//         $firebase.off(oldRef);
//     }

// })

// lifecycle
onMounted(() => {
    syncAllTickets()
})

onBeforeUnmount(() => {
    if (ticketsRef.value) {
        // Tắt listener
        $firebase.off(ticketsRef.value);

        const user = useUserStore.full_name;

        allTickets.value.forEach(t => {
            if (t.selectedBy === user) {
                removeTicketFromFirebase(t); // 🔥 truyền đúng từng ticket
            }
        });
    }
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
    actionTickets.value = [...selectedTickets.value];

    // Notify
    notifyAction(mode);
};

// Move Tickets
const handleMoveTickets = () => startAction('move');
const handleCancelMoveTickets = () => {
    if (activeMode.value === 'move') resetActionState();
};

// Copy Tickets
const handleCopyTickets = () => startAction('copy');
const handleCancelCopyTickets = () => {
    if (activeMode.value === 'copy') resetActionState();
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

                                <div v-if="ticket" @click="ticket.seat_status ? handleSeatClick(ticket) : null"
                                    class="relative w-full h-full min-h-[120px] border-2 rounded-lg overflow-hidden transition-shadow flex flex-col"
                                    :class="[
                                        !ticket.seat_status
                                            ? 'border-none pointer-events-none opacity-40'
                                            : isSelectedForMove(ticket)
                                                ? 'border-transparent cursor-pointer hover:shadow-lg'
                                                : isTicketSelected(ticket)
                                                    ? 'border-[#0072bc] cursor-pointer hover:shadow-lg'
                                                    : 'border-gray-300 cursor-pointer hover:shadow-lg'
                                    ]" v-loading="ticket.id != null && loadingTickets.includes(ticket.id)"
                                    element-loading-text="Đang cập nhật...">

                                    <svg v-if="isSelectedForMove(ticket)"
                                        viewBox="0 0 calc(100% + 4px) calc(100% + 4px)"
                                        class="absolute -top-0.5 -left-0.5 w-[calc(100%+4px)] h-[calc(100%+4px)] pointer-events-none z-21">
                                        <rect x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)" rx="6"
                                            ry="6" fill="none" stroke="#0072bc" stroke-width="4" stroke-dasharray="8 4">
                                            <animate attributeName="stroke-dashoffset" values="0;12" dur="1s"
                                                repeatCount="indefinite" />
                                        </rect>
                                    </svg>

                                    <!-- Header -->
                                    <div v-if="isTicketBeingSelectedByAnyone(ticket)"
                                        class="absolute bottom-0 left-0 w-full h-[70%] bg-gray-200 bg-opacity-50 flex flex-col items-center justify-center text-gray-700 text-sm font-semibold z-20 pointer-events-none rounded-t">

                                        <div>{{ getTicketSelectedBy(ticket) || 'N/A' }}</div>
                                        <div v-if="ticket.id != null && countdowns[ticket.id] !== undefined"
                                            class="mt-1">
                                            {{ Math.floor(countdowns[ticket.id] / 60) }}:
                                            {{ String(countdowns[ticket.id] % 60).padStart(2, '0') }}
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
                                                    <div :class="['border-1 rounded px-1 border-gray-300 transition-colors cursor-help',
                                                        getContactStatusInfo(ticket.contact_status).color]">
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
                                                <span>{{ formatCurrencyWithoutSymbol(ticket.money_paid || 0) }}/{{
                                                    formatCurrencyWithoutSymbol(ticket.total_price || 0)
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

            <!-- ================== MODE MOVE ================== -->
            <div v-if="activeMode === 'move'"
                class="absolute -top-[70px] left-0 bg-white border border-gray-300 shadow-lg transition-all duration-300 rounded-xl min-w-[300px] max-w-[600px]">
                <!-- Header -->
                <div
                    class="flex items-center justify-between px-4 py-1 bg-blue-50 rounded-t-xl border-b border-gray-200">
                    <div class="flex items-center gap-2">
                        <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span class="text-sm font-semibold text-gray-700">Di chuyển vé</span>
                        <span class="text-xs text-gray-500">({{ actionTickets.length }} vé)</span>
                    </div>

                    <el-icon @click="resetSelection"
                        class="cursor-pointer hover:text-red-500 hover:bg-red-50 p-1 rounded transition-all">
                        <CloseBold />
                    </el-icon>
                </div>

                <!-- List tickets -->
                <div class="px-4 py-2">
                    <div class="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                        <el-tag v-for="ticket in actionTickets" :key="ticket.id" type="warning" effect="dark"
                            size="small" class="animate-fade-in">
                            <span class="text-sm font-medium">{{ ticket.seat_name }}</span>
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
                            <el-icon class="cursor-pointer hover:text-red-500 transition" @click="resetSelection">
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
                            <span class="text-[15px]">{{ ticket.seat_name }}</span>
                        </el-tag>
                    </div>

                    <!-- RIGHT: ACTION BUTTONS -->
                    <div
                        class="bg-purple-50 px-4 py-2 rounded-r-xl flex gap-2 items-center justify-center flex-shrink-0">

                        <!-- Edit -->
                        <el-tooltip content="Cập nhật thông tin vé" placement="top">
                            <el-button type="warning" :icon="Edit" circle @click="handleOpenDialogEditTicket" />
                        </el-tooltip>

                        <!-- ========== COPY MODE ========== -->
                        <template v-if="bookedTicketsCount > 0">

                            <!-- Cancel Copy -->
                            <div v-if="activeMode === 'copy'">
                                <el-tooltip content="Huỷ sao chép vé" placement="top">
                                    <el-button type="info" :icon="CloseBold" circle @click="resetSelection" />
                                </el-tooltip>
                            </div>

                            <!-- Copy -->
                            <div>
                                <el-tooltip content="Sao chép vé" placement="top">
                                    <el-button color="#626aef" :icon="CopyDocument" circle
                                        @click="() => startAction('copy')" />
                                </el-tooltip>
                            </div>

                            <!-- ========== MOVE MODE ========== -->
                            <div v-if="activeMode === 'move'">
                                <el-tooltip content="Huỷ di chuyển vé" placement="top">
                                    <el-button type="info" :icon="CloseBold" circle @click="resetSelection" />
                                </el-tooltip>
                            </div>

                            <div>
                                <el-tooltip content="Di chuyển vé" placement="top">
                                    <el-button type="primary" :icon="Rank" circle @click="() => startAction('move')" />
                                </el-tooltip>
                            </div>

                            <!-- Cancel ticket -->
                            <div>
                                <el-tooltip content="Hủy vé" placement="top">
                                    <el-button type="danger" :icon="Delete" circle @click="handleCancelTickets" />
                                </el-tooltip>
                            </div>
                        </template>

                    </div>
                </div>
            </div>

        </div>



    </div>
    <EditTicketDialog v-model="dialogEditTicket" :selected-tickets="selectedTickets"
        @closed="handleCloseDialogEditTicket" @save="handleUpdateTickets" />
</template>
