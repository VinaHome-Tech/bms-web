/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LoginFormType } from "~/types/authType";
import type { ApiResponse } from "./APIResponse";
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
export const loginBMS = async (data: LoginFormType): Promise<ApiResponse<UserBMSType>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig()
  return await $apiFetch<ApiResponse<UserBMSType>>(`${config.public.apiGateWay}/v3/bus-auth/login-bms`, {
    method: "POST",
    body: data,
  })
}

export const refreshToken = async (refreshToken: string): Promise<ApiResponse<any>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  try {
    return await $fetch<ApiResponse<any>>(`${apiGateWay}/v3/bus-auth/refresh-token`, {
      method: "POST",
      body: { refresh_token: refreshToken },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    throw error;
  }
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

