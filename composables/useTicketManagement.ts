// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { remove, update } from "firebase/database";
// // import { API_GetHistoryTicket } from "~/api/historyTicketAPI";
// // import { getListRouteNameActionByCompany } from "~/api/routeAPI";
// // import {
// //   API_GetListCancelTicketByTrip,
// //   cancelTickets,
// //   copyTickets,
// //   getListCustomerByTrip,
// //   getListTicketsByTrip,
// //   getListTransitDownByTrip,
// //   getListTransitUpByTrip,
// //   moveTickets,
// //   updateContactStatus,
// //   updateTickets,
// // } from "~/api/ticketAPI";
// // import { API_UpdateTicketsBookedInTrip } from "~/api/tripAPI";
// import { userStore } from "~/stores/useUserStore";
// import type { DTO_RP_HistoryTicket } from "~/types/historyTicketType";
// import type { DTO_RP_ListRouteName } from "~/types/routeType";
// import type {
//   CancelTicketType,
//   DTO_RP_CancelTicket,
//   DTO_RP_ListCustomerByTrip,
//   DTO_RP_ListTransitDownByTrip,
//   DTO_RP_ListTransitUpByTrip,
//   DTO_RP_SearchTicket,
//   DTO_RQ_UpdateTicket,
//   MoveTicketType,
//   TicketType,
// } from "~/types/ticketType";
// import type { UserActionType } from "~/types/userType";
// export const ticketList = ref<TicketType[]>([]);
// export const isMoveTicket = ref(false);
// export const loadingMoveTicket = ref(false);
// export const selectedTickets = ref<TicketType[]>([]);
// export const queryRouteID = ref<number | null>(null);
// export const queryDate = ref<Date | string>(new Date());
// export const queryTripID = ref<number | null>(null);
// export const queryTicketID = ref<number | null>(null);
// export const listCancelTicket = ref<DTO_RP_CancelTicket[]>([]);

// export const useTicketManagement = () => {
//   const loadingListTicket = ref(false);
//   const useUserStore = userStore();
//   const { db, ref: dbRef, set, onValue } = useFirebase();

//   const dialogFormEditTicket = ref(false);
//   const loadingItemTicket = ref(false);
//   const loadingListCancelTicket = ref(false);

//   const updatingTicketIds = ref<Set<number>>(new Set());
//   const useOffice = useOfficeStore();
//   const copyTicketStore = useCopyTicketStore();
//   const moveTicketStore = useMoveTicketStore();
//   const isCopyTicket = ref(false);
//   const dialogHistoryCancelTicket = ref(false);
//   const loadingHistoryCancelTicket = ref(false);
//   const historyCancelTicketData = ref<DTO_RP_HistoryTicket[]>([]);

//   const fetchListCancelTicketByTrip = async (trip_id: number) => {
//     loadingListCancelTicket.value = true;
//     try {
//       const response = await API_GetListCancelTicketByTrip(trip_id);
//       if (response.success) {
//         listCancelTicket.value = response.result || [];
//       } else {
//         notifyError(response.message || 'Lỗi khi lấy danh sách vé huỷ!');
//       }
//     } catch (error) {
//       console.error('❌ Lỗi khi gọi API lấy danh sách vé huỷ:', error);
//       notifyError('Lỗi khi lấy danh sách vé huỷ!');
//     } finally {
//       loadingListCancelTicket.value = false;
//     }
//   };

//   const handleCopyTicketCanceled = async (ticket: DTO_RP_CancelTicket) => {
//     console.log("Sao chép vé huỷ:", ticket);
//   };

//   const handleShowHistoryTicketCanceled = async (ticket: DTO_RP_CancelTicket) => {
//     dialogHistoryCancelTicket.value = true;
//     loadingHistoryCancelTicket.value = true;
//     console.log("Xem lịch sử vé huỷ:", ticket);
//     try {
//       const response = await API_GetHistoryTicket(ticket.ticket_code);
//       if (response.success) {
//         if (response.result) {
//           console.log("Lịch sử vé huỷ:", response.result);
//           historyCancelTicketData.value = response.result;
//         }
//       } else {
//         console.error(response.message || "Không thể tải lịch sử vé huỷ!");
//         notifyError(response.message || "Không thể tải lịch sử vé huỷ!");
//       }
//     } catch (error) {
//       console.error("Lỗi khi tải lịch sử vé huỷ:", error);
//       notifyError("Lỗi khi tải lịch sử vé huỷ!");
//     } finally {
//       loadingHistoryCancelTicket.value = false;
//     }
//   };

//   const fetchListTicketByTrip = async (id: number) => {
//     loadingListTicket.value = true;
//     try {
//       const response = await getListTicketsByTrip(id);
//       if (response.success) {
//         if (response.result) {
//           ticketList.value = response.result;
//         }
//       } else {
//         notifyError("Không thể tải danh sách vé!");
//       }
//     } catch (error) {
//       notifyError("Đã xảy ra lỗi khi tải danh sách vé!");
//       console.error("Error fetching tickets:", error);
//     } finally {
//       loadingListTicket.value = false;
//     }
//   };

//   const getFloorSeats = (floor: number) => {
//     const floorTickets = ticketList.value.filter(
//       (ticket) => ticket.seat_floor === floor
//     );
//     const rows = new Map();

//     floorTickets.forEach((ticket) => {
//       const rowNumber = ticket.seat_row;
//       if (!rows.has(rowNumber)) {
//         rows.set(rowNumber, []);
//       }
//       rows.get(rowNumber).push(ticket);
//     });

//     // Sort rows by row number and seats by column
//     const sortedRows = Array.from(rows.entries())
//       .sort((a, b) => a[ 0 ] - b[ 0 ])
//       .map(([ rowNumber, seats ]) => ({
//         rowNumber,
//         seats: seats.sort(
//           (a: TicketType, b: TicketType) => a.seat_column - b.seat_column
//         ),
//       }));

//     return sortedRows;
//   };

//   const getAvailableFloors = () => {
//     const floors = [
//       ...new Set(ticketList.value.map((ticket) => ticket.seat_floor)),
//     ];
//     return floors.sort((a, b) => a - b);
//   };

//   const setupRealtimeListener = (tripId: number) => {
//     const ticketRef = dbRef(db, `selectedTickets/${tripId}`);
//     onValue(ticketRef, (snapshot) => {
//       const data = snapshot.val();
//       const selected: TicketType[] = [];

