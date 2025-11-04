import type { ApiResponse } from "~/api/APIResponse";
import type { DTO_RQ_Office, Office, OfficeRoomWork } from "~/types/office/office.interface";

// M1_v2.F1
export const API_GetListOfficeRoomWorkByCompanyId = async (company_id: string): Promise<ApiResponse<OfficeRoomWork[]>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig()
  return await $apiFetch<ApiResponse<OfficeRoomWork[]>>(`${config.public.apiGateWay}/v2/bms-office/companies/${company_id}/room-work`, {
    method: "GET",
  })
}

// M1_v2.F2
export const API_GetListOfficeByCompanyId = async (company_id: string): Promise<ApiResponse<Office[]>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig()
  return await $apiFetch<ApiResponse<Office[]>>(`${config.public.apiGateWay}/v2/bms-office/companies/${company_id}/offices`, {
    method: "GET",
  })
}

// M1_v2.F3
export const API_CreateOffice = async (company_id: string, data: DTO_RQ_Office): Promise<ApiResponse<Office>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig()
  return await $apiFetch<ApiResponse<Office>>(`${config.public.apiGateWay}/v2/bms-office/companies/${company_id}/offices`, {
    method: "POST",
    body: data,
  })
}

// M1_v2.F4
export const API_UpdateOffice = async (office_id: number, data: DTO_RQ_Office): Promise<ApiResponse<Office>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig()
  return await $apiFetch<ApiResponse<Office>>(`${config.public.apiGateWay}/v2/bms-office/${office_id}`, {
    method: "PUT",
    body: data,
  })
}