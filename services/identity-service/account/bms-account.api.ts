import type { ApiResponse } from "~/services/api-response"
import type { Account, DTO_RQ_Account, DTO_RQ_ChangePassword } from "~/types/account/account.interface"

export const API_GetListAccountByCompanyId = async (company_id: string): Promise<ApiResponse<Account[]>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig() 
  return await $apiFetch<ApiResponse<Account[]>>(`${config.public.apiGateWay}/v1/bms-account/companies/${company_id}/accounts`, {
    method: "GET",
  })
}

// M2_v1.F4
export const API_UpdateAccount = async (account_id: string, data: DTO_RQ_Account): Promise<ApiResponse<Account>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig() 
  return await $apiFetch<ApiResponse<Account>>(`${config.public.apiGateWay}/v1/bms-account/${account_id}`, {
    method: "PUT",
    body: data,
  })
}

// M2_v1.F2
export const API_CreateAccount = async (company_id: string, data: DTO_RQ_Account): Promise<ApiResponse<Account>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig() 
  return await $apiFetch<ApiResponse<Account>>(`${config.public.apiGateWay}/v1/bms-account/companies/${company_id}/accounts`, {
    method: "POST",
    body: data,
  })
}

// M2_v1.F5
export const API_DeleteAccount = async (account_id: string): Promise<ApiResponse<null>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig() 
  return await $apiFetch<ApiResponse<null>>(`${config.public.apiGateWay}/v1/bms-account/${account_id}`, {
    method: "DELETE",
  })
}

export const API_LockAccount = async (account_id: string): Promise<ApiResponse<Account>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<Account>>(`${config.public.apiGateWay}/v1/bms-account/${account_id}/lock`, {
        method: "PUT",
    })
}

export const API_UnlockAccount = async (account_id: string): Promise<ApiResponse<Account>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<Account>>(`${config.public.apiGateWay}/v1/bms-account/${account_id}/unlock`, {
        method: "PUT",
    })
}

export const API_ChangePasswordStaff = async (account_id: string, data: DTO_RQ_ChangePassword): Promise<ApiResponse<null>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<null>>(`${config.public.apiGateWay}/v1/bms-account/${account_id}/change-password-staff`, {
        method: "PUT",
        body: data,
    })
}