//       if (data && ticketList.value.length > 0) {
//         for (const [ ticketIdStr, userName ] of Object.entries(data)) {
//           const ticket = ticketList.value.find(
//             (t) => t.id === Number(ticketIdStr)
//           );
//           if (ticket) {
//             selected.push({
//               ...ticket,
//               selectedBy: typeof userName === "string" ? userName : undefined,
//             });
//           }
//         }
//       }
//       selectedTickets.value = selected;
//     });

//     // ✅ SỬA: Listener cho thông tin vé - ưu tiên thông tin local
//     onValue(dbRef(db, `tickets/${tripId}`), (snapshot) => {
//       const updatedTickets = snapshot.val();
//       if (!updatedTickets) return;

//       ticketList.value = ticketList.value.map((originalTicket) => {
//         const updatedData = updatedTickets[ originalTicket.id ];
//         if (updatedData) {
//           return {
//             ...originalTicket, // Giữ nguyên thông tin gốc
//             ...updatedData, // Merge thông tin từ Firebase

//             // ✅ Ưu tiên thông tin từ local nếu Firebase không có
//             user_created:
//               updatedData.user_created || originalTicket.user_created,
//             office_created:
//               updatedData.office_created || originalTicket.office_created,

//             // Đảm bảo không ghi đè thông tin ghế
//             id: originalTicket.id,
//             seat_name: originalTicket.seat_name,
//             seat_row: originalTicket.seat_row,
//             seat_column: originalTicket.seat_column,
//             seat_floor: originalTicket.seat_floor,
//           };
//         }
//         return originalTicket;
//       });

//       console.log("🔄 Đã cập nhật vé từ Firebase (ưu tiên local)");
//     });
//   };
//   const isTicketSelected = (ticket: TicketType) => {
//     return selectedTickets.value.some((t) => t.id === ticket.id);
//   };

//   const FIREBASE_SYNC_FIELDS = {
//     // Thông tin khách hàng - có thể cập nhật
//     ticket_phone: true,
//     ticket_email: true,
//     ticket_customer_name: true,
//     ticket_point_up: true,
//     ticket_point_down: true,
//     ticket_note: true,
//     ticket_display_price: true,
//     payment_method: true,
//     booked_status: true,

//     // Metadata cập nhật - chỉ thêm khi cập nhật
//     updatedAt: true,
//     updatedBy: true,

//     // ✅ SỬA: Cho phép sync thông tin tạo khi có dữ liệu từ backend
//     user_created: true,
//     office_created: true,
//     office_id: true,
//     agent_id: true,
//     contact_status: true,

//     // Thông tin ghế - KHÔNG được thay đổi
//     id: false,
//     seat_name: false,
//     seat_row: false,
//     seat_column: false,
//     seat_floor: false,
//     trip_id: false,
//     selectedBy: false,
//   } as const;

//   // ✅ SỬA: Cập nhật setupRealtimeListener để xử lý tốt hơn

//   const syncTicketsToFirebase = async (
//     tripId: number,
//     ticketIds: number[],
//     updatedFields: Partial<TicketType>,
//     options: {
//       includeMetadata?: boolean;
//       preserveCreatedFields?: boolean;
//       logSync?: boolean;
//     } = {}
//   ) => {
//     try {
//       const {
//         includeMetadata = true,
//         preserveCreatedFields = true,
//         logSync = true,
//       } = options;
//       const updates: Record<string, unknown> = {};
//       const timestamp = Date.now();

//       // Loại bỏ các giá trị undefined
//       const sanitizedFields = Object.fromEntries(
//         Object.entries(updatedFields).filter(([ key, value ]) => {
//           // Chỉ đồng bộ field được phép và có giá trị
//           return (
//             FIREBASE_SYNC_FIELDS[ key as keyof typeof FIREBASE_SYNC_FIELDS ] &&
//             value !== undefined &&
//             value !== null
//           );
//         })
//       );

//       if (preserveCreatedFields) {
//         delete sanitizedFields.id;
//         delete sanitizedFields.seat_name;
//         delete sanitizedFields.seat_row;
//         delete sanitizedFields.seat_column;
//         delete sanitizedFields.seat_floor;
//         delete sanitizedFields.trip_id;
//       }

//       if (includeMetadata) {
//         sanitizedFields.updatedAt = timestamp;
//         sanitizedFields.updatedBy = useUserStore.full_name || "unknown";
//       }

//       ticketIds.forEach((ticketId) => {
//         updates[ `tickets/${tripId}/${ticketId}` ] = { ...sanitizedFields };
//       });

//       if (logSync) {
//         console.log("🔄 Firebase Sync:", {
//           tripId,
//           ticketCount: ticketIds.length,
//           ticketIds,
//           syncedFields: Object.keys(sanitizedFields),
//           preservedFields: preserveCreatedFields
//             ? [ "user_created", "office_created", "office_id", "contact_status" ]
//             : [],
//           data: sanitizedFields,
//         });
//       }

//       await update(dbRef(db), updates);
//       if (logSync) {
//         console.log("✅ Firebase sync completed successfully");
//       }
//     } catch (error) {
//       console.error("Lỗi đồng bộ Firebase:", error);
//     }
//   };

//   const clearAllSelectedTickets = async () => {
//     if (!selectedTrip.value?.trip_id) return;
//     // cancelMoveTickets(); // Removed due to missing export
//     const tripId = selectedTrip.value.trip_id;

//     // Lấy danh sách vé đang được chọn bởi user hiện tại
//     const myTickets = selectedTickets.value.filter(
//       (t) => t.selectedBy === useUserStore.full_name
//     );

//     try {
//       // Xóa từng vé khỏi Firebase
//       for (const ticket of myTickets) {
//         await remove(dbRef(db, `selectedTickets/${tripId}/${ticket.id}`));
//       }

//       // Cập nhật local state
//       selectedTickets.value = selectedTickets.value.filter(
//         (t) => t.selectedBy !== useUserStore.full_name
//       );

//     } catch (error) {
//       console.error("Lỗi khi bỏ chọn vé khỏi Firebase:", error);
//       notifyError("Lỗi bỏ chọn vé!");
//     }
//   };
//   const destinationTickets = ref<TicketType[]>([]);
//   const handleTicketClick = async (ticket: TicketType) => {
//     try {
//       // ===============================
//       // 🔹 0. Trường hợp di chuyển vé
//       // ===============================
//       if (isMoveTicket.value) {
//         if (ticket.booked_status) {
//           notifyWarning("Vé đã được đặt, không thể chọn!");
//           return;
//         }

//         if (destinationTickets.value.some((t) => t.id === ticket.id)) {
//           notifyInfo("Bạn đã chọn ghế này rồi.");
//           return;
//         }

