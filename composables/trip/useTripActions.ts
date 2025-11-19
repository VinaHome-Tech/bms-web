import type { TripItem } from "~/types/trip/trip.interface"
import { listItemTrip, valueSelectedTrip } from "./useTripGlobal";
import { API_UpdateTripInformation } from "~/api/booking-service/trip/bms_trip.api";

export const useTripActions = () => {
    const loadingUpdateTrip = ref(false);

    const handleUpdateTripInformation = async (updatedTrip: TripItem) => {
        loadingUpdateTrip.value = true;
        try {
            const response = await API_UpdateTripInformation(updatedTrip);
            if (response.success && response.result) {
                notifySuccess("Cập nhật thông tin chuyến đi thành công");
                // Cập nhật lại thông tin chuyến đi đã chọn
                valueSelectedTrip.value = {
                    ...valueSelectedTrip.value,
                    ...updatedTrip
                };
                listItemTrip.value = listItemTrip.value.map(trip => {
                    if (trip.id === updatedTrip.id) {
                        return {
                            ...trip,
                            ...updatedTrip
                        };
                    }
                    return trip;
                });
            } else {
                notifyError(response.message || "Cập nhật thông tin chuyến thất bại");
            }
        } catch (error) {
            console.error(error);
            notifyError("Cập nhật thông tin chuyến thất bại");
        } finally {
            loadingUpdateTrip.value = false;
        }
    }
    return {
        handleUpdateTripInformation,
        loadingUpdateTrip
    }
}