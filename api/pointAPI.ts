// import type { DTO_RP_GroupPointName, DTO_RP_ItemPointConfigTime, DTO_RP_RoutePointName } from "~/types/pointType";
// import type { ApiResponse } from "./APIResponse";

// export const API_GetListPointNameByRoute = async (
//   route_id: number
// ): Promise<ApiResponse<DTO_RP_GroupPointName[]>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
//   const cookie = useCookie("access_token");
//   try {
//     return await $fetch<ApiResponse<DTO_RP_GroupPointName[]>>(
//       `${apiGateWay}/v2/bms-point/get-list-point-name-by-route/${route_id}`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${cookie.value}`,
//         },
//       }
//     );
//   } catch (error) {
//     console.error("API error:", error);
//     throw error;
//   }
// }

// export const API_GetListPointToConfigTimeByRoute = async (
//   route_id: number
// ): Promise<ApiResponse<DTO_RP_ItemPointConfigTime[]>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
//   const cookie = useCookie("access_token");
//   try {
//     return await $fetch<ApiResponse<DTO_RP_ItemPointConfigTime[]>>(
//       `${apiGateWay}/v2/bms-point/get-list-point-to-config-time-by-route/${route_id}`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${cookie.value}`,
//         },
//       }
//     );
//   } catch (error) {
//     console.error("API error:", error);
//     throw error;
//   }
// }
// export const API_UpdatePointConfigTime = async (
//   route_id: number,
//   pointConfigTimes: DTO_RP_ItemPointConfigTime[]
// ): Promise<ApiResponse<void>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
//   const cookie = useCookie("access_token");
//   try {
//     return await $fetch<ApiResponse<void>>(
//       `${apiGateWay}/v2/bms-point/update-point-config-time/${route_id}`,
//       {
//         method: "PUT",
//         headers: {
//           Authorization: `Bearer ${cookie.value}`,
//         },
//         body: {
//           data: pointConfigTimes
//         },
//       }
//     );
//   } catch (error) {
//     console.error("API error:", error);
//     throw error;
//   }
// }
// export const API_GetListRoutePointNameByRoute = async (
//   route_id: number
// ): Promise<ApiResponse<DTO_RP_RoutePointName[]>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
//   const cookie = useCookie("access_token");
//   try {
//     return await $fetch<ApiResponse<DTO_RP_RoutePointName[]>>(
//       `${apiGateWay}/v2/bms-point/get-list-route-point-name-by-route/${route_id}`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${cookie.value}`,
//         },
//       }
//     );
//   } catch (error) {
//     console.error("API error:", error);
//     throw error;
//   }
// }