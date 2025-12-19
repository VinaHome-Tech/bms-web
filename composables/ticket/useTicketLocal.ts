// /* eslint-disable @typescript-eslint/no-explicit-any */
// import type { TicketItem } from "~/types/ticket/ticket.interface";
// import { useTicketFirebase } from "./useTicketFirebase";
// import { localSelectedTickets } from "./useTicketGlobal";
// import { useTicketList } from "./useTicketList";

// export const useTicketLocal = () => {
    
//     // ✅ Tất cả vé từ tất cả user trong chuyến (từ Firebase)
//     const allTicketsFromFirebase = ref<TicketItem[]>([]);

//     const useUserStore = userStore();
//     const {
//         syncLocalTicketsToFirebase,
//         clearFirebaseTickets,
//         listenToFirebaseTickets,
//         deleteTicketFromFirebase
//     } = useTicketFirebase();

//     // Access the main ticket list so we can merge firebase selection state into UI
//     const { listItemTicket } = useTicketList();

//     // ✅ Listener để cập nhật từ Firebase
//     let firebaseUnsubscribe: (() => void) | null = null;
    
//     // ✅ Track vé đã bị conflict để tránh tự động chọn lại
//     const conflictedTicketIds = new Set<string | number>();

//     // ✅ Kiểm tra xung đột vé - nếu vé của mình bị chọn bởi user khác
//     const checkTicketConflicts = (firebaseTickets: TicketItem[]) => {
//         console.log("🔍 Checking ticket conflicts...");
        
//         const conflictedTickets: any[] = [];

//         // Kiểm tra từng vé của user hiện tại
//         localSelectedTickets.value.forEach((myTicket) => {
//             const ticketInFirebase = firebaseTickets.find(
//                 (t) => String(t.id) === String(myTicket.id)
//             );

//             // Nếu vé đã được chọn bởi user khác
//             if (ticketInFirebase && ticketInFirebase.selected_by_id !== useUserStore.id) {
//                 console.log("❌ Ticket conflict found:", myTicket.id);
//                 conflictedTickets.push({
//                     ticketId: myTicket.id,
//                     selectedBy: ticketInFirebase.selected_by_name || ticketInFirebase.selected_by_username,
//                 });
//             }
//         });

//         // ✅ Nếu có xung đột, bỏ chọn những vé xung đột
//         if (conflictedTickets.length > 0) {
//             console.log("⚠️ Found conflicts, removing conflicted tickets...");
            
//             conflictedTickets.forEach((conflict) => {
//                 const index = localSelectedTickets.value.findIndex(
//                     (item) => String(item.id) === String(conflict.ticketId)
//                 );
//                 if (index !== -1) {
//                     localSelectedTickets.value.splice(index, 1);
//                 }
//             });

//             // ✅ Xóa vé xung đột khỏi Firebase luôn
//             try {
//                 for (const conflict of conflictedTickets) {
//                     deleteTicketFromFirebase(conflict.ticketId).catch(error => {
//                         console.error("Error removing conflicted ticket:", error);
//                     });
                    
//                     // ✅ Thêm vào set để tránh tự động chọn lại
//                     conflictedTicketIds.add(conflict.ticketId);
//                 }
//             } catch (error) {
//                 console.error("❌ Error removing conflicted tickets from Firebase:", error);
//             }

//             // Hiển thị thông báo cảnh báo
//             const names = conflictedTickets.map(c => c.selectedBy).join(", ");
//             notifyWarning(`Vé của bạn đã bị ${names} chọn. Vé của bạn đã được bỏ chọn.`);
//         }
//     };

//     // ✅ Kiểm tra vé có được chọn bởi user khác không
//     const isTicketSelectedByOther = (ticket: TicketItem): boolean => {
//         const firebaseTicket = allTicketsFromFirebase.value.find(
//             (t) => String(t.id) === String(ticket.id)
//         );
//         // ✅ Nếu vé bị conflict trước đó thì cũng coi như bị user khác chọn
//         if (conflictedTicketIds.has(ticket.id!)) {
//             return true;
//         }
//         return firebaseTicket ? firebaseTicket.selected_by_id !== useUserStore.id : false;
//     };

//     // ✅ Lấy thông tin user đang chọn vé này
//     const getTicketSelectedByInfo = (ticket: TicketItem): { id: string; name: string; username: string } | null => {
//         const firebaseTicket = allTicketsFromFirebase.value.find(
//             (t) => String(t.id) === String(ticket.id)
//         );
        
//         if (firebaseTicket && firebaseTicket.selected_by_id !== useUserStore.id) {
//             return {
//                 id: firebaseTicket.selected_by_id || "",
//                 name: firebaseTicket.selected_by_name || "",
//                 username: firebaseTicket.selected_by_username || "",
//             };
//         }
//         return null;
//     };

