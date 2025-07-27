import type { AssistantType, DriverType, EmployeeType } from "~/types/employeeType";
import type { ApiResponse } from "./APIResponse";

export const createEmployee = async (data: EmployeeType): Promise<ApiResponse<EmployeeType>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<EmployeeType>>(`${apiGateWay}/v1/account/create-account-staff`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${cookie.value}`,
      },
      body: data
    });
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}

export const updateEmployee = async (id: number, data: EmployeeType): Promise<ApiResponse<EmployeeType>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<EmployeeType>>(`${apiGateWay}/v1/account/update-account-staff/${id}`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${cookie.value}`,
      },
      body: data
    });
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}

export const deleteEmployee = async (id: number): Promise<ApiResponse<void>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<void>>(`${apiGateWay}/v1/account/delete-account-staff/${id}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${cookie.value}`
      }
    });
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}

export const getListEmployeeByCompany = async (companyId: number): Promise<ApiResponse<EmployeeType[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<EmployeeType[]>>(`${apiGateWay}/v1/account/get-list-account-by-company/${companyId}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${cookie.value}`,
      }
    });
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}

export const getListDriverByCompany = async (id: number): Promise<ApiResponse<DriverType[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<DriverType[]>>(`${apiGateWay}/v1/account/get-list-driver-by-company/${id}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${cookie.value}`,
      }
    });
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}

export const getListAssistantByCompany = async (id: number): Promise<ApiResponse<AssistantType[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<AssistantType[]>>(`${apiGateWay}/v1/account/get-list-assistant-by-company/${id}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${cookie.value}`,
      }
    });
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}
