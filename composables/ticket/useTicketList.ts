
import { API_GetListTicketByTripId } from "~/api/booking-service/ticket/bms_ticket.api";
import type { TicketItem } from "~/types/ticket/ticket.interface";
import type { TripItem } from "~/types/trip/trip.interface";
export const listItemTicket = ref<TicketItem[]>([]);
export const useTicketList = () => {
    const loadingListTicket = ref(false);
    
    const fetchListTicketByTripId = async (trip: TripItem) => {
        loadingListTicket.value = true;
        try {
            const response = await API_GetListTicketByTripId(trip.id as number, { seat_chart_id: trip.seat_chart_id as number });
            if (response.success) {
                listItemTicket.value = response.result || [];
            } else {
                notifyError(response.message || "Lấy danh sách vé thất bại");
            }
        } catch (error) {
            console.error(error);
            notifyError("Lấy danh sách vé thất bại");
        } finally {
            loadingListTicket.value = false;
        }
    }
    
    return {
        loadingListTicket,
        fetchListTicketByTripId,
    }
}