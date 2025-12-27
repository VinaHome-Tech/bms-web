import { API_GetListAccountByCompanyId } from "~/services/identity-service/account/bms-account.api";
import { accountList } from "./useAccountGlobal";

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
    return {
        loadingData,
        fetchListAccount,
    }
}