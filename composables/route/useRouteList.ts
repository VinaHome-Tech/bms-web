import { API_GetListRouteByCompanyId, API_GetListRouteNameByCompanyId } from "~/services/resource-service/route/bms-route.api";
import { routeList, routeNameList } from "./useRouteGlobal";

export const useRouteList = () => {
    
    const loadingRouteName = ref(false);
    const fetchListRouteName= async (company_id: string) => {
        loadingRouteName.value = true;
        try {
            const response = await API_GetListRouteNameByCompanyId(company_id);
            if (response.success) {
                routeNameList.value = response.result || [];
            } else {
                notifyWarning(response.message || "Tải danh sách tuyến thất bại.");
            }
        } catch (error) {
            console.error(error);
            notifyError("Lỗi khi tải danh sách tuyến.");
        } finally {
            loadingRouteName.value = false;
        }
    }
    const loadingData = ref(false);
    const fetchListRoute = async (company_id: string) => {
        loadingData.value = true;
        try {
            const response = await API_GetListRouteByCompanyId(company_id);
            if (response.success) {
                routeList.value = response.result || [];
            } else {
                notifyWarning(response.message || "Lấy danh sách tuyến thất bại.");
            }
        } catch (error) {
            console.error(error);
            notifyError("Lỗi khi tải danh sách tuyến.");
        } finally {
            loadingData.value = false;
        }
    }
    return {
        loadingRouteName,
        fetchListRouteName,
        fetchListRoute,
        loadingData,
    }
}