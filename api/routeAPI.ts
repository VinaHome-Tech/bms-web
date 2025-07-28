import type { DTO_RP_ListRouteName, DTO_RQ_Route, RouteType } from "~/types/routeType";
import type { ApiResponse } from "./APIResponse";
import type { UserActionType } from "~/types/userType";

export const createRoute = async (user: UserActionType, data_create: DTO_RQ_Route): Promise<ApiResponse<RouteType>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<RouteType>>(`${apiGateWay}/v2/route/create-route`, {
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

export const updateRoute = async (user: UserActionType, data_update: DTO_RQ_Route, id: number): Promise<ApiResponse<RouteType>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<RouteType>>(`${apiGateWay}/v2/route/update-route/${id}`, {
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

export const deleteRoute = async (user: UserActionType, id: number): Promise<ApiResponse<void>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<void>>(`${apiGateWay}/v2/route/delete-route/${id}`, {
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

export const getListRouteByCompany = async (company_id: string): Promise<ApiResponse<RouteType[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<RouteType[]>>(`${apiGateWay}/v2/route/get-list-route-by-company/${company_id}`, {
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

export const updateRouteOrder = async (data: { route_id: number; display_order: number, company_id: string }): Promise<ApiResponse<RouteType>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<RouteType>>(`${apiGateWay}/v2/route/update-route-order`, {
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

export const getListRouteNameByCompany = async (id: string): Promise<ApiResponse<DTO_RP_ListRouteName[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<DTO_RP_ListRouteName[]>>(`${apiGateWay}/v2/route/get-list-route-name-by-company/${id}`, {
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

export const getListRouteNameActionByCompany = async (id: string): Promise<ApiResponse<DTO_RP_ListRouteName[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<DTO_RP_ListRouteName[]>>(`${apiGateWay}/v2/route/get-list-route-name-action-by-company/${id}`, {
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




