import { API_GetListLicensePlateVehicleByCompanyId, API_GetListVehicleByCompanyId } from "~/services/resource-service/vehicle/bms-vehicle.api";
import { licensePlateList, vehicleList } from "./useVehicleGlobal";

export const useVehicleList = () => {
    const loadingLicensePlate = ref(false);
    const fetchLicensePlateVehicle = async (companyID: string) => {
        loadingLicensePlate.value = true;
        try {
            const response = await API_GetListLicensePlateVehicleByCompanyId(companyID);
            if (response.success) {
                licensePlateList.value = response.result ?? [];
            } else {
                notifyError(response.message || "Tải danh sách biển số xe thất bại.");
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
        loadingLicensePlate,
        fetchLicensePlateVehicle,
        fetchListVehicle,
        loadingData,
    }
}