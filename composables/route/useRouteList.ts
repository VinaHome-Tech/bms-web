import { API_GetListRouteNameActionByCompanyId } from "~/api/resource-service/route/bms_route.api";
import type { RouteName } from "~/types/route/route.interface";

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
                ElMessage.error(response.message || "Lấy danh sách tuyến thất bại.");
            }
        } catch (error) {
            console.error(error);
            ElMessage.error("Lỗi khi tải danh sách tuyến.");
        } finally {
            loadingRouteNameAction.value = false;
        }
    }
    return {
        routesNameAction,
        loadingRouteNameAction,
        fetchListRoutesNameAction
    }
}