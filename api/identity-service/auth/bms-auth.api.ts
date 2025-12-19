import type { ApiResponse } from "~/api/api-response";
import type { DTO_RP_LoginBMS } from "~/types/auth/auth.interface";
import type { LoginFormType } from "~/types/authType";

// M1_v3.F1
export const API_LoginBMS = async (data: LoginFormType): Promise<ApiResponse<DTO_RP_LoginBMS>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig()
  return await $apiFetch<ApiResponse<DTO_RP_LoginBMS>>(`${config.public.apiGateWay}/v1/bms-auth/login-bms`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: data,
  })
}
// M1_v3.F2
export const API_RefreshToken = async (refreshToken: string): Promise<ApiResponse<any>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig()
  return await $apiFetch<ApiResponse<any>>(`${config.public.apiGateWay}/v1/bms-auth/refresh-token-bms/${refreshToken}`, {
    method: "POST",
  });
};

export const API_LogoutBMS = async (user_id: string): Promise<ApiResponse<void>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig()
  return await $apiFetch<ApiResponse<void>>(`${config.public.apiGateWay}/v1/bms-auth/logout-bms/${user_id}`, {
    method: "POST",
  });
};

