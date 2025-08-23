/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LoginFormType } from "~/types/authType";
import type { ApiResponse } from "./APIResponse";
import type { UserBMSType } from "~/types/userType";
import type { ChangePasswordStaffType, ChangePasswordType } from "~/types/accountType";

export const loginBMS = async (data: LoginFormType): Promise<ApiResponse<UserBMSType>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  try {
    return await $fetch<ApiResponse<UserBMSType>>(`${apiGateWay}/v3/bus-auth/login-bms`, {
      method: "POST",
      body: data,
    });
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

export const testToken = async(): Promise<ApiResponse<any>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('auth_token');
  try {
    return await $fetch<ApiResponse<any>>(`${apiGateWay}/v1/account/test`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${cookie.value}`
      }
    });
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}

export const changePasswordApi = async (data: ChangePasswordType): Promise<ApiResponse<void>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('auth_token');
  try {
    return await $fetch<ApiResponse<void>>(`${apiGateWay}/v3/bus-auth/change-password`, {
      method: "POST",
      body: data,
      headers: {
        'Authorization': `Bearer ${cookie.value}`
      }
    });
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}

export const changePasswordStaff = async (data: ChangePasswordStaffType): Promise<ApiResponse<void>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('auth_token');
  try {
    return await $fetch<ApiResponse<void>>(`${apiGateWay}/v3/bus-auth/change-password-staff`, {
      method: "POST",
      body: data,
      headers: {
        'Authorization': `Bearer ${cookie.value}`
      }
    });
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}