//     // Thêm hoặc bỏ chọn vé + sync Firebase
//     const handleAddLocalSelectedTicket = async (ticket: TicketItem) => {
//         console.log("Adding ticket to local selected tickets:", ticket);

//         const index = localSelectedTickets.value.findIndex(
//             (item) => item.id === ticket.id
//         );

//         // ✅ Kiểm tra xung đột trước khi thêm vé
//         const ticketInFirebase = allTicketsFromFirebase.value.find(
//             (t) => String(t.id) === String(ticket.id)
//         );

//         if (index === -1) {
//             // Kiểm tra nếu vé đã được user khác chọn
//             if (ticketInFirebase && ticketInFirebase.selected_by_id !== useUserStore.id) {
//                 console.log("❌ Cannot select - ticket already selected by another user");
//                 notifyError(
//                     `Vé này đã được ${ticketInFirebase.selected_by_name || ticketInFirebase.selected_by_username} chọn rồi!`
//                 );
//                 return;
//             }

//             // ✅ Kiểm tra xem vé có trong danh sách conflict không
//             if (conflictedTicketIds.has(ticket.id!)) {
//                 console.log("❌ Cannot select - ticket was conflicted before");
//                 notifyError(`Vé này không thể chọn!`);
//                 return;
//             }

//             // ✅ Kiểm tra số lượng vé đã chọn (tránh abuse)
//             if (localSelectedTickets.value.length >= 50) {
//                 notifyWarning("Bạn đã chọn quá nhiều vé (tối đa 50 vé)");
//                 return;
//             }

//             // Thêm vé với user info
//             const ticketWithUserInfo = {
//                 ...ticket,
//                 selected_by_id: useUserStore.id || "",
//                 selected_by_name: useUserStore.full_name || "",
//                 selected_by_username: useUserStore.username || "",
//             };
//             localSelectedTickets.value.push(ticketWithUserInfo);
//             console.log("Added ticket:", ticketWithUserInfo);
//             notifySuccess(`Đã chọn vé ${ticket.seat_name || ticket.id}`);
//         } else {
//             localSelectedTickets.value.splice(index, 1);
//             console.log("Removed ticket");
//             notifySuccess(`Đã bỏ chọn vé ${ticket.seat_name || ticket.id}`);
//         }

//         console.log("Updated local tickets:", localSelectedTickets.value);

//         // Sync lên Firebase
//         try {
//             await syncLocalTicketsToFirebase(localSelectedTickets.value);
//             console.log("✅ Synced to Firebase");

//             // ✅ Sau khi sync, lắng nghe Firebase để cập nhật UI
//             setupFirebaseListener();
//         } catch (error) {
//             console.error("Failed to sync ticket:", error);
//             notifyError("Đồng bộ vé thất bại");
//         }
//     };

//     // ✅ Xóa tất cả vé của user hiện tại + xóa trên Firebase (giữ vé của user khác)
//     const handleClearLocalSelectedTickets = async () => {
//         try {
//             // ✅ Kiểm tra nếu không có vé nào để xóa
//             if (localSelectedTickets.value.length === 0) {
//                 notifyWarning("Bạn chưa chọn vé nào để xóa");
//                 return;
//             }

//             console.log("Clearing tickets for current user only...");

//             // ✅ Lấy vé của user khác để giữ lại
//             const otherUsersTickets = allTicketsFromFirebase.value.filter(
//                 (ticket) => ticket.selected_by_id !== useUserStore.id
//             );

//             console.log("Other users tickets:", otherUsersTickets);

//             // Xóa local tickets
//             localSelectedTickets.value = [];

//             // ✅ Gọi hàm clearFirebaseTickets để xóa chỉ vé của user này
//             await clearFirebaseTickets();
//             console.log("✅ Cleared only current user's tickets from Firebase");

//             // ✅ Cập nhật allTicketsFromFirebase chỉ còn vé của user khác
//             allTicketsFromFirebase.value = otherUsersTickets;
            
//             // ✅ Clear conflicted tickets khi xóa tất cả
//             conflictedTicketIds.clear();

//             notifySuccess("Đã xóa tất cả vé của bạn");
//         } catch (error) {
//             console.error("❌ Error clearing tickets:", error);
//             notifyError("Xóa vé thất bại");
//         }
//     };

//     // ✅ Kiểm tra vé có được chọn bởi user hiện tại không
//     const ticketsAreBeingSelected = (ticket: TicketItem): boolean => {
//         return localSelectedTickets.value.some(
//             (item) => item.id === ticket.id
//         );
//     };

//     // ✅ Merge ticket gốc với Firebase info
//     const getTicketWithFirebaseInfo = (ticket: TicketItem): TicketItem => {
//         const firebaseTicket = allTicketsFromFirebase.value.find((t) => t.id === ticket.id);

