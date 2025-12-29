import { API_GetListScheduleByCompanyId } from "~/services/resource-service/schedule/bms-schedule.api";
import { scheduleList } from "./useScheduleGlobal";

export const useScheduleList = () => {
    const loadingData = ref(false)
    const fetchListSchedule= async (company_id: string) => {
            loadingData.value = true;
            try {
                const response = await API_GetListScheduleByCompanyId(company_id);
                if (response.success) {
                    scheduleList.value = response.result || [];
                } else {
                    notifyWarning(response.message || "Tải danh sách lịch trình thất bại.");
                }
            } catch (error) {
                console.error(error);
                notifyError("Lỗi khi tải danh sách lịch trình.");
            } finally {
                loadingData.value = false;
            }
        }
    return {
        loadingData,
        fetchListSchedule,
    }
}