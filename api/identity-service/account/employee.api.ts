import type { ApiResponse } from "~/api/api-response"
import type { Account, AccountInfo, Assistant, ChangePassword, Driver } from "~/types/account/account.interface"

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

export const API_GetDriverListByCompanyId = async (companyID: string): Promise<ApiResponse<Driver[]>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<Driver[]>>(`${config.public.apiGateWay}/v1/bms-account/companies/${companyID}/drivers`, {
        method: "GET",
    })
}

export const API_GetAssistantListByCompanyId = async (companyID: string): Promise<ApiResponse<Assistant[]>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<Assistant[]>>(`${config.public.apiGateWay}/v1/bms-account/companies/${companyID}/assistants`, {
        method: "GET",
    })
}
export const API_GetInfoAccountById = async (accountID: string): Promise<ApiResponse<AccountInfo>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<AccountInfo>>(`${config.public.apiGateWay}/v1/bms-account/${accountID}/info`, {
        method: "GET",
    })
}
export const API_UpdateInfoAccountById = async (accountID: string, data: AccountInfo): Promise<ApiResponse<AccountInfo>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig() 
    return await $apiFetch<ApiResponse<AccountInfo>>(`${config.public.apiGateWay}/v1/bms-account/${accountID}/info`, {
      method: "PUT",
      body: data,
    })
}
export const API_ChangePasswordAccountById = async (accountID: string, data: ChangePassword): Promise<ApiResponse<null>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<null>>(`${config.public.apiGateWay}/v1/bms-account/${accountID}/change-password`, {
      method: "POST",
      body: data,
    })
}
export const API_GetHistoryLoginByAccountId = async (accountID: string): Promise<ApiResponse<any>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<any>>(`${config.public.apiGateWay}/v1/bms-account/${accountID}/history-login`, {
      method: "GET",
    })
}