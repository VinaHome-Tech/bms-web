import { API_GetListLicensePlateVehicleByCompanyId, API_GetListVehicleByCompanyId } from "~/services/resource-service/vehicle/bms_vehicle.api";
import type { LicensePlateVehicle } from "~/types/vehicle/vehicle.interface";
import { vehicleList } from "./useVehicleGlobal";

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

    const loadingData = ref(false);
    const fetchListVehicle = async (company_id: string) => {
        loadingData.value = true;
        try {
            const response = await API_GetListVehicleByCompanyId(company_id);
            if (response.success) {
                vehicleList.value = response.result || [];
            } else {
                notifyWarning(response.message || "Lấy danh sách phương tiện thất bại.");
            }
        } catch (error) {
            console.error(error);
            notifyError("Lỗi khi tải danh sách phương tiện.");
        } finally {
            loadingData.value = false;
        }   
    }
    return {
        licensePlate,
        loadingLicensePlate,
        fetchLicensePlateVehicle,
        fetchListVehicle,
        loadingData,
    }
}