//         destinationTickets.value.push(ticket);

//         if (
//           destinationTickets.value.length ===
//           moveTicketStore.mySelectedTickets.length
//         ) {
//           // Gọi hàm xử lý dán vé
//           await handlePasteMovedTickets(destinationTickets.value);

//           // Reset trạng thái
//           isMoveTicket.value = false;
//           destinationTickets.value = [];
//           moveTicketStore.removeTicket();
//         }
//         return;
//       }

//       // ===============================
//       // 🔹 1. Thông tin chung
//       // ===============================
//       if (!selectedTrip.value?.trip_id || !useUserStore.full_name) return;

//       const tripId = selectedTrip.value.trip_id;
//       const ticketPath = `selectedTickets/${tripId}/${ticket.id}`;
//       const currentUser = useUserStore.full_name;

//       // Danh sách vé user hiện tại đang chọn
//       const userSelectedTickets = selectedTickets.value.filter(
//         (t) => t.selectedBy === currentUser
//       );
//       const index = userSelectedTickets.findIndex((t) => t.id === ticket.id);

//       // ===============================
//       // 🔹 2. Nếu CHỌN vé mới
//       // ===============================
//       if (index === -1) {
//         // Vé chưa có số điện thoại (hoặc chưa đặt)
//         if (!ticket.booked_status || !ticket.ticket_phone?.trim()) {
//           const hasBookedTicketWithPhone = userSelectedTickets.some(
//             (t) => t.booked_status && t.ticket_phone?.trim()
//           );

//           // Nếu đang có vé có số điện thoại → bỏ hết chúng đi
//           if (hasBookedTicketWithPhone) {
//             for (const selectedTicket of userSelectedTickets) {
//               if (selectedTicket.booked_status && selectedTicket.ticket_phone) {
//                 await remove(
//                   dbRef(db, `selectedTickets/${tripId}/${selectedTicket.id}`)
//                 );
//               }
//             }
//           }

//           // Chọn vé hiện tại (không giới hạn số lượng)
//           await set(dbRef(db, ticketPath), currentUser);
//         }
//         // Vé đã có số điện thoại
//         else {
//           const hasUnbookedTicket = userSelectedTickets.some(
//             (t) => !t.booked_status || !t.ticket_phone?.trim()
//           );
//           const hasDifferentPhone = userSelectedTickets.some(
//             (t) =>
//               t.booked_status &&
//               t.ticket_phone?.trim() &&
//               t.ticket_phone !== ticket.ticket_phone
//           );

//           // Nếu có vé không số điện thoại hoặc số điện thoại khác → bỏ hết
//           if (hasUnbookedTicket || hasDifferentPhone) {
//             for (const selectedTicket of userSelectedTickets) {
//               await remove(
//                 dbRef(db, `selectedTickets/${tripId}/${selectedTicket.id}`)
//               );
//             }
//           }

//           // Chọn vé hiện tại
//           await set(dbRef(db, ticketPath), currentUser);

//           // Tự động chọn các vé cùng số điện thoại
//           const ticketsToAutoSelect = ticketList.value.filter(
//             (t) =>
//               t.ticket_phone === ticket.ticket_phone &&
//               t.id !== ticket.id &&
//               t.booked_status === true &&
//               !selectedTickets.value.some((sel) => sel.id === t.id)
//           );

//           for (const relatedTicket of ticketsToAutoSelect) {
//             await set(
//               dbRef(db, `selectedTickets/${tripId}/${relatedTicket.id}`),
//               currentUser
//             );
//           }
//         }
//       }
//       // ===============================
//       // 🔹 3. Nếu BỎ CHỌN vé
//       // ===============================
//       else {
//         const ticketToRemove = selectedTickets.value.find(
//           (t) => t.id === ticket.id
//         );
//         if (ticketToRemove?.selectedBy === currentUser) {
//           await remove(dbRef(db, ticketPath));
//         }
//       }
//     } catch (error) {
//       console.error("Lỗi khi chọn/bỏ chọn vé:", error);
//       notifyError("Lỗi khi chọn/bỏ chọn vé!");
//     }
//   };


//   const getTicketSelector = (ticket: TicketType) => {
//     const found = selectedTickets.value.find((t) => t.id === ticket.id);
//     return found?.selectedBy || null;
//   };

//   const handleOpenFormEditTicket = () => {
//     dialogFormEditTicket.value = true;
//   };

//   const mySelectedTickets = computed(() => {
//     return selectedTickets.value.filter(
//       (t) => t.selectedBy === useUserStore.full_name
//     );
//   });

//   const updateTicketsBookedInTrip = async () => {
//     const bookedTickets = ticketList.value.filter(
//       (ticket) => ticket.booked_status === true
//     );

//     const bookedTicketsCount = bookedTickets.length;

//     const totalTicketsPrice = bookedTickets.reduce((sum, ticket) => {
//       return sum + (ticket.ticket_display_price || 0);
//     }, 0);

//     tripList.value = tripList.value.map((trip) => {
//       if (trip.trip_id === selectedTrip.value?.trip_id) {
//         return {
//           ...trip,
//           tickets_booked: bookedTicketsCount,
//           total_tickets_price: totalTicketsPrice,
//         };
//       }
//       return trip;
//     });

//     selectedTrip.value = {
//       ...selectedTrip.value!,
//       tickets_booked: bookedTicketsCount,
//       total_tickets_price: totalTicketsPrice,
//     };
//     try {
//       await API_UpdateTicketsBookedInTrip(
//         selectedTrip.value.trip_id,
//         bookedTicketsCount,
//         totalTicketsPrice
//       );
//       // ElMessage.success("Cập nhật số lượng vé thành công!");
//     } catch (error) {
//       console.error("Lỗi khi cập nhật vé:", error);
//       ElMessage.error("Cập nhật số lượng vé thất bại!");
//     }
//   };

