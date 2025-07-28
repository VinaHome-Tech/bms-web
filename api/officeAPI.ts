import type {  OfficeType, DTO_RQ_Office } from "~/types/officeType";
import type { ApiResponse } from "./APIResponse";
import type { UserActionType } from "~/types/userType";

export const getListOfficeRoomWorkByCompany = async (company_id: string): Promise<ApiResponse<OfficeType[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<OfficeType[]>>(`${apiGateWay}/v2/office/get-list-office-room-work-by-company/${company_id}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${cookie.value}`
      }
    });
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};

export const getListOfficeByCompany = async (company_id: string): Promise<ApiResponse<OfficeType[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<OfficeType[]>>(`${apiGateWay}/v2/office/get-list-office-by-company/${company_id}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${cookie.value}`
      }
    });
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}

export const deleteOffice = async (user: UserActionType, id: number): Promise<ApiResponse<void>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<void>>(`${apiGateWay}/v2/office/delete-office/${id}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${cookie.value}`
      },
      body: {
        user
      }
    });
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}

export const createOffice = async (user: UserActionType, data_create: DTO_RQ_Office): Promise<ApiResponse<OfficeType>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<OfficeType>>(`${apiGateWay}/v2/office/create-office`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${cookie.value}`,
      },
      body: {
        user,
        data_create
      }
    });
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}

export const updateOffice = async (user: UserActionType, data_update: DTO_RQ_Office, id: number): Promise<ApiResponse<OfficeType>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<OfficeType>>(`${apiGateWay}/v2/office/update-office/${id}`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${cookie.value}`,
      },
      body: {
        user,
        data_update
      }
    });
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}