//         if (firebaseTicket) {
//             return {
//                 ...ticket,
//                 selected_by_id: firebaseTicket.selected_by_id,
//                 selected_by_name: firebaseTicket.selected_by_name,
//                 selected_by_username: firebaseTicket.selected_by_username,
//             };
//         }

//         return ticket;
//     };

//     // Set vé của user hiện tại từ Firebase
//     const setLocalTickets = (tickets: TicketItem[]) => {
//         localSelectedTickets.value = tickets;
//         console.log("✅ Set local tickets:", tickets);
//     };

//     // ✅ Setup listener để lắng nghe TẤT CẢ vé từ Firebase
//     const setupFirebaseListener = () => {
//         // Cleanup listener cũ nếu tồn tại
//         if (firebaseUnsubscribe) {
//             firebaseUnsubscribe();
//         }

//         firebaseUnsubscribe = listenToFirebaseTickets((tickets) => {
//             allTicketsFromFirebase.value = tickets;
//             console.log("✅ Updated all selected tickets from Firebase:", tickets);
//             console.log("   - UI sẽ tự động cập nhật nhờ reactivity");
            
//             // ✅ Kiểm tra xung đột vé
//             checkTicketConflicts(tickets);

//             // ✅ Merge selection info into the main list so TicketItem components update immediately
//             try {
//                 const ticketMap = new Map<number | string, TicketItem>();
//                 tickets.forEach(t => {
//                     if (t && (t as any).id !== undefined) {
//                         ticketMap.set((t as any).id, t as TicketItem);
//                     }
//                 });

//                 listItemTicket.value = listItemTicket.value.map(orig => {
//                     const f = ticketMap.get(orig.id as number | string);
//                     if (f) {
//                         return {
//                             ...orig,
//                             selected_by_id: f.selected_by_id,
//                             selected_by_name: f.selected_by_name,
//                             selected_by_username: f.selected_by_username,
//                         } as TicketItem;
//                     }
//                     // Ensure cleared tickets don't keep old selection info
//                     return {
//                         ...orig,
//                         selected_by_id: undefined,
//                         selected_by_name: undefined,
//                         selected_by_username: undefined,
//                     } as TicketItem;
//                 });
//             } catch (e) {
//                 console.error('Error merging Firebase tickets into listItemTicket:', e);
//             }
//         });

//         return firebaseUnsubscribe;
//     };

//     // ✅ Dọn dẹp listener khi component unmount
//     const cleanupListener = () => {
//         if (firebaseUnsubscribe) {
//             console.log("🛑 Cleaning up Firebase listener");
//             firebaseUnsubscribe();
//             firebaseUnsubscribe = null;
//         }
//     };

//     const handleRequestUnlock = async (ticket: number | undefined) => {
//         try {
//             console.log("Yêu cầu mở khóa vé:", ticket);

//             // ✅ Xử lý cả trường hợp ticket là object hoặc là number/string
//             let ticketId: string | number | undefined;

//             if (typeof ticket === 'number' || typeof ticket === 'string') {
//                 ticketId = ticket;
//             } else {
//                 ticketId = (ticket as any).id || (ticket as any).ticket_id || (ticket as any).seat?.id;
//             }

//             console.log("Ticket ID:", ticketId, "Type:", typeof ticketId);

//             if (ticketId === undefined || ticketId === null || ticketId === "") {
//                 notifyError("Ticket ID không hợp lệ");
//                 return;
//             }

//             // Xóa ticket khỏi local state
//             const index = localSelectedTickets.value.findIndex(
//                 (item) => String(item.id) === String(ticketId)
//             );

//             if (index !== -1) {
//                 localSelectedTickets.value.splice(index, 1);
//                 console.log("Removed ticket from local:", ticketId);
//             }

//             // ✅ Xóa ticket cụ thể khỏi Firebase
//             await deleteTicketFromFirebase(ticketId);
//             console.log("✅ Ticket unlocked and removed from Firebase");
            
//             // ✅ Xóa khỏi danh sách conflict nếu có
//             conflictedTicketIds.delete(ticketId);
            
//             notifySuccess("Đã mở khóa vé thành công");

//             // Cập nhật Firebase listener để refresh UI
//             setupFirebaseListener();

//         } catch (error) {
//             console.error("❌ Lỗi khi gửi yêu cầu mở khóa vé:", error);
//             notifyError("Gửi yêu cầu mở khóa vé thất bại.");
//         }
//     }

//     return {
//         // localSelectedTickets,
//         allTicketsFromFirebase,
//         handleAddLocalSelectedTicket,
//         handleClearLocalSelectedTickets,
//         ticketsAreBeingSelected,
//         isTicketSelectedByOther,
//         getTicketSelectedByInfo,
//         getTicketWithFirebaseInfo,
//         setLocalTickets,
//         setupFirebaseListener,
//         cleanupListener,
//         handleRequestUnlock,
//     };
// };