
import type { ConfigPointInRoute } from "~/types/configFareType";
import type { ApiResponse } from "./APIResponse";

export const API_CreateFareConfig = async (data: ConfigPointInRoute) => {
    const config = useRuntimeConfig();
    const apiGateWay = config.public.apiGateWay;
    const cookie = useCookie('access_token');
  try {
    return await $fetch<ApiResponse<any>>(`${apiGateWay}/v2/bms-config-fare/create-config-fare`, {
      method: "POST",
        headers: {
        'Authorization': `Bearer ${cookie.value}`,
        'Content-Type': 'application/json'
      },
      body: data
    });
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}