//   // DB-6 Cancel Tickets
//   const handleCancelTickets = async (tickets: CancelTicketType) => {
//     console.log("Hủy vé:", tickets);
//     loadingItemTicket.value = true;
//     tickets.id.forEach((id) => updatingTicketIds.value.add(id));
//     try {
//       const response = await cancelTickets(
//         {
//           id: useUserStore.id,
//           username: useUserStore.username,
//           full_name: useUserStore.full_name,
//           company_id: useUserStore.company_id,
//           office_name: useOffice.name,
//         } as UserActionType,
//         tickets
//       );
//       if (response.success) {
//         ticketList.value = ticketList.value.map((ticket) => {
//           if (tickets.id.includes(ticket.id)) {
//             return {
//               ...ticket,
//               ticket_phone: ticket.ticket_phone || "",
//               ticket_email: ticket.ticket_email || "",
//               ticket_customer_name: ticket.ticket_customer_name || "",
//               ticket_point_up: ticket.ticket_point_up || "",
//               ticket_point_down: ticket.ticket_point_down || "",
//               ticket_note: ticket.ticket_note || "",
//               ticket_display_price: ticket.ticket_display_price || 0,
//               booked_status: false,
//             };
//           }
//           return ticket;
//         });
//         if (selectedTrip.value?.trip_id) {
//           const ticketsToSync = ticketList.value.filter((ticket) =>
//             tickets.id.includes(ticket.id)
//           );
//           await syncTicketsToFirebase(selectedTrip.value!.trip_id, tickets.id, {
//             ticket_phone: "",
//             ticket_email: "",
//             ticket_customer_name: "",
//             ticket_point_up: "",
//             ticket_point_down: "",
//             ticket_note: "",
//             ticket_display_price: ticketsToSync[ 0 ]?.ticket_display_price || 0,
//             booked_status: false,
//           });
//           const tripId = selectedTrip.value.trip_id;
//           for (const ticketId of tickets.id) {
//             await remove(dbRef(db, `selectedTickets/${tripId}/${ticketId}`));
//             await remove(dbRef(db, `tickets/${tripId}/${ticketId}`));
//           }
//         }
//         updateTicketsBookedInTrip();
//         notifySuccess("Hủy vé thành công!");
//       } else {
//         notifyError(response.message || "Hủy vé thất bại!");
//       }
//     } catch (error) {
//       console.error("Lỗi khi hủy vé:", error);
//       notifyError("Đã xảy ra lỗi khi hủy vé!");
//     } finally {
//       loadingItemTicket.value = false;
//       updatingTicketIds.value.clear();
//     }
//   };

//   // DB-4 Update Tickets
//   const handleUpdateTickets = async (tickets: DTO_RQ_UpdateTicket) => {
//     loadingItemTicket.value = true;
//     tickets.id.forEach((id: number) => updatingTicketIds.value.add(id));
//     try {
//       const response = await updateTickets(
//         {
//           id: useUserStore.id,
//           username: useUserStore.username,
//           full_name: useUserStore.full_name,
//           company_id: useUserStore.company_id,
//           office_id: useOffice.id,
//           office_name: useOffice.name,
//         } as UserActionType,
//         tickets as DTO_RQ_UpdateTicket
//       );

//       if (response.success) {
//         if (response.result && Array.isArray(response.result)) {
//           await clearAllSelectedTickets();
//           selectedTickets.value.length = 0;
//           queryDate.value = '';
//           queryTripID.value = null;
//           queryTicketID.value = null;
//           const updatedTicketsMap = new Map(
//             response.result.map((ticket: TicketType) => [ ticket.id, ticket ])
//           );

//           ticketList.value = ticketList.value.map((ticket) => {
//             const updatedTicket = updatedTicketsMap.get(ticket.id);
//             if (updatedTicket) {
//               return {
//                 ...ticket,
//                 ...updatedTicket,
//                 booked_status: true,
//               };
//             }
//             return ticket;
//           });

//           if (selectedTrip.value?.trip_id) {
//             const updatedTickets = response.result.filter(
//               (ticket: TicketType) => tickets.id.includes(ticket.id)
//             );

//             for (const ticket of updatedTickets) {
//               await syncTicketsToFirebase(
//                 selectedTrip.value.trip_id,
//                 [ ticket.id ],
//                 {
//                   ticket_phone: ticket.ticket_phone,
//                   ticket_email: ticket.ticket_email,
//                   ticket_customer_name: ticket.ticket_customer_name,
//                   ticket_point_up: ticket.ticket_point_up,
//                   ticket_point_down: ticket.ticket_point_down,
//                   ticket_note: ticket.ticket_note,
//                   ticket_display_price: ticket.ticket_display_price,
//                   payment_method: ticket.payment_method,
//                   booked_status: true,

//                   user_created: ticket.user_created,
//                   office_created: ticket.office_created,
//                 },
//                 {
//                   includeMetadata: true,
//                   preserveCreatedFields: false,
//                   logSync: true,
//                 }
//               );
//             }
//           }
//         } else {
//           const updatedIds = new Set(tickets.id);
//           const { id, ...rest } = tickets;

//           ticketList.value = ticketList.value.map((ticket) => {
//             if (updatedIds.has(ticket.id)) {
//               return {
//                 ...ticket,
//                 ...rest,
//                 booked_status: true,
//                 user_created: ticket.user_created,
//                 office_created: ticket.office_created,
//                 agent_id: ticket.agent_id,
//               };
//             }
//             return ticket;
//           });

//           if (selectedTrip.value?.trip_id) {
//             const { id, ...ticketFields } = tickets;
//             await syncTicketsToFirebase(
//               selectedTrip.value.trip_id,
//               tickets.id,
//               {
//                 ...ticketFields,
//                 booked_status: true,
//               },
//               {
//                 includeMetadata: true,
//                 preserveCreatedFields: true,
//                 logSync: true,
//               }
//             );
//           }
//         }

//         updateTicketsBookedInTrip();

//         notifySuccess("Cập nhật vé thành công!");
//       } else {
//         notifyError(response.message || "Cập nhật vé thất bại!");
//       }
//     } catch (error) {
//       console.error("Lỗi khi cập nhật vé:", error);
//       notifyError("Đã xảy ra lỗi khi cập nhật vé!");
//     } finally {
//       loadingItemTicket.value = false;
//       updatingTicketIds.value.clear();
//     }
//   };

//   // DB-7 Copy Tickets
//   const handleCopyTickets = async () => {
//     // console.log("Sao chép vé:", mySelectedTickets.value);
//     notifyWarning("Đã sao chép thông tin vé!");
//     await copyTicketStore.setTickets(mySelectedTickets.value);
//     // console.log("Pinia sao chép:", copyTicketStore.mySelectedTickets);
//     await clearAllSelectedTickets();
//     isCopyTicket.value = true;
//   };

