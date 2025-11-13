import type { ApiResponse } from "~/api/APIResponse"
import type { Account } from "~/types/account/account.interface"

// M2_v1.F2
export const API_CreateAccount = async (company_id: string, data: Account): Promise<ApiResponse<Account>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig() 
  return await $apiFetch<ApiResponse<Account>>(`${config.public.apiGateWay}/v1/bms-account/companies/${company_id}/accounts`, {
    method: "POST",
    body: data,
  })
}

// M2_v1.F3
export const API_GetListAccountByCompanyId = async (company_id: string): Promise<ApiResponse<Account[]>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig() 
  return await $apiFetch<ApiResponse<Account[]>>(`${config.public.apiGateWay}/v1/bms-account/companies/${company_id}/accounts`, {
    method: "GET",
  })
}

// M2_v1.F5
export const API_DeleteAccount = async (account_id: number): Promise<ApiResponse<null>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig() 
  return await $apiFetch<ApiResponse<null>>(`${config.public.apiGateWay}/v1/bms-account/${account_id}`, {
    method: "DELETE",
  })
}

// M2_v1.F4
export const API_UpdateAccount = async (account_id: number, data: Account): Promise<ApiResponse<Account>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig() 
  return await $apiFetch<ApiResponse<Account>>(`${config.public.apiGateWay}/v1/bms-account/${account_id}`, {
    method: "PUT",
    body: data,
  })
}