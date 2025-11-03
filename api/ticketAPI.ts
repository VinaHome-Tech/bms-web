/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  CancelTicketType,
  CopyTicketType,
  DTO_RP_CancelTicket,
  DTO_RP_ListCustomerByTrip,
  DTO_RP_ListTransitDownByTrip,
  DTO_RP_ListTransitUpByTrip,
  DTO_RP_SearchTicket,
  DTO_RP_TicketsToPrint,
  DTO_RQ_UpdateTicket,
  TicketType,
} from "~/types/ticketType";
import type { ApiResponse } from "./APIResponse";
import type { UserActionType } from "~/types/userType";

export const getListTicketsByTrip = async (
  id: number
): Promise<ApiResponse<TicketType[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<TicketType[]>>(
      `${apiGateWay}/v4/bms-ticket/get-list-tickets-by-trip/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cookie.value}`,
        },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const updateTickets = async (
  user: UserActionType,
  data_update: DTO_RQ_UpdateTicket
): Promise<ApiResponse<TicketType[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<TicketType[]>>(
      `${apiGateWay}/v4/bms-ticket/update-tickets`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookie.value}`,
        },
        body: {
          user,
          data_update,
        },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const cancelTickets = async (
  user: UserActionType,
  data_cancel: CancelTicketType
): Promise<ApiResponse<TicketType[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<TicketType[]>>(
      `${apiGateWay}/v4/bms-ticket/cancel-tickets`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookie.value}`,
        },
        body: {
          user,
          data_cancel,
        },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const copyTickets = async (
  user: UserActionType,
  data_copy: CopyTicketType[],
  data_paste: number[]
): Promise<ApiResponse<TicketType[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<TicketType[]>>(
      `${apiGateWay}/v4/bms-ticket/copy-tickets`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookie.value}`,
        },
        body: {
          user,
          data_copy,
          data_paste,
        },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const moveTickets = async (
  user: UserActionType,
  sourceTickets: Array<any>,
  destinationTicketIds: number[]
): Promise<ApiResponse<TicketType[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<TicketType[]>>(
      `${apiGateWay}/v4/bms-ticket/move-tickets`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookie.value}`,
        },
        body: {
          user,
          data_cut: sourceTickets,
          data_paste: destinationTicketIds,
        },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const updateContactStatus = async (
  user: UserActionType,
  ticketIds: number[],
  status: number
): Promise<ApiResponse<TicketType[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<TicketType[]>>(
      `${apiGateWay}/v4/bms-ticket/update-contact-status`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookie.value}`,
        },
        body: {
          user,
          data_update: ticketIds,
          status,
        },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const getListCustomerByTrip = async (
  tripId: number
): Promise<ApiResponse<DTO_RP_ListCustomerByTrip[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<DTO_RP_ListCustomerByTrip[]>>(
      `${apiGateWay}/v4/bms-ticket/get-list-customer-by-trip/${tripId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cookie.value}`,
        },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const getListTransitUpByTrip = async (
  tripId: number
): Promise<ApiResponse<DTO_RP_ListTransitUpByTrip[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<DTO_RP_ListTransitUpByTrip[]>>(
      `${apiGateWay}/v4/bms-ticket/get-list-transit-up-by-trip/${tripId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cookie.value}`,
        },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const getListTransitDownByTrip = async (
  tripId: number
): Promise<ApiResponse<DTO_RP_ListTransitDownByTrip[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<DTO_RP_ListTransitDownByTrip[]>>(
      `${apiGateWay}/v4/bms-ticket/get-list-transit-down-by-trip/${tripId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cookie.value}`,
        },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const querySearchTickets = async (
  queryString: string,
  company_id: string
) => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<DTO_RP_SearchTicket[]>>(`${apiGateWay}/v4/bms-ticket/search-tickets`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cookie.value}`,
      },
      query: {
        query: queryString,
        company_id,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const getTicketsByTripToPrint = async (
  tripId: number
): Promise<ApiResponse<DTO_RP_TicketsToPrint[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<DTO_RP_TicketsToPrint[]>>(
      `${apiGateWay}/v4/bms-ticket/get-tickets-by-trip-to-print/${tripId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cookie.value}`,
        },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export const API_GetListCancelTicketByTrip = async (
  trip_id: number
): Promise<ApiResponse<DTO_RP_CancelTicket[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<DTO_RP_CancelTicket[]>>(
      `${apiGateWay}/v4/bms-ticket/get-list-cancel-ticket-by-trip/${trip_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cookie.value}`,
        },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

