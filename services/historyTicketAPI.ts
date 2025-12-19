// import type { DTO_RP_HistoryTicket } from "~/types/historyTicketType";
// import type { ApiResponse } from "./APIResponse";

// export const API_GetHistoryTicket = async (
//   ticket_code: string
// ): Promise<ApiResponse<DTO_RP_HistoryTicket[]>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
//   const cookie = useCookie("access_token");
//   try {
//     return await $fetch<ApiResponse<DTO_RP_HistoryTicket[]>>(
//       `${apiGateWay}/v4/bms-history/get-history-ticket/${ticket_code}`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${cookie.value}`,
//         },
//       }
//     );
//   } catch (error) {
//     console.error("API Error:", error);
//     throw error;
//   }
// }
