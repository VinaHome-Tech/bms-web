import { ref } from "vue";
import { API_UpdateTickets } from "~/services/booking-service/ticket/bms-ticket.api";
import { listTicket, localSelectedTickets } from "./useTicketGlobal";
import { valueSelectedTrip } from "../trip/useTripGlobal";
// import { useTicketLocal } from "./useTicketLocal";
import type { TicketItem } from "~/types/ticket/ticket.interface";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const useTicketActions = () => {
    // const {
    //     listItemTicket
    // } = useTicketList();
    // const {
    //     handleClearLocalSelectedTickets
    // } = useTicketLocal();
    const useUserStore = userStore();
    // const useOffice = useOfficeStore();
    // const dialogEditTicket = ref(false);
    // const handleOpenDialogEditTicket = () => {
    //     dialogEditTicket.value = true;
    // };
    // const handleCloseDialogEditTicket = () => {
    //     console.log('Closing Edit Ticket Dialog');
    //     dialogEditTicket.value = false;
    // };
    // const loadingItemTicket = ref(false);
    // const allTicketsFromFirebase = ref<TicketItem[]>([]);
    // const conflictedTicketIds = new Set<string | number>();
    // const { $firebase } = useNuxtApp();
    // const isSyncing = ref(false);
    // const syncError = ref<string | null>(null);
    // const selectedTicketsPath = computed(() => {
    //     try {
    //         const companyID = useUserStore.company_id;
    //         const tripID = valueSelectedTrip.value?.id;
    //         return `${companyID}/trips/${tripID}/selected_tickets`;
    //     } catch (error) {
    //         console.error("Error computing path:", error);
    //         return null;
    //     }
    // });
    // const handlex = async () => {
    //     try {
    //         // ✅ Kiểm tra nếu không có vé nào để xóa
    //         if (localSelectedTickets.value.length === 0) {
    //             notifyWarning("Bạn chưa chọn vé nào để xóa");
    //             return;
    //         }

    //         console.log("Clearing tickets for current user only...");

    //         // ✅ Lấy vé của user khác để giữ lại
    //         const otherUsersTickets = allTicketsFromFirebase.value.filter(
    //             (ticket) => ticket.selected_by_id !== useUserStore.id
    //         );

    //         console.log("Other users tickets:", otherUsersTickets);

    //         // Xóa local tickets
    //         localSelectedTickets.value = [];

    //         // ✅ Gọi hàm clearFirebaseTickets để xóa chỉ vé của user này
    //         // clearFirebaseTickets will return the ids that were removed so caller can update local UI
    //         const removedIds = await clearFirebaseTickets();
    //         console.log("✅ Cleared only current user's tickets from Firebase", { removedIds });

    //         // ✅ Cập nhật allTicketsFromFirebase chỉ còn vé của user khác
    //         allTicketsFromFirebase.value = otherUsersTickets;

    //         // ✅ Clear conflicted tickets khi xóa tất cả
    //         conflictedTicketIds.clear();

    //         notifySuccess("Đã xóa tất cả vé của bạn");

    //         return removedIds;
    //     } catch (error) {
    //         console.error("❌ Error clearing tickets:", error);
    //         notifyError("Xóa vé thất bại");
    //     }


    // }
    // const clearFirebaseTickets = async () => {
    //     try {
    //         isSyncing.value = true;
    //         syncError.value = null;

    //         if (!selectedTicketsPath.value) {
    //             throw new Error("Firebase path không hợp lệ");
    //         }

    //         const ticketsRef = $firebase.ref($firebase.db, selectedTicketsPath.value);

    //         // Lấy dữ liệu hiện tại
    //         const snapshot = await new Promise((resolve: any) => {
    //             $firebase.onValue(
    //                 ticketsRef,
    //                 (snap: any) => {
    //                     resolve(snap);
    //                     $firebase.off(ticketsRef);
    //                 },
    //                 () => resolve(null)
    //             );
    //         });

    //         if (snapshot && typeof (snapshot as any).exists === "function" && (snapshot as any).exists()) {
    //             const data = (snapshot as any).val();
    //             const existingTickets = data.tickets || [];

    //             // ✅ Xóa chỉ vé của user này, giữ vé của user khác
    //             const filteredTickets = existingTickets.filter(
    //                 (t: any) => t.selected_by_id !== useUserStore.id
    //             );

    //             // IDs that belong to current user and were removed
    //             const removedIds = existingTickets
    //                 .filter((t: any) => t.selected_by_id === useUserStore.id)
    //                 .map((t: any) => t.id)
    //             ;

    //             // ✅ Nếu không còn vé nào, xóa path
    //             if (filteredTickets.length === 0) {
    //                 await $firebase.remove(ticketsRef);
    //                 console.log("✅ No tickets left, removed path from Firebase");
    //             } else {
    //                 await $firebase.set(ticketsRef, {
    //                     tickets: filteredTickets,
    //                     count: filteredTickets.length,
    //                     lastUpdated: new Date().toISOString(),
    //                 });
    //                 console.log("✅ Cleared tickets for current user only");
    //             }
    //             return removedIds;
    //         }

    //         return true;
    //     } catch (error) {
    //         const errorMsg = error instanceof Error ? error.message : "Clear failed";
    //         console.error("❌ Error clearing Firebase tickets:", error);
    //         syncError.value = errorMsg;
    //         throw error;
    //     } finally {
    //         isSyncing.value = false;
    //     }
    // };
    // const handleUpdateTickets = async (data: any) => {
    //     console.log('Updating tickets', data);
    //     loadingItemTicket.value = true;

    //     try {
    //         const ids = localSelectedTickets.value
    //             .map(ticket => ticket.id)
    //             .filter((id): id is number => id !== undefined && id !== null);
    //         const tripID = valueSelectedTrip.value?.id;

    //         if (tripID === undefined || tripID === null) {
    //             notifyError('Dữ liệu chuyến không hợp lệ. Vui lòng thử lại.');
    //             return;
    //         }

    //         const user = {
    //             user_id: useUserStore.id,
    //             user_name: useUserStore.full_name,
    //             office_id: useOffice.id,
    //             office_name: useOffice.name
    //         }

    //         const response = await API_UpdateTickets(tripID, ids, data, user);

    //         if (response.success) {
    //             // ✅ 1. Cập nhật UI trước
    //             const updatedTicketsData = response.result || response;
    //             if (updatedTicketsData && Array.isArray(updatedTicketsData)) {
    //                 updatedTicketsData.forEach(updatedTicket => {
    //                     const index = listTicket.value.findIndex(
    //                         ticket => ticket.id === updatedTicket.id
    //                     );
    //                     if (index !== -1) {
    //                         listTicket.value[ index ] = {
    //                             ...listTicket.value[ index ],
    //                             ...updatedTicket
    //                         };
    //                     }
    //                 });
    //             }

    //             // ✅ 2. Đợi Firebase clear xong và lấy danh sách ticket id đã bị gỡ
    //             const removedIds = await handlex(); // 👈 AWAIT quan trọng; removedIds is array of ids

    //             // ✅ 3. Clear selected_by_* fields in local list so UI updates immediately
    //             if (Array.isArray(removedIds) && removedIds.length > 0) {
    //                 const removedSet = new Set(removedIds);
    //                 listTicket.value = listTicket.value.map(t => {
    //                     if (removedSet.has(t.id)) {
    //                         return {
    //                             ...t,
    //                             // use undefined to match TicketItem types
    //                             selected_by_id: undefined,
    //                             selected_by_name: undefined
    //                         } as TicketItem;
    //                     }
    //                     return t;
    //                 });
    //             }

    //             // ✅ 4. Clear local selection SAU KHI Firebase thành công
    //             localSelectedTickets.value = [];

    //             notifySuccess('Cập nhật vé thành công!');

    //         } else {
    //             notifyError(response.message || 'Cập nhật vé thất bại.');
    //         }
    //     } catch (error) {
    //         console.error('Error updating tickets:', error);
    //         notifyError('Đã có lỗi xảy ra khi cập nhật vé.');
    //     } finally {
    //         loadingItemTicket.value = false;
    //     }
    // }

    return {
        // dialogEditTicket,
        // handleOpenDialogEditTicket,
        // handleCloseDialogEditTicket,
        // // handleUpdateTickets,
        // loadingItemTicket

    }
}


