/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApiResponse } from "~/api/APIResponse";
import type { LoginFormType } from "~/types/authType";
import type { UserBMSType } from "~/types/userType";

// M1_v3.F1
export const API_LoginBMS = async (data: LoginFormType): Promise<ApiResponse<UserBMSType>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig()
  return await $apiFetch<ApiResponse<UserBMSType>>(`${config.public.apiGateWay}/v1/bms-auth/login-bms`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: data,
  })
}
// M1_v3.F2
export const API_RefreshToken = async (refreshToken: string): Promise<ApiResponse<any>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig()
  return await $apiFetch<ApiResponse<any>>(`${config.public.apiGateWay}/v3/bms-auth/refresh-token`, {
    method: "POST",
    body: { refresh_token: refreshToken },
  });
};

export const logout = async (accessToken: string): Promise<ApiResponse<any>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<any>>(`${apiGateWay}/v1/bus-auth/logout-bms`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${cookie.value}`
      },
      body: {
        access_token: accessToken
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

