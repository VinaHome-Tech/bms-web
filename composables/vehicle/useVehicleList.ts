import { API_GetListLicensePlateVehicleByCompanyId } from "~/services/resource-service/vehicle/bms_vehicle.api";
import type { LicensePlateVehicle } from "~/types/vehicle/vehicle.interface";

export const useVehicleList = () => {
    const licensePlate = ref<LicensePlateVehicle[]>([]);
    const loadingLicensePlate = ref(false);
    const fetchLicensePlateVehicle = async (companyID: string) => {
        loadingLicensePlate.value = true;
        try {
            const response = await API_GetListLicensePlateVehicleByCompanyId(companyID);
            if (response.success) {
                licensePlate.value = response.result ?? [];
            } else {
                notifyError(response.message || "Lỗi tải danh sách biển số xe");
            }
        } catch (error) {
            console.error(error);
            notifyError("Lỗi tải danh sách biển số xe");
        } finally {
            loadingLicensePlate.value = false;
        }
    }
    return {
        licensePlate,
        loadingLicensePlate,
        fetchLicensePlateVehicle,
    }
}