// import { API_GetListTicketByTripId } from "~/api/booking-service/ticket/bms_ticket.api";
import type { TicketItem } from "~/types/ticket/ticket.interface";
// import type { TripItem } from "~/types/trip/trip.interface";
// import { useTicketFirebase } from "~/composables/ticket/useTicketFirebase";

export const localSelectedTickets = ref<TicketItem[]>([]);
export const useTicketManager = () => {
    // const useUserStore = userStore();

    // const listItemTicket = ref<TicketItem[]>([]);

    // // Loading state
    // const loadingListTicket = ref(false);

    // // Firebase-backed selected tickets (raw array as stored by Firebase)
    // const allTicketsFromFirebase = ref<TicketItem[]>([]);
    // const conflictedTicketIds = ref<Set<number>>(new Set());
    // const loadingItemTicket = ref(false);

    // const { isSyncing, syncError, syncLocalTicketsToFirebase, listenToFirebaseTickets, clearFirebaseTickets, deleteTicketFromFirebase } = useTicketFirebase();

    // let unsubscribeFirebase: (() => void) | null = null;

    // const fetchListTicketByTripId = async (trip: TripItem) => {
    //     loadingListTicket.value = true;
    //     try {
    //         const response = await API_GetListTicketByTripId(trip.id as number, { seat_chart_id: trip.seat_chart_id as number });
    //         if (response.success) {
    //             listItemTicket.value = response.result || [];
    //         } else {
    //             notifyError(response.message || "Lấy danh sách vé thất bại");
    //         }
    //     } catch (error) {
    //         console.error(error);
    //         notifyError("Lấy danh sách vé thất bại");
    //     } finally {
    //         loadingListTicket.value = false;
    //     }
    // };

    // const getAvailableFloors = () => {
    //     const floors = [
    //         ...new Set(
    //             listItemTicket.value
    //                 .map((ticket) => ticket.seat_floor)
    //                 .filter((f): f is number => f !== undefined && f !== null)
    //         ),
    //     ];
    //     return floors.sort((a, b) => a - b);
    // };

    // const getFloorSeats = (floor: number) => {
    //     const floorTickets = listItemTicket.value.filter(
    //         (ticket) => ticket.seat_floor === floor
    //     );
    //     const rows = new Map();

    //     floorTickets.forEach((ticket) => {
    //         const rowNumber = ticket.seat_row;
    //         if (!rows.has(rowNumber)) {
    //             rows.set(rowNumber, []);
    //         }
    //         rows.get(rowNumber).push(ticket);
    //     });
    //     const sortedRows = Array.from(rows.entries())
    //         .sort((a, b) => a[ 0 ] - b[ 0 ])
    //         .map(([ rowNumber, seats ]) => ({
    //             rowNumber,
    //             seats: seats.sort(
    //                 (a: TicketItem, b: TicketItem) => (a.seat_column || 0) - (b.seat_column || 0)
    //             ),
    //         }));

    //     return sortedRows;
    // };

    // // Start listening to Firebase for selected tickets for the currently selected trip
    // const setupFirebaseListener = () => {
    //     // cleanup previous
    //     if (unsubscribeFirebase) {
    //         try { unsubscribeFirebase(); } catch { /* ignore */ }
    //         unsubscribeFirebase = null;
    //     }

    //     // use path based on global selected trip inside useTicketFirebase
    //     try {
    //         unsubscribeFirebase = listenToFirebaseTickets((tickets) => {
    //             allTicketsFromFirebase.value = Array.isArray(tickets) ? tickets : [];

    //             // update conflict set: tickets selected by other users
    //             const conflicts = new Set<number>();
    //             allTicketsFromFirebase.value.forEach((t) => {
    //                 if (t.id !== undefined && t.selected_by_id && String(t.selected_by_id) !== String(useUserStore.id)) {
    //                     conflicts.add(Number(t.id));
    //                 }
    //             });
    //             conflictedTicketIds.value = conflicts;
    //         });
    //     } catch (error) {
    //         console.error('Failed to setup firebase listener', error);
    //     }
    // };

    // const cleanupListener = () => {
    //     if (unsubscribeFirebase) {
    //         try { unsubscribeFirebase(); } catch { /* ignore */ }
    //         unsubscribeFirebase = null;
    //     }
    // };

    // // Merge API ticket + firebase info (selection, local overrides)
    // const getTicketWithFirebaseInfo = (ticket: TicketItem) => {
    //     const fb = allTicketsFromFirebase.value.find((t) => String(t.id) === String(ticket.id));
    //     if (!fb) return ticket;
    //     return {
    //         ...ticket,
    //         // map firebase selection fields into ticket model used in template
    //         selected_by_id: fb.selected_by_id ?? fb.selected_by_id,
    //         selected_by_name: fb.selected_by_name ?? fb.selected_by_name,
    //         selected_by_username: fb.selected_by_username ?? fb.selected_by_username,
    //     } as TicketItem;
    // };

    // const ticketsAreBeingSelected = (ticket: TicketItem) => {
    //     // local selection has priority
    //     if (localSelectedTickets.value.some((t) => t.id === ticket.id)) return true;
    //     // then Firebase
    //     const fb = allTicketsFromFirebase.value.find((t) => String(t.id) === String(ticket.id));
    //     if (fb && fb.selected_by_id && String(fb.selected_by_id) === String(useUserStore.id)) return true;
    //     return false;
    // };

    // const handleAddLocalSelectedTicket = async (ticket: TicketItem) => {
    //     // toggle in localSelectedTickets
    //     const existsIndex = localSelectedTickets.value.findIndex((t) => t.id === ticket.id);
    //     if (existsIndex !== -1) {
    //         localSelectedTickets.value.splice(existsIndex, 1);
    //     } else {
    //         localSelectedTickets.value.push({ id: ticket.id, seat_name: ticket.seat_name } as TicketItem);
    //     }

    //     // sync to Firebase
    //     try {
    //         await syncLocalTicketsToFirebase(localSelectedTickets.value);
    //     } catch (error) {
    //         console.error('Error syncing local selected tickets', error);
    //     }
    // };

    // const handleClearLocalSelectedTickets = async () => {
    //     localSelectedTickets.value = [];
    //     try {
    //         await syncLocalTicketsToFirebase([]);
    //     } catch (error) {
    //         console.error('Error clearing local selected tickets', error);
    //     }
    // };

    // const isTicketSelectedByOther = (ticket: TicketItem) => {
    //     const fb = allTicketsFromFirebase.value.find((t) => String(t.id) === String(ticket.id));
    //     return !!(fb && fb.selected_by_id && String(fb.selected_by_id) !== String(useUserStore.id));
    // };

    // const getTicketSelectedByInfo = (ticket: TicketItem) => {
    //     const fb = allTicketsFromFirebase.value.find((t) => String(t.id) === String(ticket.id));
    //     return fb?.selected_by_name ?? null;
    // };

    return {
        
    };
};
