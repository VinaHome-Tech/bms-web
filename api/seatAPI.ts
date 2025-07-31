import type { DTO_RQ_SeatChart, SeatChartNameType, SeatChartType } from "~/types/seatType";
import type { ApiResponse } from "./APIResponse";
import type { UserActionType } from "~/types/userType";

export const createSeatChart = async (user: UserActionType, data_create: DTO_RQ_SeatChart): Promise<ApiResponse<SeatChartType>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<SeatChartType>>(`${apiGateWay}/v2/seat/create-seat-chart`, {
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

export const getSeatChartByCompany = async (company_id: string): Promise<ApiResponse<SeatChartType[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<SeatChartType[]>>(`${apiGateWay}/v2/seat/get-seat-chart-by-company/${company_id}`, {
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

export const getSeatChartNameByCompany = async (id: string): Promise<ApiResponse<SeatChartNameType[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<SeatChartNameType[]>>(`${apiGateWay}/v2/seat/get-seat-chart-name-by-company/${id}`, {
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

export const deleteSeatChart = async (seatChartId: number, user: UserActionType): Promise<ApiResponse<null>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<null>>(`${apiGateWay}/v2/seat/delete-seat-chart/${seatChartId}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${cookie.value}`,
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

export const updateSeatChart = async (user: UserActionType, data_update: DTO_RQ_SeatChart, id: number): Promise<ApiResponse<SeatChartType>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<SeatChartType>>(`${apiGateWay}/v2/seat/update-seat-chart/${id}`, {
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