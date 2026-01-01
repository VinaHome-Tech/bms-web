import { API_GetListAccountByCompanyId, API_GetListAssistantByCompanyId, API_GetListDriverByCompanyId } from "~/services/identity-service/account/bms-account.api";
import { accountList, assistantList, driverList } from "./useAccountGlobal";

export const useAccountList = () => {
    const loadingData = ref(false);
    const fetchListAccount = async (company_id: string) => {
        loadingData.value = true;
        try {
            const response = await API_GetListAccountByCompanyId(company_id);
            if (response.success) {
                accountList.value = response.result || [];
                console.log('accountList:', accountList.value);
            } else {
                notifyWarning(response.message || "Tải danh sách tài khoản thất bại.");
            }
        } catch (error) {
            console.error(error);
            notifyError("Lỗi khi tải danh sách tài khoản.");
        } finally {
            loadingData.value = false;
        }   
    }
    const loadingDriver = ref(false);
    const fetchListDriver = async (company_id: string) => {
        loadingDriver.value = true;
        try {
            const response = await API_GetListDriverByCompanyId(company_id);
            if (response.success) {
                driverList.value = response.result || [];
            } else {
                notifyWarning(response.message || "Tải danh sách tài xế thất bại.");
            }
        } catch (error) {
            console.error(error);
            notifyError("Lỗi khi tải danh sách tài xế.");
        } finally {
            loadingDriver.value = false;
        }   
    }
    const loadingAssistant = ref(false);
    const fetchListAssistant = async (company_id: string) => {
        loadingAssistant.value = true;
        try {
            const response = await API_GetListAssistantByCompanyId(company_id);
            if (response.success) {
                assistantList.value = response.result || [];
            } else {
                notifyWarning(response.message || "Tải danh sách phụ xe thất bại.");
            }
        } catch (error) {
            console.error(error);
            notifyError("Lỗi khi tải danh sách phụ xe.");
        } finally {
            loadingAssistant.value = false;
        }   
    }
    return {
        loadingData,
        fetchListAccount,
        loadingDriver,
        fetchListDriver,
        loadingAssistant,
        fetchListAssistant,
    }
}