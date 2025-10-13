import type { DTO_RP_GroupPointName } from "~/types/pointType";
import type { ApiResponse } from "./APIResponse";

export const API_GetListPointNameByRoute = async (
  route_id: number
): Promise<ApiResponse<DTO_RP_GroupPointName[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<DTO_RP_GroupPointName[]>>(
      `${apiGateWay}/v2/bms-point/get-list-point-name-by-route/${route_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cookie.value}`,
        },
      }
    );
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}