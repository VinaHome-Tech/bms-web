import { API_GetListOfficeByCompanyId } from "~/api/resource-service/office/bms-office.api";
import { officeList } from "./useOfficeGlobal";

export const useOfficeList = () => {
    const loadingOfficeList = ref(false);
    const fetchListOffice = async (company_id: string) => {
        loadingOfficeList.value = true;
        try {
            const response = await API_GetListOfficeByCompanyId(company_id);
            if (response.success) {
                officeList.value = response.result || [];
            } else {
                notifyError(response.message || "Lấy danh sách văn phòng thất bại.");
            }
        } catch (error) {
            console.error(error);
            notifyError("Lỗi khi tải danh sách văn phòng.");
        } finally {
            loadingOfficeList.value = false;
        }   
    }
    return {
        loadingOfficeList,
        fetchListOffice
    }
}