import type { ApiResponse } from "~/api/APIResponse";
import type { OfficeRoomWork } from "~/types/office/office.interface";

// M1_v2.F1
export const API_GetListOfficeRoomWorkByCompanyId = async (company_id: string): Promise<ApiResponse<OfficeRoomWork[]>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig()
  return await $apiFetch<ApiResponse<OfficeRoomWork[]>>(`${config.public.apiGateWay}/v2/bms-office/companies/${company_id}/room-work`, {
    method: "GET",
  })
}