//   // DB-7 Copy Tickets
//   const handlePasteTickets = async () => {
//     if (!isCopyTicket.value) {
//       notifyInfo("Chưa sao chép vé nào!");
//       return;
//     }
//     const copiedTickets = copyTicketStore.mySelectedTickets;
//     if (copiedTickets.length === 0) {
//       notifyInfo("Không có vé nào để dán!");
//       return;
//     }
//     loadingItemTicket.value = true;
//     try {
//       const response = await copyTickets(
//         {
//           id: useUserStore.id,
//           username: useUserStore.username,
//           full_name: useUserStore.full_name,
//           company_id: useUserStore.company_id,
//           office_id: useOffice.id,
//           office_name: useOffice.name,
//         } as UserActionType,
//         copiedTickets.map((ticket) => ({
//           id: ticket.id,
//           booked_status: ticket.booked_status,
//           ticket_phone: ticket.ticket_phone,
//           ticket_email: ticket.ticket_email,
//           ticket_customer_name: ticket.ticket_customer_name,
//           ticket_point_up: ticket.ticket_point_up,
//           ticket_point_down: ticket.ticket_point_down,
//           ticket_note: ticket.ticket_note,
//           ticket_display_price: ticket.ticket_display_price,
//           payment_method: ticket.payment_method,
//         })),
//         mySelectedTickets.value.map((t) => t.id)
//       );
//       if (response.success) {
//         // Xử lý dữ liệu trả về từ API
//         if (response.result && Array.isArray(response.result)) {
//           // Cập nhật ticketList với dữ liệu mới
//           const updatedTicketIds = new Set(
//             mySelectedTickets.value.map((t) => t.id)
//           );

//           ticketList.value = ticketList.value.map((ticket) => {
//             if (updatedTicketIds.has(ticket.id)) {
//               // Tìm thông tin vé tương ứng từ response
//               const updatedTicket = response.result?.find(
//                 (t: TicketType) => t.id === ticket.id
//               );
//               if (updatedTicket) {
//                 return {
//                   ...ticket,
//                   ...updatedTicket,
//                   booked_status: true,
//                 };
//               }
//             }
//             return ticket;
//           });

//           // Đồng bộ với Firebase
//           if (selectedTrip.value?.trip_id) {
//             const ticketsToSync = response.result.filter((ticket: TicketType) =>
//               updatedTicketIds.has(ticket.id)
//             );

//             for (const ticket of ticketsToSync) {
//               await syncTicketsToFirebase(
//                 selectedTrip.value.trip_id,
//                 [ ticket.id ],
//                 {
//                   ticket_phone: ticket.ticket_phone || "",
//                   ticket_email: ticket.ticket_email || "",
//                   ticket_customer_name: ticket.ticket_customer_name || "",
//                   ticket_point_up: ticket.ticket_point_up || "",
//                   ticket_point_down: ticket.ticket_point_down || "",
//                   ticket_note: ticket.ticket_note || "",
//                   ticket_display_price: ticket.ticket_display_price || 0,
//                   payment_method: ticket.payment_method || "",
//                   booked_status: true,
//                 }
//               );
//             }
//           }

//           // Cập nhật số lượng vé đã đặt
//           updateTicketsBookedInTrip();

//           // Bỏ chọn tất cả vé sau khi dán
//           await clearAllSelectedTickets();

//           notifySuccess(`Dán thành công ${response.result.length} vé!`);
//         } else {
//           notifyError("Dán vé thất bại!");
//         }
//       } else {
//         notifyError("Sao chép vé thất bại!");
//       }
//     } catch (error) {
//       console.error("Lỗi khi sao chép vé:", error);
//       notifyError("Đã xảy ra lỗi khi sao chép vé!");
//     } finally {
//       isCopyTicket.value = false;
//     }
//   };

//   // DB-8 Move Tickets
//   const handleMoveTickets = async () => {
//     console.log("Di chuyển vé:", mySelectedTickets.value);
//     notifySuccess(`Đã chọn ${mySelectedTickets.value.length} vé!`);
//     await moveTicketStore.setTickets(
//       mySelectedTickets.value.map((ticket) => ({
//         id: ticket.id,
//         booked_status: ticket.booked_status,
//         ticket_phone: ticket.ticket_phone ?? "",
//         ticket_email: ticket.ticket_email ?? "",
//         ticket_customer_name: ticket.ticket_customer_name ?? "",
//         ticket_point_up: ticket.ticket_point_up ?? "",
//         ticket_point_down: ticket.ticket_point_down ?? "",
//         ticket_note: ticket.ticket_note ?? "",
//         ticket_display_price: ticket.ticket_display_price ?? 0,
//         payment_method: ticket.payment_method ?? "",
//         user_created: ticket.user_created ?? "",
//         user_id_created: ticket.user_id_created ?? 0,
//         office_id_created: ticket.office_id_created ?? 0,
//         office_created: ticket.office_created ?? "",
//         contact_status: ticket.contact_status ?? 0,
//         transit_up: ticket.transit_up ?? false,
//         transit_down: ticket.transit_down ?? false,
//       })) as MoveTicketType[]
//     );

//     console.log("Pinia di chuyển:", moveTicketStore.mySelectedTickets);
//     isMoveTicket.value = true;
//   };

//   // DB-8 Move Tickets
//   const handlePasteMovedTickets = async (destinationSeats: TicketType[]) => {
//     const sourceTickets = moveTicketStore.mySelectedTickets;
//     console.log("Dán vé di chuyển:", sourceTickets, destinationSeats);

//     // Thêm cả source ticket IDs vào updating list
//     destinationSeats.forEach((seat: TicketType) =>
//       updatingTicketIds.value.add(seat.id)
//     );
//     sourceTickets.forEach((ticket) => updatingTicketIds.value.add(ticket.id));

//     try {
//       const response = await moveTickets(
//         {
//           id: useUserStore.id,
//           username: useUserStore.username,
//           full_name: useUserStore.full_name,
//           company_id: useUserStore.company_id,
//           office_name: useOffice.name,
//         } as UserActionType,
//         sourceTickets,
//         destinationSeats.map((t) => t.id)
//       );

//       console.log("Response di chuyển vé:", response);

//       if (response.success) {
//         if (response.result && Array.isArray(response.result)) {
//           const updatedTicketsMap = new Map(
//             response.result.map((ticket: TicketType) => [ ticket.id, ticket ])
//           );

//           // 🔹 CẬP NHẬT: Xử lý cả vé đích và vé nguồn
//           ticketList.value = ticketList.value.map((ticket) => {
//             // Cập nhật vé đích với thông tin mới
//             const updatedTicket = updatedTicketsMap.get(ticket.id);
//             if (updatedTicket) {
//               return {
//                 ...ticket,
//                 ...updatedTicket,
//                 booked_status: updatedTicket.booked_status || false,
//               };
//             }

