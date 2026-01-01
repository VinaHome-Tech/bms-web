import { format, parseISO, startOfDay } from "date-fns";
import { API_GetListTripByCompany } from "~/services/booking-service/trip/bms-trip.api";
import { listTrip } from "./useTripGlobal";

export const useTripList = () => {
    const loadingListItemTrip = ref(false);
    let requestId = 0;

    const fetchListTripByRouteAndDate = async (
        company_id: string,
        route_id: string,
        date: string | Date
    ) => {
        if (!company_id || !route_id || !date) {
            notifyWarning("Thiếu thông tin tìm chuyến.");
            return;
        }

        const currentRequest = ++requestId;
        loadingListItemTrip.value = true;

        try {
            const parsedDate = typeof date === "string" ? parseISO(date) : date;
            const normalizedDate = format(startOfDay(parsedDate), "yyyy-MM-dd");

            const response = await API_GetListTripByCompany(company_id, {
                route_id,
                date: normalizedDate,
            });

            if (currentRequest !== requestId) return;

            if (response?.success) {
                listTrip.value = response.result ?? [];
            } else {
                notifyWarning(response?.message || "Tải danh sách chuyến thất bại.");
            }
        } catch (error) {
            console.error(error);
            notifyError("Lỗi khi tải danh sách chuyến.");
        } finally {
            if (currentRequest === requestId) {
                loadingListItemTrip.value = false;
            }
        }
    };

    return {
        loadingListItemTrip,
        fetchListTripByRouteAndDate,
    };
};
