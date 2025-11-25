import { format, startOfDay } from "date-fns";
import { API_GetListTripByRouteAndDate } from "~/api/booking-service/trip/bms_trip.api";
import { listItemTrip } from "./useTripGlobal";

export const useTripList = () => {
    const loadingListItemTrip = ref(false);
    const fetchListItemTripByRouteAndDate = async (company_id: string, route_id: number, date: string | Date) => {
        loadingListItemTrip.value = true;
        try {
            const normalizedDate = format(startOfDay(date as Date), "yyyy-MM-dd");
            const response = await API_GetListTripByRouteAndDate(company_id, { route_id, date: normalizedDate });
            if (response.success) {
                listItemTrip.value = response.result || [];
            } else {
                ElMessage.error(response.message || "Lấy danh sách chuyến thất bại.");
            }
        } catch (error) {
            console.error(error);
            ElMessage.error("Lỗi khi tải danh sách chuyến.");
        } finally {
            loadingListItemTrip.value = false;
        }
    }
    return {
        loadingListItemTrip,
        fetchListItemTripByRouteAndDate
    }
}