//             // 🔹 THÊM: Làm rỗng vé nguồn cũ
//             const isSourceTicket = sourceTickets.some(
//               (sourceTicket) => sourceTicket.id === ticket.id
//             );
//             if (isSourceTicket) {
//               return {
//                 ...ticket,
//                 ticket_phone: "",
//                 ticket_email: "",
//                 ticket_customer_name: "",
//                 ticket_point_up: "",
//                 ticket_point_down: "",
//                 ticket_note: "",
//                 ticket_display_price: ticket.ticket_display_price || 0,
//                 payment_method: "",
//                 booked_status: false,
//                 user_created: "",
//                 office_created: "",
//               };
//             }

//             return ticket;
//           });

//           // 🔹 ĐỒNG BỘ FIREBASE
//           if (selectedTrip.value?.trip_id) {
//             const tripId = selectedTrip.value.trip_id;

//             // Sync vé đích (có thông tin mới) - 🔹 QUAN TRỌNG: preserveCreatedFields = false
//             const destinationTicketsToSync = response.result.filter(
//               (ticket: TicketType) =>
//                 destinationSeats.some((dest) => dest.id === ticket.id)
//             );

//             for (const ticket of destinationTicketsToSync) {
//               await syncTicketsToFirebase(
//                 tripId,
//                 [ ticket.id ],
//                 {
//                   ticket_phone: ticket.ticket_phone || "",
//                   ticket_email: ticket.ticket_email || "",
//                   ticket_customer_name: ticket.ticket_customer_name || "",
//                   ticket_point_up: ticket.ticket_point_up || "",
//                   ticket_point_down: ticket.ticket_point_down || "",
//                   ticket_note: ticket.ticket_note || "",
//                   ticket_display_price: ticket.ticket_display_price || 0,
//                   payment_method: ticket.payment_method || "",
//                   booked_status: ticket.booked_status || false,
//                   user_created: ticket.user_created || "",
//                   office_created: ticket.office_created || "",
//                 },
//                 {
//                   includeMetadata: true,
//                   preserveCreatedFields: false, // 🔹 SỬA: false để sync user_created và office_created
//                   logSync: true,
//                 }
//               );
//             }

//             // 🔹 THÊM: Sync vé nguồn (làm rỗng) - 🔹 QUAN TRỌNG: preserveCreatedFields = false
//             const sourceTicketIds = sourceTickets.map((ticket) => ticket.id);
//             for (const sourceTicketId of sourceTicketIds) {
//               await syncTicketsToFirebase(
//                 tripId,
//                 [ sourceTicketId ],
//                 {
//                   ticket_phone: "",
//                   ticket_email: "",
//                   ticket_customer_name: "",
//                   ticket_point_up: "",
//                   ticket_point_down: "",
//                   ticket_note: "",
//                   payment_method: "",
//                   booked_status: false,
//                   user_created: "",
//                   office_created: "",
//                 },
//                 {
//                   includeMetadata: true,
//                   preserveCreatedFields: false, // 🔹 SỬA: false để sync user_created và office_created
//                   logSync: true,
//                 }
//               );

//               // 🔹 XÓA khỏi Firebase selected tickets
//               await remove(
//                 dbRef(db, `selectedTickets/${tripId}/${sourceTicketId}`)
//               );
//             }
//           }

//           // Cập nhật số lượng vé đã đặt
//           await clearAllSelectedTickets();
//           cancelMoveTickets();
//           updateTicketsBookedInTrip();
//           notifySuccess(`Di chuyển thành công ${destinationSeats.length} vé!`);
//         }
//       } else {
//         notifyError(response.message || "Di chuyển vé thất bại!");
//       }
//     } catch (error) {
//       console.error("Lỗi khi dán vé di chuyển:", error);
//       notifyError("Đã xảy ra lỗi khi di chuyển vé!");
//     } finally {
//       loadingMoveTicket.value = false;
//       updatingTicketIds.value.clear();
//     }
//   };

//   const cancelMoveTickets = () => {
//     console.log("Hủy di chuyển vé");
//     isMoveTicket.value = false;
//     moveTicketStore.removeTicket();
//   };

//   const handleUpdateContactStatus = async (status: number) => {
//     console.log("Cập nhật trạng thái liên hệ:", status);
//     console.log("Cập nhật trạng thái liên hệ cho vé:", mySelectedTickets.value);
//     mySelectedTickets.value.forEach((ticket) =>
//       updatingTicketIds.value.add(ticket.id)
//     );
//     try {
//       const response = await updateContactStatus(
//         {
//           id: useUserStore.id,
//           username: useUserStore.username,
//           full_name: useUserStore.full_name,
//           company_id: useUserStore.company_id,
//           office_name: useOffice.name,
//         } as UserActionType,
//         mySelectedTickets.value.map((ticket) => ticket.id),
//         status
//       );
//       console.log("Response cập nhật trạng thái liên hệ:", response);
//       if (response.success) {
//         if (response.result && Array.isArray(response.result)) {
//           const updatedTicketIds = new Set(
//             mySelectedTickets.value.map((t) => t.id)
//           );

//           ticketList.value = ticketList.value.map((ticket) => {
//             if (updatedTicketIds.has(ticket.id)) {
//               const updatedTicket = response.result?.find(
//                 (t: TicketType) => t.id === ticket.id
//               );
//               if (updatedTicket) {
//                 return {
//                   ...ticket,
//                   ...updatedTicket,
//                   booked_status: true,
//                 };
//               }
//             }
//             return ticket;
//           });

//           if (selectedTrip.value?.trip_id) {
//             const ticketsToSync = response.result.filter((ticket: TicketType) =>
//               updatedTicketIds.has(ticket.id)
//             );

//             for (const ticket of ticketsToSync) {
//               await syncTicketsToFirebase(
//                 selectedTrip.value.trip_id,
//                 [ ticket.id ],
//                 {
//                   ticket_phone: ticket.ticket_phone || "",
//                   ticket_email: ticket.ticket_email || "",
//                   ticket_customer_name: ticket.ticket_customer_name || "",
//                   ticket_point_up: ticket.ticket_point_up || "",
//                   ticket_point_down: ticket.ticket_point_down || "",
//                   ticket_note: ticket.ticket_note || "",
//                   ticket_display_price: ticket.ticket_display_price || 0,
//                   payment_method: ticket.payment_method || "",
//                   booked_status: true,
//                   contact_status: status,
//                   user_created: mySelectedTickets.value[ 0 ].user_created || "",
//                   office_created:
//                     mySelectedTickets.value[ 0 ].office_created || "",
//                 }
//               );
//             }
//           }

