
// import type { ConfigPointInRoute, DTO_RP_ConfigFare, DTO_RP_ConfigFare_3 } from "~/types/configFareType";
// import type { ApiResponse } from "./APIResponse";

// export const API_CreateFareConfig = async (data: ConfigPointInRoute): Promise<ApiResponse<DTO_RP_ConfigFare>> => {
//     const config = useRuntimeConfig();
//     const apiGateWay = config.public.apiGateWay;
//     const cookie = useCookie('access_token');
//   try {
//     return await $fetch<ApiResponse<DTO_RP_ConfigFare>>(`${apiGateWay}/v2/bms-config-fare/create-config-fare`, {
//       method: "POST",
//         headers: {
//         'Authorization': `Bearer ${cookie.value}`,
//         'Content-Type': 'application/json'
//       },
//       body: data
//     });
//   } catch (error) {
//     console.error("API error:", error);
//     throw error;
//   }
// }
// export const API_UpdateFareConfig = async (data: ConfigPointInRoute): Promise<ApiResponse<DTO_RP_ConfigFare>> => {
//     const config = useRuntimeConfig();
//     const apiGateWay = config.public.apiGateWay;
//     const cookie = useCookie('access_token');
//   try {
//     return await $fetch<ApiResponse<DTO_RP_ConfigFare>>(`${apiGateWay}/v2/bms-config-fare/update-config-fare/${data.id}`, {
//       method: "PUT",
//         headers: {
//         'Authorization': `Bearer ${cookie.value}`,
//         'Content-Type': 'application/json'
//       },
//       body: data
//     });
//   } catch (error) {
//     console.error("API error:", error);
//     throw error;
//   }
// }
// export const API_GetListConfigFareByCompany = async (company_id: string): Promise<ApiResponse<DTO_RP_ConfigFare_3[]>> => {
//     const config = useRuntimeConfig();
//     const apiGateWay = config.public.apiGateWay;
//     const cookie = useCookie('access_token');
//   try {
//     return await $fetch<ApiResponse<DTO_RP_ConfigFare_3[]>>(`${apiGateWay}/v2/bms-config-fare/get-list-config-fare-by-company/${company_id}`, {
//       method: "GET",
//       headers: {
//         'Authorization': `Bearer ${cookie.value}`,
//         'Content-Type': 'application/json'
//       }
//     });
//   } catch (error) {
//     console.error("API error:", error);
//     throw error;
//   }
// }

// export const API_DeleteFareConfig = async (config_fare_id: number): Promise<ApiResponse<void>> => {
//     const config = useRuntimeConfig();
//     const apiGateWay = config.public.apiGateWay;
//     const cookie = useCookie('access_token');
//     try {
//         return await $fetch<ApiResponse<void>>(`${apiGateWay}/v2/bms-config-fare/delete-config-fare/${config_fare_id}`, {
//             method: "DELETE",
//             headers: {
//                 'Authorization': `Bearer ${cookie.value}`,
//                 'Content-Type': 'application/json'
//             }
//         });
//     } catch (error) {
//         console.error("API error:", error);
//         throw error;
//     }
// }