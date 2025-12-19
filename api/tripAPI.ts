// import type { DTO_RQ_UpdateTrip, TripType } from "~/types/tripType";
// import type { ApiResponse } from "./APIResponse";
// import type { UserActionType } from "~/types/userType";
// // import type { DTO_RQ_ChangeTimeTrip } from "~/types/trip/trip.interface";

// export const getListTripByRouteAndDate = async (
//   valueDate: Date | string,
//   valueRoute: number | string,
//   companyId: string | null
// ): Promise<ApiResponse<TripType[]>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
//   const cookie = useCookie("access_token");
//   try {
//     return await $fetch<ApiResponse<TripType[]>>(
//       `${apiGateWay}/v2/trip/get-list-trip-by-route-and-date`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${cookie.value}`,
//         },
//         body: {
//           date: valueDate,
//           route: valueRoute,
//           company: companyId,
//         },
//       }
//     );
//   } catch (error) {
//     console.error("API Error:", error);
//     throw error;
//   }
// };

// export const updateTripInformation = async (
//   id: number,
//   user: UserActionType,
//   data_update: DTO_RQ_UpdateTrip
// ): Promise<ApiResponse<TripType>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
//   const cookie = useCookie("access_token");
//   try {
//     return await $fetch<ApiResponse<TripType>>(
//       `${apiGateWay}/v2/trip/update-trip-information/${id}`,
//       {
//         method: "PUT",
//         headers: {
//           Authorization: `Bearer ${cookie.value}`,
//         },
//         body: {
//           user,
//           data_update,
//         },
//       }
//     );
//   } catch (error) {
//     console.error("API Error:", error);
//     throw error;
//   }
// };

// // export const changeTimeTrip = async (
// //   data_update: DTO_RQ_ChangeTimeTrip
// // ): Promise<ApiResponse<TripType>> => {
// //   const config = useRuntimeConfig();
// //   const apiGateWay = config.public.apiGateWay;
// //   const cookie = useCookie("access_token");
// //   try {
// //     return await $fetch<ApiResponse<TripType>>(
// //       `${apiGateWay}/v2/trip/change-time-trip/${data_update.trip_id}`,
// //       {
// //         method: "PUT",
// //         headers: {
// //           Authorization: `Bearer ${cookie.value}`,
// //         },
// //         body: {
// //           data_update,
// //         },
// //       }
// //     );
// //   } catch (error) {
// //     console.error("API Error:", error);
// //     throw error;
// //   }
// // };

// export const deleteTrip = async (
//   tripId: number
// ): Promise<ApiResponse<void>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
//   const cookie = useCookie("access_token");
//   try {
//     return await $fetch<ApiResponse<void>>(
//       `${apiGateWay}/v2/trip/delete-trip/${tripId}`,
//       {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${cookie.value}`,
//         },
//       }
//     );
//   } catch (error) {
//     console.error("API Error:", error);
//     throw error;
//   }
// };

// export const confirmationDepart = async (
//   tripId: number
// ): Promise<ApiResponse<void>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
//   const cookie = useCookie("access_token");
//   try {
//     return await $fetch<ApiResponse<void>>(
//       `${apiGateWay}/v2/trip/confirmation-depart/${tripId}`,
//       {
//         method: "POST",
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

// export const updateNote = async (
//   tripId: number,
//   note: string | null
// ): Promise<ApiResponse<string>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
//   const cookie = useCookie("access_token");
//   try {
//     return await $fetch<ApiResponse<string>>(
//       `${apiGateWay}/v2/trip/update-note/${tripId}`,
//       {
//         method: "PUT",
//         headers: {
//           Authorization: `Bearer ${cookie.value}`,
//         },
//         body: {
//           note,
//         },
//       }
//     );
//   } catch (error) {
//     console.error("API Error:", error);
//     throw error;
//   }
// }

// export const API_UpdateTicketsBookedInTrip = async (
//   tripId: number,
//   ticketsBooked: number,
//   totalTicketsPrice: number
// ): Promise<ApiResponse<void>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
//   const cookie = useCookie("access_token");
//   try {
//     return await $fetch<ApiResponse<void>>(
//       `${apiGateWay}/v2/trip/update-tickets-booked-in-trip/${tripId}`,
//       {
//         method: "PUT",
//         headers: {
//           Authorization: `Bearer ${cookie.value}`,
//         },
//         body: {
//           tickets_booked: ticketsBooked,
//           total_tickets_price: totalTicketsPrice,
//         },
//       }
//     );
//   } catch (error) {
//     console.error("API Error:", error);
//     throw error;
//   }
// }
