import type { DTO_RQ_Schedule, ScheduleType } from "~/types/scheduleType";
import type { ApiResponse } from "./APIResponse";
import type { UserActionType } from "~/types/userType";

export const createSchedule = async (user: UserActionType, data_create: DTO_RQ_Schedule): Promise<ApiResponse<ScheduleType>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<ScheduleType>>(`${apiGateWay}/v2/schedule/create-schedule`, {
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

export const getListSchedulesByCompany = async (id: string): Promise<ApiResponse<ScheduleType[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<ScheduleType[]>>(`${apiGateWay}/v2/schedule/get-list-schedules-by-company/${id}`, {
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

export const deleteSchedule = async (user: UserActionType, id: number): Promise<ApiResponse<void>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<void>>(`${apiGateWay}/v2/schedule/delete-schedule/${id}`, {
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

export const updateSchedule = async (user: UserActionType, data_update: DTO_RQ_Schedule, id: number): Promise<ApiResponse<ScheduleType>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<ScheduleType>>(`${apiGateWay}/v2/schedule/update-schedule/${id}`, {
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