//           await clearAllSelectedTickets();
//           updateTicketsBookedInTrip();
//         }
//       } else {
//         ElNotification({
//           message: h(
//             "p",
//             { style: "color: red" },
//             response.message || "Cập nhật trạng thái liên hệ thất bại!"
//           ),
//           type: "error",
//         });
//       }
//     } catch (error) {
//       console.error("Lỗi khi cập nhật trạng thái liên hệ:", error);
//       ElNotification({
//         message: h(
//           "p",
//           { style: "color: red" },
//           "Đã xảy ra lỗi khi cập nhật trạng thái liên hệ!"
//         ),
//         type: "error",
//       });
//     } finally {
//       loadingItemTicket.value = false;
//       updatingTicketIds.value.clear();
//     }
//   };

//   const loadingTabCustomer = ref(false);
//   const listCustomer = ref<DTO_RP_ListCustomerByTrip[]>([]);
//   const fetchListCustomerByTrip = async () => {
//     loadingTabCustomer.value = true;
//     try {
//       const response = await getListCustomerByTrip(
//         selectedTrip.value?.trip_id || 0
//       );
//       if (response.success) {
//         listCustomer.value = response.result || [];
//       } else {
//         notifyError(response.message || "Lấy danh sách khách hàng thất bại!");
//       }
//     } catch (error) {
//       console.error("Lỗi khi lấy danh sách khách hàng:", error);
//       notifyError("Đã xảy ra lỗi khi lấy danh sách khách hàng!");
//     } finally {
//       loadingTabCustomer.value = false;
//     }
//   };

//   const loadingTransitUp = ref(false);
//   const loadingTransitDown = ref(false);
//   const listTransitUp = ref<DTO_RP_ListTransitUpByTrip[]>([]);
//   const listTransitDown = ref<DTO_RP_ListTransitDownByTrip[]>([]);
//   const fetchListTransitUpByTrip = async () => {
//     loadingTransitUp.value = true;
//     try {
//       const response = await getListTransitUpByTrip(
//         selectedTrip.value?.trip_id || 0
//       );
//       if (response.success) {
//         listTransitUp.value = response.result || [];
//       }
//     } catch (error) {
//       console.error("Lỗi khi lấy danh sách khách hàng:", error);
//       ElNotification({
//         message: h(
//           "p",
//           { style: "color: red" },
//           "Đã xảy ra lỗi khi lấy danh sách khách hàng!"
//         ),
//         type: "error",
//       });
//     } finally {
//       loadingTransitUp.value = false;
//     }
//   };
//   const fetchListTransitDownByTrip = async () => {
//     loadingTransitDown.value = true;
//     try {
//       const response = await getListTransitDownByTrip(
//         selectedTrip.value?.trip_id || 0
//       );
//       if (response.success) {
//         listTransitDown.value = response.result || [];
//       }
//     } catch (error) {
//       console.error("Lỗi khi lấy danh sách khách hàng:", error);
//       ElNotification({
//         message: h(
//           "p",
//           { style: "color: red" },
//           "Đã xảy ra lỗi khi lấy danh sách khách hàng!"
//         ),
//         type: "error",
//       });
//     } finally {
//       loadingTransitDown.value = false;
//     }
//   };

//   const createTicketHTML = (ticket: TicketType): string => {
//     return `
//     <div class="ticket" style="
//       width: 300px;
//       height: 400px;
//       border: 2px dashed #333;
//       margin: 20px;
//       padding: 20px;
//       font-family: Arial, sans-serif;
//       border-radius: 10px;
//       box-shadow: 0 4px 8px rgba(0,0,0,0.3);
//       page-break-after: always;
//     ">
//       <div class="ticket-header" style="text-align: center; margin-bottom: 20px;">
//         <h2 style="margin: 0; font-size: 18px; text-transform: uppercase;">${ticket.ticket_customer_name
//       }</h2>
//         <div style="height: 2px; background: white; margin: 10px 0;"></div>
//       </div>
      
//       <div class="ticket-body">
//         <div class="info-row" style="margin-bottom: 12px;">
//           <strong>Khách hàng:</strong> ${ticket.ticket_customer_name}
//         </div>
        
//         <div class="info-row" style="margin-bottom: 12px;">
//           <strong>Loại vé:</strong> ${ticket.ticket_customer_name}
//         </div>
        
//         <div class="info-row" style="margin-bottom: 12px;">
//           <strong>Giá vé:</strong> ${ticket.ticket_display_price.toLocaleString(
//         "vi-VN"
//       )} VNĐ
//         </div>
        
//         <div class="info-row" style="margin-bottom: 12px;">
//           <strong>Ngày:</strong> ${new Date(
//         ticket.ticket_customer_name
//       ).toLocaleDateString("vi-VN")}
//         </div>
        
//         <div class="info-row" style="margin-bottom: 12px;">
//           <strong>Giờ:</strong> ${ticket.ticket_customer_name}
//         </div>
        
//         <div class="info-row" style="margin-bottom: 12px;">
//           <strong>Địa điểm:</strong> ${ticket.ticket_customer_name}
//         </div>
        
//         ${ticket.ticket_customer_name
//         ? `
//         <div class="info-row" style="margin-bottom: 12px;">
//           <strong>Chỗ ngồi:</strong> ${ticket.ticket_customer_name}
//         </div>
//         `
//         : ""
//       }
        
//         <div class="ticket-footer" style="margin-top: 20px; text-align: center;">
//           <div style="font-size: 12px; opacity: 0.8;">
//             Mã vé: ${ticket.id}
//           </div>
//           <div style="font-size: 10px; opacity: 0.6; margin-top: 5px;">
//             Ngày mua: ${new Date(
//         ticket.ticket_display_price
//       ).toLocaleDateString("vi-VN")}
//           </div>
//           ${ticket.ticket_customer_name
//         ? `
//           <div style="margin-top: 10px;">
//             <div style="width: 60px; height: 60px; background: white; margin: 0 auto; display: flex; align-items: center; justify-content: center; color: black; font-size: 8px;">
//               QR CODE
//             </div>
//           </div>
//           `
//         : ""
//       }
//         </div>
//       </div>
//     </div>
//   `;
//   };
//   const handlePrintTickets = (tickets: TicketType[]) => {
//     console.log("In vé 2:", tickets);
//     const ticketsHTML = tickets
//       .map((ticket) => createTicketHTML(ticket))
//       .join("");

