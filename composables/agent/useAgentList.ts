import { API_GetListAgentByCompanyId } from "~/services/identity-service/agent/bms-agent.api";
import { agentList } from "./useAgentGlobal";

export const useAgentList = () => {
    const loadingData = ref(false);
    const fetchListAgent = async (company_id: string) => {
        loadingData.value = true;
        try {
            const response = await API_GetListAgentByCompanyId(company_id);
            if (response.success) {
                agentList.value = response.result || [];
                console.log('agentList:', agentList.value);
            } else {
                notifyWarning(response.message || "Tải danh sách đại lý thất bại.");
            }
        } catch (error) {
            console.error(error);
            notifyError("Lỗi khi tải danh sách đại lý.");
        } finally {
            loadingData.value = false;
        }
    }
    return {
        loadingData,
        fetchListAgent,
    }
}