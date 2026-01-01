
import { API_GetListTicketByTripId } from "~/services/booking-service/ticket/bms-ticket.api";
import type { Trip} from "~/types/trip/trip.interface";
import { listTicket } from "./useTicketGlobal";
export const useTicketList = () => {
    const loadingListTicket = ref(false);
    
    const fetchListTicketByTripId = async (trip: Trip) => {
        loadingListTicket.value = true;
        try {
            const response = await API_GetListTicketByTripId(trip.id as string, { seat_chart_id: trip.seat_chart.id as string });
            if (response.success) {
                listTicket.value = response.result || [];
            } else {
                notifyWarning(response.message || "Tải danh sách vé thất bại");
            }
        } catch (error) {
            console.error(error);
            notifyError("Tải danh sách vé thất bại");
        } finally {
            loadingListTicket.value = false;
        }
    }
    
    return {
        loadingListTicket,
        fetchListTicketByTripId,
    }
}