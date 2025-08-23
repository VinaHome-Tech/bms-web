import { remove, update } from "firebase/database";
import { getListRouteNameActionByCompany } from "~/api/routeAPI";
import {
  cancelTickets,
  copyTickets,
  getListCustomerByTrip,
  getListTicketsByTrip,
  getListTransitDownByTrip,
  getListTransitUpByTrip,
  moveTickets,
  updateContactStatus,
  updateTickets,
} from "~/api/ticketAPI";
import { userStore } from "~/stores/useUserStore";
import type { DTO_RP_ListRouteName } from "~/types/routeType";
import type {
  CancelTicketType,
  DTO_RP_ListCustomerByTrip,
  DTO_RP_ListTransitDownByTrip,
  DTO_RP_ListTransitUpByTrip,
  DTO_RP_SearchTicket,
  DTO_RQ_UpdateTicket,
  TicketType,
} from "~/types/ticketType";
import type { UserActionType } from "~/types/userType";
export const ticketList = ref<TicketType[]>([]);
export const isMoveTicket = ref(false);
export const loadingMoveTicket = ref(false);
export const selectedTickets = ref<TicketType[]>([]);
export const queryRouteID = ref<number | null>(null);
export const queryDate = ref<Date | string>(new Date());
export const queryTripID = ref<number | null>(null);
export const queryTicketID = ref<number | null>(null);
export const useTicketManagement = () => {
  const loadingListTicket = ref(false);
  const useUserStore = userStore();
  const { db, ref: dbRef, set, onValue } = useFirebase();

  const dialogFormEditTicket = ref(false);
  const loadingItemTicket = ref(false);

  const updatingTicketIds = ref<Set<number>>(new Set());
  const useOffice = useOfficeStore();
  const copyTicketStore = useCopyTicketStore();
  const moveTicketStore = useMoveTicketStore();
  const isCopyTicket = ref(false);

  const fetchListTicketByTrip = async (id: number) => {
    loadingListTicket.value = true;
    try {
      const response = await getListTicketsByTrip(id);
      if (response.success) {
        if (response.result) {
          ticketList.value = response.result;
          console.log("Danh sách vé:", ticketList.value);
        }
      } else {
        ElNotification({
          message: h(
            "p",
            { style: "color: red" },
            response.message || "Không thể tải danh sách vé!"
          ),
          type: "error",
        });
      }
    } catch (error) {
      ElNotification({
        message: h(
          "p",
          { style: "color: red" },
          "Đã xảy ra lỗi khi tải danh sách vé!"
        ),
        type: "error",
      });
      console.error("Error fetching tickets:", error);
    } finally {
      loadingListTicket.value = false;
    }
  };

  const getFloorSeats = (floor: number) => {
    const floorTickets = ticketList.value.filter(
      (ticket) => ticket.seat_floor === floor
    );
    const rows = new Map();

    floorTickets.forEach((ticket) => {
      const rowNumber = ticket.seat_row;
      if (!rows.has(rowNumber)) {
        rows.set(rowNumber, []);
      }
      rows.get(rowNumber).push(ticket);
    });

    // Sort rows by row number and seats by column
    const sortedRows = Array.from(rows.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([rowNumber, seats]) => ({
        rowNumber,
        seats: seats.sort(
          (a: TicketType, b: TicketType) => a.seat_column - b.seat_column
        ),
      }));

    return sortedRows;
  };

  const getAvailableFloors = () => {
    const floors = [
      ...new Set(ticketList.value.map((ticket) => ticket.seat_floor)),
    ];
    return floors.sort((a, b) => a - b);
  };

  const setupRealtimeListener = (tripId: number) => {
    const ticketRef = dbRef(db, `selectedTickets/${tripId}`);
    onValue(ticketRef, (snapshot) => {
      const data = snapshot.val();
      const selected: TicketType[] = [];

      if (data && ticketList.value.length > 0) {
        for (const [ticketIdStr, userName] of Object.entries(data)) {
          const ticket = ticketList.value.find(
            (t) => t.id === Number(ticketIdStr)
          );
          if (ticket) {
            selected.push({
              ...ticket,
              selectedBy: typeof userName === "string" ? userName : undefined,
            });
          }
        }
      }
      selectedTickets.value = selected;
    });

    // ✅ SỬA: Listener cho thông tin vé - ưu tiên thông tin local
    onValue(dbRef(db, `tickets/${tripId}`), (snapshot) => {
      const updatedTickets = snapshot.val();
      if (!updatedTickets) return;

      ticketList.value = ticketList.value.map((originalTicket) => {
        const updatedData = updatedTickets[originalTicket.id];
        if (updatedData) {
          return {
            ...originalTicket, // Giữ nguyên thông tin gốc
            ...updatedData, // Merge thông tin từ Firebase

            // ✅ Ưu tiên thông tin từ local nếu Firebase không có
            user_created:
              updatedData.user_created || originalTicket.user_created,
            office_created:
              updatedData.office_created || originalTicket.office_created,

            // Đảm bảo không ghi đè thông tin ghế
            id: originalTicket.id,
            seat_name: originalTicket.seat_name,
            seat_row: originalTicket.seat_row,
            seat_column: originalTicket.seat_column,
            seat_floor: originalTicket.seat_floor,
          };
        }
        return originalTicket;
      });

      console.log("🔄 Đã cập nhật vé từ Firebase (ưu tiên local)");
    });
  };
  const isTicketSelected = (ticket: TicketType) => {
    return selectedTickets.value.some((t) => t.id === ticket.id);
  };

  const FIREBASE_SYNC_FIELDS = {
    // Thông tin khách hàng - có thể cập nhật
    ticket_phone: true,
    ticket_email: true,
    ticket_customer_name: true,
    ticket_point_up: true,
    ticket_point_down: true,
    ticket_note: true,
    ticket_display_price: true,
    payment_method: true,
    booked_status: true,

    // Metadata cập nhật - chỉ thêm khi cập nhật
    updatedAt: true,
    updatedBy: true,

    // ✅ SỬA: Cho phép sync thông tin tạo khi có dữ liệu từ backend
    user_created: true,
    office_created: true,
    office_id: true,
    agent_id: true,
    contact_status: true,

    // Thông tin ghế - KHÔNG được thay đổi
    id: false,
    seat_name: false,
    seat_row: false,
    seat_column: false,
    seat_floor: false,
    trip_id: false,
    selectedBy: false,
  } as const;

  // ✅ SỬA: Cập nhật setupRealtimeListener để xử lý tốt hơn

  const syncTicketsToFirebase = async (
    tripId: number,
    ticketIds: number[],
    updatedFields: Partial<TicketType>,
    options: {
      includeMetadata?: boolean;
      preserveCreatedFields?: boolean;
      logSync?: boolean;
    } = {}
  ) => {
    try {
      const {
        includeMetadata = true,
        preserveCreatedFields = true,
        logSync = true,
      } = options;
      const updates: Record<string, unknown> = {};
      const timestamp = Date.now();

      // Loại bỏ các giá trị undefined
      const sanitizedFields = Object.fromEntries(
        Object.entries(updatedFields).filter(([key, value]) => {
          // Chỉ đồng bộ field được phép và có giá trị
          return (
            FIREBASE_SYNC_FIELDS[key as keyof typeof FIREBASE_SYNC_FIELDS] &&
            value !== undefined &&
            value !== null
          );
        })
      );

      if (preserveCreatedFields) {
        delete sanitizedFields.id;
        delete sanitizedFields.seat_name;
        delete sanitizedFields.seat_row;
        delete sanitizedFields.seat_column;
        delete sanitizedFields.seat_floor;
        delete sanitizedFields.trip_id;
      }

      if (includeMetadata) {
        sanitizedFields.updatedAt = timestamp;
        sanitizedFields.updatedBy = useUserStore.full_name || "unknown";
      }

      ticketIds.forEach((ticketId) => {
        updates[`tickets/${tripId}/${ticketId}`] = { ...sanitizedFields };
      });

      if (logSync) {
        console.log("🔄 Firebase Sync:", {
          tripId,
          ticketCount: ticketIds.length,
          ticketIds,
          syncedFields: Object.keys(sanitizedFields),
          preservedFields: preserveCreatedFields
            ? ["user_created", "office_created", "office_id", "contact_status"]
            : [],
          data: sanitizedFields,
        });
      }

      await update(dbRef(db), updates);
      if (logSync) {
        console.log("✅ Firebase sync completed successfully");
      }
    } catch (error) {
      console.error("Lỗi đồng bộ Firebase:", error);
    }
  };

  const clearAllSelectedTickets = async () => {
    if (!selectedTrip.value?.trip_id) return;
    // cancelMoveTickets(); // Removed due to missing export
    const tripId = selectedTrip.value.trip_id;

    // Lấy danh sách vé đang được chọn bởi user hiện tại
    const myTickets = selectedTickets.value.filter(
      (t) => t.selectedBy === useUserStore.full_name
    );

    try {
      // Xóa từng vé khỏi Firebase
      for (const ticket of myTickets) {
        await remove(dbRef(db, `selectedTickets/${tripId}/${ticket.id}`));
      }

      // Cập nhật local state
      selectedTickets.value = selectedTickets.value.filter(
        (t) => t.selectedBy !== useUserStore.full_name
      );

    } catch (error) {
      console.error("Lỗi khi bỏ chọn vé khỏi Firebase:", error);
      ElNotification({
        message: h(
          "p",
          { style: "color: red" },
          "Đã xảy ra lỗi khi bỏ chọn vé!"
        ),
        type: "error",
      });
    }
  };
  const destinationTickets = ref<TicketType[]>([]);
  const handleTicketClick = async (ticket: TicketType) => {
    if (isMoveTicket.value) {
      if (ticket.booked_status) {
        ElNotification({
          message: h("p", { style: "color: red" }, "Ghế này đã được đặt!"),
          type: "warning",
        });
        return;
      }

      if (destinationTickets.value.some((t) => t.id === ticket.id)) {
        ElNotification({
          message: h(
            "p",
            { style: "color: orange" },
            "Bạn đã chọn ghế này rồi."
          ),
          type: "info",
        });
        return;
      }

      destinationTickets.value.push(ticket);
      console.log("Ghế đích đã chọn:", destinationTickets.value);

      if (
        destinationTickets.value.length ===
        moveTicketStore.mySelectedTickets.length
      ) {
        // Gọi hàm xử lý dán vé
        await handlePasteMovedTickets(destinationTickets.value);

        // Reset trạng thái
        isMoveTicket.value = false;
        destinationTickets.value = [];
        moveTicketStore.removeTicket();
      }

      // Không làm gì khác nữa nếu đang di chuyển vé
      return;
    }
    console.log("Vé được chọn:", ticket);
    console.log("Chuyến", selectedTrip.value);
    if (!selectedTrip.value?.trip_id || !useUserStore.full_name) return;

    const tripId = selectedTrip.value.trip_id;
    const ticketPath = `selectedTickets/${tripId}/${ticket.id}`;
    const currentUser = useUserStore.full_name;

    // Lấy danh sách vé ĐÃ CHỌN bởi user hiện tại
    const userSelectedTickets = selectedTickets.value.filter(
      (t) => t.selectedBy === currentUser
    );
    const index = userSelectedTickets.findIndex((t) => t.id === ticket.id);

    try {
      if (index === -1) {
        // 🔹 1. Nếu vé đang chọn là vé KHÔNG CÓ SỐ ĐIỆN THOẠI (hoặc chưa đặt)
        if (!ticket.booked_status || !ticket.ticket_phone?.trim()) {
          // Kiểm tra xem user có đang chọn vé CÓ SỐ ĐIỆN THOẠI không
          const hasBookedTicketWithPhone = userSelectedTickets.some(
            (t) => t.booked_status && t.ticket_phone?.trim()
          );

          // Nếu có => BỎ CHỌN TẤT CẢ VÉ CÓ SỐ ĐIỆN THOẠI trước khi chọn vé mới
          if (hasBookedTicketWithPhone) {
            for (const selectedTicket of userSelectedTickets) {
              if (
                selectedTicket.booked_status &&
                selectedTicket.ticket_phone?.trim()
              ) {
                await remove(
                  dbRef(db, `selectedTickets/${tripId}/${selectedTicket.id}`)
                );
              }
            }
          }

          // Cho phép chọn vé KHÔNG CÓ SỐ ĐIỆN THOẠI (không giới hạn số lượng)
          await set(dbRef(db, ticketPath), currentUser);
        }
        // 🔹 2. Nếu vé đang chọn là vé CÓ SỐ ĐIỆN THOẠI (đã đặt)
        else {
          // Kiểm tra xem user có đang chọn vé KHÔNG CÓ SỐ ĐIỆN THOẠI không
          const hasUnbookedTicket = userSelectedTickets.some(
            (t) => !t.booked_status || !t.ticket_phone?.trim()
          );

          // Nếu có => BỎ CHỌN TẤT CẢ VÉ CŨ (cả vé không số ĐT và vé có số ĐT khác)
          if (hasUnbookedTicket) {
            for (const selectedTicket of userSelectedTickets) {
              await remove(
                dbRef(db, `selectedTickets/${tripId}/${selectedTicket.id}`)
              );
            }
          }

          // Chọn vé hiện tại (có số điện thoại)
          await set(dbRef(db, ticketPath), currentUser);

          // Tự động chọn các vé CÙNG SỐ ĐIỆN THOẠI (nếu có)
          const ticketsToAutoSelect = ticketList.value.filter(
            (t) =>
              t.ticket_phone === ticket.ticket_phone &&
              t.id !== ticket.id &&
              t.booked_status === true &&
              !selectedTickets.value.some((selected) => selected.id === t.id)
          );

          for (const relatedTicket of ticketsToAutoSelect) {
            await set(
              dbRef(db, `selectedTickets/${tripId}/${relatedTicket.id}`),
              currentUser
            );
          }
        }
      } else {
        // 🔹 3. Nếu đang BỎ CHỌN vé (chỉ xóa nếu vé thuộc về user hiện tại)
        const ticketToRemove = selectedTickets.value.find(
          (t) => t.id === ticket.id
        );
        if (ticketToRemove?.selectedBy === currentUser) {
          await remove(dbRef(db, ticketPath));
        }
      }
    } catch (error) {
      console.error("Lỗi cập nhật Firebase:", error);
    }
  };

  const getTicketSelector = (ticket: TicketType) => {
    const found = selectedTickets.value.find((t) => t.id === ticket.id);
    return found?.selectedBy || null;
  };

  const handleOpenFormEditTicket = () => {
    dialogFormEditTicket.value = true;
  };

  const mySelectedTickets = computed(() => {
    return selectedTickets.value.filter(
      (t) => t.selectedBy === useUserStore.full_name
    );
  });

  const updateTicketsBookedInTrip = () => {
    const bookedTicketsCount = ticketList.value.filter(
      (ticket) => ticket.booked_status === true
    ).length;
    console.log(
      `Số lượng vé đã đặt (booked_status = true): ${bookedTicketsCount}`
    );
    console.log("Vé:", ticketList.value);

    tripList.value = tripList.value.map((trip) => {
      if (trip.trip_id === selectedTrip.value?.trip_id) {
        return {
          ...trip,
          tickets_booked: bookedTicketsCount,
        };
      }
      return trip;
    });

    selectedTrip.value = {
      ...selectedTrip.value!,
      tickets_booked: bookedTicketsCount,
    };
  };
  // const updateTicketsBookedInMultipleTrips = async (
  //   sourceTripId: number,
  //   destinationTripId: number,
  //   movedTicketsCount: number = 0
  // ) => {
  //   try {
  //     console.log("🔄 Cập nhật số lượng vé cho 2 chuyến:", {
  //       sourceTripId,
  //       destinationTripId,
  //       movedTicketsCount,
  //     });

  //     // 🔹 1. Lấy danh sách vé cho chuyến nguồn
  //     const sourceResponse = await getListTicketsByTrip(sourceTripId);
  //     let sourceBookedCount = 0;
  //     if (sourceResponse.success && sourceResponse.result) {
  //       sourceBookedCount = sourceResponse.result.filter(
  //         (ticket: TicketType) => ticket.booked_status === true
  //       ).length;
  //     }

  //     // 🔹 2. Lấy danh sách vé cho chuyến đích
  //     const destinationResponse = await getListTicketsByTrip(destinationTripId);
  //     let destinationBookedCount = 0;
  //     if (destinationResponse.success && destinationResponse.result) {
  //       destinationBookedCount = destinationResponse.result.filter(
  //         (ticket: TicketType) => ticket.booked_status === true
  //       ).length;
  //     }

  //     // 🔹 3. Cập nhật tripList cho cả 2 chuyến
  //     tripList.value = tripList.value.map((trip) => {
  //       if (trip.trip_id === sourceTripId) {
  //         return {
  //           ...trip,
  //           tickets_booked: sourceBookedCount,
  //         };
  //       }
  //       if (trip.trip_id === destinationTripId) {
  //         return {
  //           ...trip,
  //           tickets_booked: destinationBookedCount,
  //         };
  //       }
  //       return trip;
  //     });

  //     // 🔹 4. Cập nhật selectedTrip nếu đang xem một trong 2 chuyến
  //     if (selectedTrip.value?.trip_id === sourceTripId) {
  //       selectedTrip.value = {
  //         ...selectedTrip.value,
  //         tickets_booked: sourceBookedCount,
  //       };
  //     } else if (selectedTrip.value?.trip_id === destinationTripId) {
  //       selectedTrip.value = {
  //         ...selectedTrip.value,
  //         tickets_booked: destinationBookedCount,
  //       };
  //     }

  //     console.log("✅ Đã cập nhật số lượng vé:", {
  //       sourceTrip: { id: sourceTripId, booked: sourceBookedCount },
  //       destinationTrip: {
  //         id: destinationTripId,
  //         booked: destinationBookedCount,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("❌ Lỗi khi cập nhật số lượng vé cho 2 chuyến:", error);
  //     ElNotification({
  //       message: h(
  //         "p",
  //         { style: "color: red" },
  //         "Không thể cập nhật số lượng vé cho các chuyến!"
  //       ),
  //       type: "error",
  //     });
  //   }
  // };

  // // 🔹 THÊM: Hàm tiện ích để cập nhật số lượng vé từ danh sách tickets có sẵn
  // const updateTicketsBookedFromTicketList = (
  //   tripId: number,
  //   ticketsList: TicketType[]
  // ) => {
  //   const bookedCount = ticketsList.filter(
  //     (ticket) => ticket.booked_status === true
  //   ).length;

  //   // Cập nhật tripList
  //   tripList.value = tripList.value.map((trip) => {
  //     if (trip.trip_id === tripId) {
  //       return {
  //         ...trip,
  //         tickets_booked: bookedCount,
  //       };
  //     }
  //     return trip;
  //   });

  //   // Cập nhật selectedTrip nếu đang xem chuyến này
  //   if (selectedTrip.value?.trip_id === tripId) {
  //     selectedTrip.value = {
  //       ...selectedTrip.value,
  //       tickets_booked: bookedCount,
  //     };
  //   }

  //   console.log(
  //     `📊 Cập nhật số lượng vé cho chuyến ${tripId}: ${bookedCount} vé`
  //   );
  //   return bookedCount;
  // };

  // [FEAT]: Cancel ticket
  const handleCancelTickets = async (tickets: CancelTicketType) => {
    console.log("Hủy vé:", tickets);
    loadingItemTicket.value = true;
    tickets.id.forEach((id) => updatingTicketIds.value.add(id));
    try {
      const response = await cancelTickets(
        {
          id: useUserStore.id,
          username: useUserStore.username,
          full_name: useUserStore.full_name,
          company_id: useUserStore.company_id,
        } as UserActionType,
        tickets
      );
      if (response.result) {
        ticketList.value = ticketList.value.map((ticket) => {
          if (tickets.id.includes(ticket.id)) {
            return {
              ...ticket,
              ticket_phone: ticket.ticket_phone || "",
              ticket_email: ticket.ticket_email || "",
              ticket_customer_name: ticket.ticket_customer_name || "",
              ticket_point_up: ticket.ticket_point_up || "",
              ticket_point_down: ticket.ticket_point_down || "",
              ticket_note: ticket.ticket_note || "",
              ticket_display_price: ticket.ticket_display_price || 0,
              booked_status: false,
            };
          }
          return ticket;
        });
        if (selectedTrip.value?.trip_id) {
          const ticketsToSync = ticketList.value.filter((ticket) =>
            tickets.id.includes(ticket.id)
          );
          await syncTicketsToFirebase(selectedTrip.value!.trip_id, tickets.id, {
            ticket_phone: "",
            ticket_email: "",
            ticket_customer_name: "",
            ticket_point_up: "",
            ticket_point_down: "",
            ticket_note: "",
            ticket_display_price: ticketsToSync[0]?.ticket_display_price || 0,
            booked_status: false,
          });
          const tripId = selectedTrip.value.trip_id;
          for (const ticketId of tickets.id) {
            await remove(dbRef(db, `selectedTickets/${tripId}/${ticketId}`));
            await remove(dbRef(db, `tickets/${tripId}/${ticketId}`));
          }
        }
        updateTicketsBookedInTrip();
        ElNotification({
          message: h("p", { style: "color: green" }, "Hủy vé thành công!"),
          type: "success",
        });
      } else {
        ElNotification({
          message: h("p", { style: "color: red" }, "Hủy vé thất bại!"),
          type: "error",
        });
      }
    } catch (error) {
      console.error("Lỗi khi hủy vé:", error);
      ElNotification({
        message: h("p", { style: "color: red" }, "Đã xảy ra lỗi khi hủy vé!"),
        type: "error",
      });
    } finally {
      loadingItemTicket.value = false;
      updatingTicketIds.value.clear();
    }
  };

  const handleUpdateTickets = async (tickets: DTO_RQ_UpdateTicket) => {
    console.log("Cập nhật vé:", tickets);
    loadingItemTicket.value = true;
    tickets.id.forEach((id: number) => updatingTicketIds.value.add(id));

    try {
      const response = await updateTickets(
        {
          id: useUserStore.id,
          username: useUserStore.username,
          full_name: useUserStore.full_name,
          company_id: useUserStore.company_id,
        } as UserActionType,
        tickets
      );

      if (response.success) {
        if (response.result && Array.isArray(response.result)) {
          await clearAllSelectedTickets();
          selectedTickets.value.length = 0;
          queryDate.value = '';
          queryTripID.value = null;
          queryTicketID.value = null;
          const updatedTicketsMap = new Map(
            response.result.map((ticket: TicketType) => [ticket.id, ticket])
          );

          ticketList.value = ticketList.value.map((ticket) => {
            const updatedTicket = updatedTicketsMap.get(ticket.id);
            if (updatedTicket) {
              return {
                ...ticket,
                ...updatedTicket,
                booked_status: true,
              };
            }
            return ticket;
          });

          if (selectedTrip.value?.trip_id) {
            const updatedTickets = response.result.filter(
              (ticket: TicketType) => tickets.id.includes(ticket.id)
            );

            for (const ticket of updatedTickets) {
              await syncTicketsToFirebase(
                selectedTrip.value.trip_id,
                [ticket.id],
                {
                  ticket_phone: ticket.ticket_phone,
                  ticket_email: ticket.ticket_email,
                  ticket_customer_name: ticket.ticket_customer_name,
                  ticket_point_up: ticket.ticket_point_up,
                  ticket_point_down: ticket.ticket_point_down,
                  ticket_note: ticket.ticket_note,
                  ticket_display_price: ticket.ticket_display_price,
                  payment_method: ticket.payment_method,
                  booked_status: true,

                  user_created: ticket.user_created,
                  office_created: ticket.office_created,
                },
                {
                  includeMetadata: true,
                  preserveCreatedFields: false,
                  logSync: true,
                }
              );
            }
          }
        } else {
          const updatedIds = new Set(tickets.id);
          const { id, ...rest } = tickets;

          ticketList.value = ticketList.value.map((ticket) => {
            if (updatedIds.has(ticket.id)) {
              return {
                ...ticket,
                ...rest,
                booked_status: true,
                user_created: ticket.user_created,
                office_created: ticket.office_created,
                office_id: ticket.office_id,
                agent_id: ticket.agent_id,
              };
            }
            return ticket;
          });

          if (selectedTrip.value?.trip_id) {
            const { id, ...ticketFields } = tickets;
            await syncTicketsToFirebase(
              selectedTrip.value.trip_id,
              tickets.id,
              {
                ...ticketFields,
                booked_status: true,
              },
              {
                includeMetadata: true,
                preserveCreatedFields: true,
                logSync: true,
              }
            );
          }
        }

        updateTicketsBookedInTrip();
        
        ElNotification({
          message: h("p", { style: "color: green" }, "Cập nhật vé thành công!"),
          type: "success",
        });
      } else {
        ElNotification({
          message: h(
            "p",
            { style: "color: red" },
            response.message || "Cập nhật vé thất bại!"
          ),
          type: "error",
        });
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật vé:", error);
      ElNotification({
        message: h(
          "p",
          { style: "color: red" },
          "Đã xảy ra lỗi khi cập nhật vé!"
        ),
        type: "error",
      });
    } finally {
      loadingItemTicket.value = false;
      updatingTicketIds.value.clear();
    }
  };

  const handleCopyTickets = async () => {
    console.log("Sao chép vé:", mySelectedTickets.value);
    ElNotification({
      message: h(
        "p",
        { style: "color: green" },
        `Đã sao chép ${mySelectedTickets.value.length} vé!`
      ),
      type: "success",
    });
    await copyTicketStore.setTickets(mySelectedTickets.value);
    console.log("Pinia sao chép:", copyTicketStore.mySelectedTickets);
    await clearAllSelectedTickets();
    isCopyTicket.value = true;
  };

  const handlePasteTickets = async () => {
    if (!isCopyTicket.value) {
      ElNotification({
        message: h("p", { style: "color: red" }, "Chưa sao chép vé nào!"),
        type: "warning",
      });
      return;
    }
    const copiedTickets = copyTicketStore.mySelectedTickets;
    if (copiedTickets.length === 0) {
      ElNotification({
        message: h("p", { style: "color: red" }, "Không có vé nào để dán!"),
        type: "warning",
      });
      return;
    }
    loadingItemTicket.value = true;
    try {
      const response = await copyTickets(
        {
          id: useUserStore.id,
          username: useUserStore.username,
          full_name: useUserStore.full_name,
          company_id: useUserStore.company_id,
          office_id: useOffice.id,
        } as UserActionType,
        copiedTickets.map((ticket) => ({
          id: ticket.id,
          booked_status: ticket.booked_status,
          ticket_phone: ticket.ticket_phone,
          ticket_email: ticket.ticket_email,
          ticket_customer_name: ticket.ticket_customer_name,
          ticket_point_up: ticket.ticket_point_up,
          ticket_point_down: ticket.ticket_point_down,
          ticket_note: ticket.ticket_note,
          ticket_display_price: ticket.ticket_display_price,
          payment_method: ticket.payment_method,
        })),
        mySelectedTickets.value.map((t) => t.id)
      );
      if (response.success) {
        // Xử lý dữ liệu trả về từ API
        if (response.result && Array.isArray(response.result)) {
          // Cập nhật ticketList với dữ liệu mới
          const updatedTicketIds = new Set(
            mySelectedTickets.value.map((t) => t.id)
          );

          ticketList.value = ticketList.value.map((ticket) => {
            if (updatedTicketIds.has(ticket.id)) {
              // Tìm thông tin vé tương ứng từ response
              const updatedTicket = response.result?.find(
                (t: TicketType) => t.id === ticket.id
              );
              if (updatedTicket) {
                return {
                  ...ticket,
                  ...updatedTicket,
                  booked_status: true,
                };
              }
            }
            return ticket;
          });

          // Đồng bộ với Firebase
          if (selectedTrip.value?.trip_id) {
            const ticketsToSync = response.result.filter((ticket: TicketType) =>
              updatedTicketIds.has(ticket.id)
            );

            for (const ticket of ticketsToSync) {
              await syncTicketsToFirebase(
                selectedTrip.value.trip_id,
                [ticket.id],
                {
                  ticket_phone: ticket.ticket_phone || "",
                  ticket_email: ticket.ticket_email || "",
                  ticket_customer_name: ticket.ticket_customer_name || "",
                  ticket_point_up: ticket.ticket_point_up || "",
                  ticket_point_down: ticket.ticket_point_down || "",
                  ticket_note: ticket.ticket_note || "",
                  ticket_display_price: ticket.ticket_display_price || 0,
                  payment_method: ticket.payment_method || "",
                  booked_status: true,
                }
              );
            }
          }

          // Cập nhật số lượng vé đã đặt
          updateTicketsBookedInTrip();

          // Bỏ chọn tất cả vé sau khi dán
          await clearAllSelectedTickets();

          ElNotification({
            message: h(
              "p",
              { style: "color: green" },
              `Dán thành công ${response.result.length} vé!`
            ),
            type: "success",
          });
        } else {
          ElNotification({
            message: h(
              "p",
              { style: "color: green" },
              "Sao chép vé thành công!"
            ),
            type: "success",
          });
        }
      } else {
        ElNotification({
          message: h("p", { style: "color: red" }, "Sao chép vé thất bại!"),
          type: "error",
        });
      }
    } catch (error) {
      console.error("Lỗi khi sao chép vé:", error);
      ElNotification({
        message: h(
          "p",
          { style: "color: red" },
          "Đã xảy ra lỗi khi sao chép vé!"
        ),
        type: "error",
      });
    } finally {
      isCopyTicket.value = false;
    }
  };

  const handleMoveTickets = async () => {
    console.log("Di chuyển vé:", mySelectedTickets.value);
    ElNotification({
      message: h(
        "p",
        { style: "color: green" },
        `Đã chọn ${mySelectedTickets.value.length} vé!`
      ),
      type: "success",
    });
    await moveTicketStore.setTickets(
      mySelectedTickets.value.map((ticket) => ({
        id: ticket.id,
        booked_status: ticket.booked_status,
        ticket_phone: ticket.ticket_phone,
        ticket_email: ticket.ticket_email,
        ticket_customer_name: ticket.ticket_customer_name,
        ticket_point_up: ticket.ticket_point_up,
        ticket_point_down: ticket.ticket_point_down,
        ticket_note: ticket.ticket_note,
        ticket_display_price: ticket.ticket_display_price,
        payment_method: ticket.payment_method,
        user_created: ticket.user_created,
        user_id_created: ticket.user_id_created,
        office_id: ticket.office_id ?? 0,
      }))
    );
    console.log("Pinia di chuyển:", moveTicketStore.mySelectedTickets);
    isMoveTicket.value = true;
  };

  // ...existing code...

  const handlePasteMovedTickets = async (destinationSeats: TicketType[]) => {
    const sourceTickets = moveTicketStore.mySelectedTickets;
    console.log("Dán vé di chuyển:", sourceTickets, destinationSeats);

    // Thêm cả source ticket IDs vào updating list
    destinationSeats.forEach((seat: TicketType) =>
      updatingTicketIds.value.add(seat.id)
    );
    sourceTickets.forEach((ticket) => updatingTicketIds.value.add(ticket.id));

    try {
      const response = await moveTickets(
        {
          id: useUserStore.id,
          username: useUserStore.username,
          full_name: useUserStore.full_name,
          company_id: useUserStore.company_id,
        } as UserActionType,
        sourceTickets,
        destinationSeats.map((t) => t.id)
      );

      console.log("Response di chuyển vé:", response);

      if (response.success) {
        if (response.result && Array.isArray(response.result)) {
          const updatedTicketsMap = new Map(
            response.result.map((ticket: TicketType) => [ticket.id, ticket])
          );

          // 🔹 CẬP NHẬT: Xử lý cả vé đích và vé nguồn
          ticketList.value = ticketList.value.map((ticket) => {
            // Cập nhật vé đích với thông tin mới
            const updatedTicket = updatedTicketsMap.get(ticket.id);
            if (updatedTicket) {
              return {
                ...ticket,
                ...updatedTicket,
                booked_status: updatedTicket.booked_status || false,
              };
            }

            // 🔹 THÊM: Làm rỗng vé nguồn cũ
            const isSourceTicket = sourceTickets.some(
              (sourceTicket) => sourceTicket.id === ticket.id
            );
            if (isSourceTicket) {
              return {
                ...ticket,
                ticket_phone: "",
                ticket_email: "",
                ticket_customer_name: "",
                ticket_point_up: "",
                ticket_point_down: "",
                ticket_note: "",
                ticket_display_price: ticket.ticket_display_price || 0,
                payment_method: "",
                booked_status: false,
                user_created: "",
                office_created: "",
              };
            }

            return ticket;
          });

          // 🔹 ĐỒNG BỘ FIREBASE
          if (selectedTrip.value?.trip_id) {
            const tripId = selectedTrip.value.trip_id;

            // Sync vé đích (có thông tin mới) - 🔹 QUAN TRỌNG: preserveCreatedFields = false
            const destinationTicketsToSync = response.result.filter(
              (ticket: TicketType) =>
                destinationSeats.some((dest) => dest.id === ticket.id)
            );

            for (const ticket of destinationTicketsToSync) {
              await syncTicketsToFirebase(
                tripId,
                [ticket.id],
                {
                  ticket_phone: ticket.ticket_phone || "",
                  ticket_email: ticket.ticket_email || "",
                  ticket_customer_name: ticket.ticket_customer_name || "",
                  ticket_point_up: ticket.ticket_point_up || "",
                  ticket_point_down: ticket.ticket_point_down || "",
                  ticket_note: ticket.ticket_note || "",
                  ticket_display_price: ticket.ticket_display_price || 0,
                  payment_method: ticket.payment_method || "",
                  booked_status: ticket.booked_status || false,
                  user_created: ticket.user_created || "",
                  office_created: ticket.office_created || "",
                },
                {
                  includeMetadata: true,
                  preserveCreatedFields: false, // 🔹 SỬA: false để sync user_created và office_created
                  logSync: true,
                }
              );
            }

            // 🔹 THÊM: Sync vé nguồn (làm rỗng) - 🔹 QUAN TRỌNG: preserveCreatedFields = false
            const sourceTicketIds = sourceTickets.map((ticket) => ticket.id);
            for (const sourceTicketId of sourceTicketIds) {
              await syncTicketsToFirebase(
                tripId,
                [sourceTicketId],
                {
                  ticket_phone: "",
                  ticket_email: "",
                  ticket_customer_name: "",
                  ticket_point_up: "",
                  ticket_point_down: "",
                  ticket_note: "",
                  payment_method: "",
                  booked_status: false,
                  user_created: "",
                  office_created: "",
                },
                {
                  includeMetadata: true,
                  preserveCreatedFields: false, // 🔹 SỬA: false để sync user_created và office_created
                  logSync: true,
                }
              );

              // 🔹 XÓA khỏi Firebase selected tickets
              await remove(
                dbRef(db, `selectedTickets/${tripId}/${sourceTicketId}`)
              );
            }
          }

          // Cập nhật số lượng vé đã đặt
          await clearAllSelectedTickets();
          cancelMoveTickets();
          updateTicketsBookedInTrip();

          ElNotification({
            message: h(
              "p",
              { style: "color: green" },
              `Di chuyển thành công ${destinationSeats.length} vé!`
            ),
            type: "success",
          });
        }
      } else {
        ElNotification({
          message: h(
            "p",
            { style: "color: red" },
            response.message || "Di chuyển vé thất bại!"
          ),
          type: "error",
        });
      }
    } catch (error) {
      console.error("Lỗi khi dán vé di chuyển:", error);
      ElNotification({
        message: h(
          "p",
          { style: "color: red" },
          "Đã xảy ra lỗi khi dán vé di chuyển!"
        ),
        type: "error",
      });
    } finally {
      loadingMoveTicket.value = false;
      updatingTicketIds.value.clear();
    }
  };

  const cancelMoveTickets = () => {
    console.log("Hủy di chuyển vé");
    isMoveTicket.value = false;
    moveTicketStore.removeTicket();
  };

  const handleUpdateContactStatus = async (status: number) => {
    console.log("Cập nhật trạng thái liên hệ:", status);
    console.log("Cập nhật trạng thái liên hệ cho vé:", mySelectedTickets.value);
    mySelectedTickets.value.forEach((ticket) =>
      updatingTicketIds.value.add(ticket.id)
    );
    try {
      const response = await updateContactStatus(
        {
          id: useUserStore.id,
          username: useUserStore.username,
          full_name: useUserStore.full_name,
          company_id: useUserStore.company_id,
        } as UserActionType,
        mySelectedTickets.value.map((ticket) => ticket.id),
        status
      );
      console.log("Response cập nhật trạng thái liên hệ:", response);
      if (response.success) {
        if (response.result && Array.isArray(response.result)) {
          const updatedTicketIds = new Set(
            mySelectedTickets.value.map((t) => t.id)
          );

          ticketList.value = ticketList.value.map((ticket) => {
            if (updatedTicketIds.has(ticket.id)) {
              const updatedTicket = response.result?.find(
                (t: TicketType) => t.id === ticket.id
              );
              if (updatedTicket) {
                return {
                  ...ticket,
                  ...updatedTicket,
                  booked_status: true,
                };
              }
            }
            return ticket;
          });

          if (selectedTrip.value?.trip_id) {
            const ticketsToSync = response.result.filter((ticket: TicketType) =>
              updatedTicketIds.has(ticket.id)
            );

            for (const ticket of ticketsToSync) {
              await syncTicketsToFirebase(
                selectedTrip.value.trip_id,
                [ticket.id],
                {
                  ticket_phone: ticket.ticket_phone || "",
                  ticket_email: ticket.ticket_email || "",
                  ticket_customer_name: ticket.ticket_customer_name || "",
                  ticket_point_up: ticket.ticket_point_up || "",
                  ticket_point_down: ticket.ticket_point_down || "",
                  ticket_note: ticket.ticket_note || "",
                  ticket_display_price: ticket.ticket_display_price || 0,
                  payment_method: ticket.payment_method || "",
                  booked_status: true,
                  contact_status: status,
                  office_id: mySelectedTickets.value[0].office_id || 0,
                  user_created: mySelectedTickets.value[0].user_created || "",
                  office_created:
                    mySelectedTickets.value[0].office_created || "",
                }
              );
            }
          }

          await clearAllSelectedTickets();
          updateTicketsBookedInTrip();
        }
      } else {
        ElNotification({
          message: h(
            "p",
            { style: "color: red" },
            response.message || "Cập nhật trạng thái liên hệ thất bại!"
          ),
          type: "error",
        });
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái liên hệ:", error);
      ElNotification({
        message: h(
          "p",
          { style: "color: red" },
          "Đã xảy ra lỗi khi cập nhật trạng thái liên hệ!"
        ),
        type: "error",
      });
    } finally {
      loadingItemTicket.value = false;
      updatingTicketIds.value.clear();
    }
  };

  const loadingTabCustomer = ref(false);
  const listCustomer = ref<DTO_RP_ListCustomerByTrip[]>([]);
  const fetchListCustomerByTrip = async () => {
    loadingTabCustomer.value = true;
    console.log(
      "Lấy danh sách khách hàng cho chuyến:",
      selectedTrip.value?.trip_id
    );
    try {
      const response = await getListCustomerByTrip(
        selectedTrip.value?.trip_id || 0
      );
      if (response.success) {
        listCustomer.value = response.result || [];
      } else {
        ElNotification({
          message: h(
            "p",
            { style: "color: red" },
            response.message || "Lấy danh sách khách hàng thất bại!"
          ),
          type: "error",
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khách hàng:", error);
      ElNotification({
        message: h(
          "p",
          { style: "color: red" },
          "Đã xảy ra lỗi khi lấy danh sách khách hàng!"
        ),
        type: "error",
      });
    } finally {
      loadingTabCustomer.value = false;
    }
  };

  const loadingTransitUp = ref(false);
  const loadingTransitDown = ref(false);
  const listTransitUp = ref<DTO_RP_ListTransitUpByTrip[]>([]);
  const listTransitDown = ref<DTO_RP_ListTransitDownByTrip[]>([]);
  const fetchListTransitUpByTrip = async () => {
    loadingTransitUp.value = true;
    try {
      const response = await getListTransitUpByTrip(
        selectedTrip.value?.trip_id || 0
      );
      if (response.success) {
        listTransitUp.value = response.result || [];
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khách hàng:", error);
      ElNotification({
        message: h(
          "p",
          { style: "color: red" },
          "Đã xảy ra lỗi khi lấy danh sách khách hàng!"
        ),
        type: "error",
      });
    } finally {
      loadingTransitUp.value = false;
    }
  };
  const fetchListTransitDownByTrip = async () => {
    loadingTransitDown.value = true;
    try {
      const response = await getListTransitDownByTrip(
        selectedTrip.value?.trip_id || 0
      );
      if (response.success) {
        listTransitDown.value = response.result || [];
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khách hàng:", error);
      ElNotification({
        message: h(
          "p",
          { style: "color: red" },
          "Đã xảy ra lỗi khi lấy danh sách khách hàng!"
        ),
        type: "error",
      });
    } finally {
      loadingTransitDown.value = false;
    }
  };

  const createTicketHTML = (ticket: TicketType): string => {
    return `
    <div class="ticket" style="
      width: 300px;
      height: 400px;
      border: 2px dashed #333;
      margin: 20px;
      padding: 20px;
      font-family: Arial, sans-serif;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      page-break-after: always;
    ">
      <div class="ticket-header" style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 18px; text-transform: uppercase;">${
          ticket.ticket_customer_name
        }</h2>
        <div style="height: 2px; background: white; margin: 10px 0;"></div>
      </div>
      
      <div class="ticket-body">
        <div class="info-row" style="margin-bottom: 12px;">
          <strong>Khách hàng:</strong> ${ticket.ticket_customer_name}
        </div>
        
        <div class="info-row" style="margin-bottom: 12px;">
          <strong>Loại vé:</strong> ${ticket.ticket_customer_name}
        </div>
        
        <div class="info-row" style="margin-bottom: 12px;">
          <strong>Giá vé:</strong> ${ticket.ticket_display_price.toLocaleString(
            "vi-VN"
          )} VNĐ
        </div>
        
        <div class="info-row" style="margin-bottom: 12px;">
          <strong>Ngày:</strong> ${new Date(
            ticket.ticket_customer_name
          ).toLocaleDateString("vi-VN")}
        </div>
        
        <div class="info-row" style="margin-bottom: 12px;">
          <strong>Giờ:</strong> ${ticket.ticket_customer_name}
        </div>
        
        <div class="info-row" style="margin-bottom: 12px;">
          <strong>Địa điểm:</strong> ${ticket.ticket_customer_name}
        </div>
        
        ${
          ticket.ticket_customer_name
            ? `
        <div class="info-row" style="margin-bottom: 12px;">
          <strong>Chỗ ngồi:</strong> ${ticket.ticket_customer_name}
        </div>
        `
            : ""
        }
        
        <div class="ticket-footer" style="margin-top: 20px; text-align: center;">
          <div style="font-size: 12px; opacity: 0.8;">
            Mã vé: ${ticket.id}
          </div>
          <div style="font-size: 10px; opacity: 0.6; margin-top: 5px;">
            Ngày mua: ${new Date(
              ticket.ticket_display_price
            ).toLocaleDateString("vi-VN")}
          </div>
          ${
            ticket.ticket_customer_name
              ? `
          <div style="margin-top: 10px;">
            <div style="width: 60px; height: 60px; background: white; margin: 0 auto; display: flex; align-items: center; justify-content: center; color: black; font-size: 8px;">
              QR CODE
            </div>
          </div>
          `
              : ""
          }
        </div>
      </div>
    </div>
  `;
  };
  const handlePrintTickets = (tickets: TicketType[]) => {
    console.log("In vé 2:", tickets);
    const ticketsHTML = tickets
      .map((ticket) => createTicketHTML(ticket))
      .join("");

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>In Vé</title>
      <meta charset="UTF-8">
      <style>
        @media print {
          body { margin: 0; }
          .ticket { 
            page-break-after: always; 
            margin: 0 !important;
          }
          .ticket:last-child {
            page-break-after: auto;
          }
        }
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }
        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          z-index: 1000;
        }
        .print-button:hover {
          background: #0056b3;
        }
        @media print {
          .print-button { display: none; }
        }
      </style>
      <script>
        function printPage() {
          window.print();
        }
        window.onload = function() {
          // Tự động focus để sẵn sàng in
          window.focus();
        }
      </script>
    </head>
    <body>
      <button class="print-button" onclick="printPage()">🖨️ In vé</button>
      ${ticketsHTML}
    </body>
    </html>
  `;

    // 🔹 SỬA: Tạo blob URL và mở tab mới
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    // Mở tab mới
    const newTab = window.open(url, "_blank");

    // Cleanup blob URL sau 1 giây
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    if (!newTab) {
      ElNotification({
        message: "Không thể mở tab mới. Vui lòng kiểm tra popup blocker.",
        type: "error",
      });
    }
  };

  const routeNames = ref<DTO_RP_ListRouteName[]>([]);
  const loadingListRouteName = ref(false);
  const valueSelectedRoute = ref<number | null>(null);

  const fetchListRouteName = async (company_id: string) => {
    loadingListRouteName.value = true;
    try {
      const response = await getListRouteNameActionByCompany(company_id);
      if (response.success) {
        if (response.result) {
          console.log("Danh sách tuyến:", response.result);
          routeNames.value = response.result;
          //   if (routeNames.value.length > 0) {
          //     valueSelectedRoute.value = routeNames.value[0].id;
          //   }
        }
      } else {
        ElNotification({
          message: h(
            "p",
            { style: "color: red" },
            response.message || "Không thể tải danh sách tuyến!"
          ),
          type: "error",
        });
      }
    } catch (error) {
      ElNotification({
        message: h(
          "p",
          { style: "color: red" },
          "Đã xảy ra lỗi khi tải danh sách tuyến!"
        ),
        type: "error",
      });
      console.error("Error fetching route names:", error);
    } finally {
      loadingListRouteName.value = false;
    }
  };

  const handleRouteChange = (id: number) => {
    const selectedRoute = routeNames.value.find((r) => r.id === id);
    valueSelectedRoute.value = selectedRoute ? selectedRoute.id : 0;
    console.log("Tuyến được chọn:", selectedRoute);
    console.log("ID tuyến:", valueSelectedRoute.value);
  };



  const isSettingProgrammatically = ref(false);

  const handleQueryTicket = async (item: DTO_RP_SearchTicket) => {
    console.log("Selected item:", item);
    try {
      console.log("Truy vấn vé với route_id:", item.route_id);
      
      // Set flag trước khi thao tác
      isSettingProgrammatically.value = true;
      
      if (routeNames.value.length === 0) {
        console.log("Danh sách route chưa load, đang tải...");
        await fetchListRouteName(useUserStore.company_id ?? '');
      }
      
      const selectedRoute = routeNames.value.find(
        (r) => r.id === item.route_id
      );
      
      if (selectedRoute) {
        // Đợi một tick để đảm bảo routeNames đã được cập nhật
        await nextTick();
        
        queryRouteID.value = item.route_id;
        queryDate.value = item.departure_date;
        queryTripID.value = item.trip_id;
        queryTicketID.value = item.ticket_id;

        console.log("Query route_id:", queryRouteID.value);
        console.log("Query departure_date:", queryDate.value);
        console.log("Query trip_id:", queryTripID.value);
        console.log("Query ticket_id:", queryTicketID.value);

        return {
          success: true,
          routeId: item.route_id,
          selectedRoute
        };
      } else {
        console.warn("Không tìm thấy route với ID:", item.route_id);
        return { success: false, error: "Route not found" };
      }
    } catch (error) {
      console.error("Lỗi khi truy vấn vé:", error);
      return { success: false, error };
    } finally {
      // Reset flag sau khi hoàn thành
      setTimeout(() => {
        isSettingProgrammatically.value = false;
      }, 100);
    }
  }
  return {
    routeNames,
    loadingListRouteName,
    valueSelectedRoute,
    fetchListRouteName,
    handleRouteChange,
    handleQueryTicket,
    // ticketList,
    // selectedTickets,
    loadingListTicket,
    fetchListTicketByTrip,
    getFloorSeats,
    getAvailableFloors,
    setupRealtimeListener,
    isTicketSelected,
    syncTicketsToFirebase,
    clearAllSelectedTickets,
    handleTicketClick,
    getTicketSelector,

    tripList,
    mySelectedTickets,
    dialogFormEditTicket,
    loadingItemTicket,
    updatingTicketIds,
    handleOpenFormEditTicket,
    handleCancelTickets,
    updateTicketsBookedInTrip,
    handleUpdateTickets,
    isCopyTicket,
    // isMoveTicket,
    handleCopyTickets,
    handlePasteTickets,
    handleMoveTickets,
    cancelMoveTickets,
    handleUpdateContactStatus,
    fetchListCustomerByTrip,
    listCustomer,
    loadingTabCustomer,
    loadingTransitUp,
    loadingTransitDown,
    listTransitUp,
    listTransitDown,
    fetchListTransitUpByTrip,
    fetchListTransitDownByTrip,
    handlePrintTickets,
  };
};
