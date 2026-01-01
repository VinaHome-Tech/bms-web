import type { DTO_RQ_UpdateTrip, Trip } from "~/types/trip/trip.interface"
import { listTrip, valueSelectedTrip } from "./useTripGlobal";
import { API_UpdateTripInfo } from "~/services/booking-service/trip/bms-trip.api";

export const useTripActions = () => {
    const loadingSubmitUpdateTripInfo = ref(false);
    const dialogEditTripInfo = ref(false);
    const handleOpenDialogEditTrip = () => {
        dialogEditTripInfo.value = true;
    }
    const handleCloseDialogEditTripInfo = () => {
        dialogEditTripInfo.value = false;
    }
    const handleSubmitUpdateTripInfo = async (updatedTrip: DTO_RQ_UpdateTrip) => {
        loadingSubmitUpdateTripInfo.value = true;
        try {
            const response = await API_UpdateTripInfo(updatedTrip.id as string, updatedTrip);
            if (response.success && response.result) {
                notifySuccess("Cập nhật thông tin chuyến thành công");
                // Cập nhật lại thông tin chuyến đi đã chọn
                valueSelectedTrip.value = {
                    ...valueSelectedTrip.value,
                    ...response.result
                };
                listTrip.value = listTrip.value.map(trip => {
                    if (trip.id === updatedTrip.id) {
                        return {
                            ...trip,
                            ...updatedTrip
                        };
                    }
                    return trip;
                });
                await nextTick();
                dialogEditTripInfo.value = false;
            } else {
                notifyWarning(response.message || "Cập nhật thông tin chuyến thất bại");
            }
        } catch (error) {
            console.error(error);
            notifyError("Cập nhật thông tin chuyến thất bại");
        } finally {
            loadingSubmitUpdateTripInfo.value = false;
        }
    }
    return {
        handleSubmitUpdateTripInfo,
        loadingSubmitUpdateTripInfo,
        dialogEditTripInfo,
        handleOpenDialogEditTrip,
        handleCloseDialogEditTripInfo
    }
}