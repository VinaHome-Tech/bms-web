import { API_GetListSeatChartByCompanyId, API_GetListSeatChartNameByCompanyId } from "~/services/resource-service/seat/bms-seat.api";
import { seatChartList, seatChartNameList } from "./useSeatGlobal";

export const useSeatList = () => {
    const loadingData = ref(false);
    const fetchListSeatCharts = async (company_id: string) => {
        loadingData.value = true;
        try {
            const response = await API_GetListSeatChartByCompanyId(company_id);
            if (response.success) {
                seatChartList.value = response.result || [];
            } else {
                notifyWarning(response.message || 'Tải danh sách sơ đồ thất bại.');
            }
        } catch (error) {
            console.error(error);
            notifyError('Lỗi khi tải danh sách sơ đồ.');
        } finally {
            loadingData.value = false;
        }
    }
    const loadingSeatChartName = ref(false);
    const fetchListSeatChartName = async (company_id: string) => {
        loadingSeatChartName.value = true;
        try {
            const response = await API_GetListSeatChartNameByCompanyId(company_id);
            if (response.success) {
                seatChartNameList.value = response.result?.map(item => ({
                    id: item.id!,
                    seat_chart_name: item.seat_chart_name!,
                })) || [];
            } else {
                notifyWarning(response.message || 'Tải danh sách tên sơ đồ thất bại.');
            }
        } catch (error) {
            console.error(error);
            notifyError('Lỗi khi tải danh sách tên sơ đồ.');
        } finally {
            loadingSeatChartName.value = false;
        }
    }
    return {
        loadingData,
        fetchListSeatCharts,
        loadingSeatChartName,
        fetchListSeatChartName,
    }
}