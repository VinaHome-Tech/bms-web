import { API_GetListRouteByCompanyId, API_GetListRouteNameActionByCompanyId } from "~/services/resource-service/route/bms-route.api";
import type { RouteName } from "~/types/route/route.interface";
import { routeList } from "./useRouteGlobal";

export const useRouteList = () => {
    const routesNameAction = ref<RouteName[]>([]);
    const loadingRouteNameAction = ref(false);
    const fetchListRoutesNameAction = async (company_id: string) => {
        loadingRouteNameAction.value = true;
        try {
            const response = await API_GetListRouteNameActionByCompanyId(company_id);
            if (response.success) {
                routesNameAction.value = response.result || [];
            } else {
                notifyWarning(response.message || "Lấy danh sách tuyến thất bại.");
            }
        } catch (error) {
            console.error(error);
            notifyError("Lỗi khi tải danh sách tuyến.");
        } finally {
            loadingRouteNameAction.value = false;
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
        routesNameAction,
        loadingRouteNameAction,
        fetchListRoutesNameAction,
        fetchListRoute,
        loadingData,
    }
}