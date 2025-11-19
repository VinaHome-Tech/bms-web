import { API_GetAssistantListByCompanyId, API_GetDriverListByCompanyId } from "~/api/identity-service/account/employee.api";
import type { Assistant, Driver } from "~/types/account/account.interface";

export const useEmployeeList = () => {
    const loadingDriver = ref(false);
    const loadingAssistant = ref(false);
    const driverList = ref<Driver[]>([]);
    const assistantList = ref<Assistant[]>([]);
    const fetchDriverListByCompanyId = async (companyID: string) => {
        loadingDriver.value = true;
        try {
            const response = await API_GetDriverListByCompanyId(companyID);
            if (response.success) {
                driverList.value = response.result ?? [];
            } else {
                notifyError(response.message || "Lỗi tải danh sách tài xế");
            }
        } catch (error) {
            console.error(error);
            notifyError("Lỗi tải danh sách tài xế");
        } finally {
            loadingDriver.value = false;
        }
    }
    const fetchAssistantListByCompanyId = async (companyID: string) => {
        loadingAssistant.value = true;
        try {
            const response = await API_GetAssistantListByCompanyId(companyID);
            if (response.success) {
                assistantList.value = response.result ?? [];
            } else {
                notifyError(response.message || "Lỗi tải danh sách phụ xe");
            }
        } catch (error) {
            console.error(error);
            notifyError("Lỗi tải danh sách phụ xe");
        } finally {
            loadingAssistant.value = false;
        }
    }
    return {
        loadingDriver,
        loadingAssistant,
        driverList,
        assistantList,
        fetchDriverListByCompanyId,
        fetchAssistantListByCompanyId
    }
}