/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApiResponse } from "~/api/APIResponse";
import type { LoginFormType } from "~/types/authType";
import type { UserBMSType } from "~/types/userType";

// export const loginBMS = async (data: LoginFormType): Promise<ApiResponse<UserBMSType>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
//   try {
//     return await $fetch<ApiResponse<UserBMSType>>(`${apiGateWay}/v3/bus-auth/login-bms`, {
//       method: "POST",
//       body: data,
//     });
//   } catch (error) {
//     console.error('API error:', error);
//     throw error;
//   }
// };

// M1_v3.F1
export const API_LoginBMS = async (data: LoginFormType): Promise<ApiResponse<UserBMSType>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig()
  return await $apiFetch<ApiResponse<UserBMSType>>(`${config.public.apiGateWay}/v3/bms-auth/login-bms`, {
    method: "POST",
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
    return await $fetch<ApiResponse<any>>(`${apiGateWay}/v3/bus-auth/logout-bms`, {
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