//     const htmlContent = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <title>In Vé</title>
//       <meta charset="UTF-8">
//       <style>
//         @media print {
//           body { margin: 0; }
//           .ticket { 
//             page-break-after: always; 
//             margin: 0 !important;
//           }
//           .ticket:last-child {
//             page-break-after: auto;
//           }
//         }
//         body {
//           font-family: Arial, sans-serif;
//           margin: 0;
//           padding: 20px;
//           display: flex;
//           flex-wrap: wrap;
//           justify-content: center;
//         }
//         .print-button {
//           position: fixed;
//           top: 20px;
//           right: 20px;
//           padding: 10px 20px;
//           background: #007bff;
//           color: white;
//           border: none;
//           border-radius: 5px;
//           cursor: pointer;
//           font-size: 16px;
//           z-index: 1000;
//         }
//         .print-button:hover {
//           background: #0056b3;
//         }
//         @media print {
//           .print-button { display: none; }
//         }
//       </style>
//       <script>
//         function printPage() {
//           window.print();
//         }
//         window.onload = function() {
//           // Tự động focus để sẵn sàng in
//           window.focus();
//         }
//       </script>
//     </head>
//     <body>
//       <button class="print-button" onclick="printPage()">🖨️ In vé</button>
//       ${ticketsHTML}
//     </body>
//     </html>
//   `;

//     // 🔹 SỬA: Tạo blob URL và mở tab mới
//     const blob = new Blob([ htmlContent ], { type: "text/html" });
//     const url = URL.createObjectURL(blob);

//     // Mở tab mới
//     const newTab = window.open(url, "_blank");

//     // Cleanup blob URL sau 1 giây
//     setTimeout(() => {
//       URL.revokeObjectURL(url);
//     }, 1000);

//     if (!newTab) {
//       ElNotification({
//         message: "Không thể mở tab mới. Vui lòng kiểm tra popup blocker.",
//         type: "error",
//       });
//     }
//   };

//   const routeNames = ref<DTO_RP_ListRouteName[]>([]);
//   const loadingListRouteName = ref(false);
//   const valueSelectedRoute = ref<number | null>(null);

//   // BM-36 Get List Route Name Action By Company
//   const fetchListRouteName = async (company_id: string) => {
//     loadingListRouteName.value = true;
//     try {
//       const response = await getListRouteNameActionByCompany(company_id);
//       if (response.success) {
//         if (response.result) {
//           // console.log("Danh sách tuyến:", response.result);
//           routeNames.value = response.result;
//         }
//       } else {
//         notifyError(response.message || "Lấy danh sách tuyến thất bại!");
//       }
//     } catch (error) {
//       notifyError("Đã xảy ra lỗi khi lấy danh sách tuyến!");
//       console.error("Error fetching route names:", error);
//     } finally {
//       loadingListRouteName.value = false;
//     }
//   };

//   const handleRouteChange = (id: number) => {
//     const selectedRoute = routeNames.value.find((r) => r.id === id);
//     valueSelectedRoute.value = selectedRoute ? selectedRoute.id : 0;
//     console.log("Tuyến được chọn:", selectedRoute);
//     console.log("ID tuyến:", valueSelectedRoute.value);

//     // Lưu route đã chọn vào localStorage
//     if (selectedRoute) {
//       localStorage.setItem('selectedRouteId', selectedRoute.id.toString());
//     }
//   };



//   const isSettingProgrammatically = ref(false);

//   const handleQueryTicket = async (item: DTO_RP_SearchTicket) => {
//     console.log("Selected item:", item);
//     try {
//       console.log("Truy vấn vé với route_id:", item.route_id);

//       // Set flag trước khi thao tác
//       isSettingProgrammatically.value = true;

//       if (routeNames.value.length === 0) {
//         console.log("Danh sách route chưa load, đang tải...");
//         await fetchListRouteName(useUserStore.company_id ?? '');
//       }

//       const selectedRoute = routeNames.value.find(
//         (r) => r.id === item.route_id
//       );

//       if (selectedRoute) {
//         // Đợi một tick để đảm bảo routeNames đã được cập nhật
//         await nextTick();

//         queryRouteID.value = item.route_id;
//         queryDate.value = item.departure_date;
//         queryTripID.value = item.trip_id;
//         queryTicketID.value = item.ticket_id;

//         console.log("Query route_id:", queryRouteID.value);
//         console.log("Query departure_date:", queryDate.value);
//         console.log("Query trip_id:", queryTripID.value);
//         console.log("Query ticket_id:", queryTicketID.value);

//         return {
//           success: true,
//           routeId: item.route_id,
//           selectedRoute
//         };
//       } else {
//         console.warn("Không tìm thấy route với ID:", item.route_id);
//         return { success: false, error: "Route not found" };
//       }
//     } catch (error) {
//       console.error("Lỗi khi truy vấn vé:", error);
//       return { success: false, error };
//     } finally {
//       // Reset flag sau khi hoàn thành
//       setTimeout(() => {
//         isSettingProgrammatically.value = false;
//       }, 100);
//     }
//   }
//   return {
//     routeNames,
//     loadingListRouteName,
//     valueSelectedRoute,
//     fetchListRouteName,
//     handleRouteChange,
//     handleQueryTicket,
//     // ticketList,
//     // selectedTickets,
//     loadingListTicket,
//     fetchListTicketByTrip,
//     getFloorSeats,
//     getAvailableFloors,
//     setupRealtimeListener,
//     isTicketSelected,
//     syncTicketsToFirebase,
//     clearAllSelectedTickets,
//     handleTicketClick,
//     getTicketSelector,

//     tripList,
//     mySelectedTickets,
//     dialogFormEditTicket,
//     loadingItemTicket,
//     updatingTicketIds,
//     handleOpenFormEditTicket,
//     handleCancelTickets,
//     updateTicketsBookedInTrip,
//     handleUpdateTickets,
//     isCopyTicket,
//     isMoveTicket,
//     handleCopyTickets,
//     handlePasteTickets,
//     handleMoveTickets,
//     cancelMoveTickets,
//     handleUpdateContactStatus,
//     fetchListCustomerByTrip,
//     listCustomer,
//     loadingTabCustomer,
//     loadingTransitUp,
//     loadingTransitDown,
//     listTransitUp,
//     listTransitDown,
//     fetchListTransitUpByTrip,
//     fetchListTransitDownByTrip,
//     handlePrintTickets,
//     fetchListCancelTicketByTrip,
//     loadingListCancelTicket,
//     handleCopyTicketCanceled,
//     handleShowHistoryTicketCanceled,
//     dialogHistoryCancelTicket,
//     loadingHistoryCancelTicket,
//     historyCancelTicketData,
//   };
// };
