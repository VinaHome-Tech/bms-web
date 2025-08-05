import type { DTO_RQ_UpdateTrip, TripType } from "~/types/tripType";
import type { ApiResponse } from "./APIResponse";
import type { UserActionType } from "~/types/userType";

export const getListTripByRouteAndDate = async (
  valueDate: Date | string,
  valueRoute: number | string,
  companyId: string | null
): Promise<ApiResponse<TripType[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<TripType[]>>(
      `${apiGateWay}/v2/trip/get-list-trip-by-route-and-date`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookie.value}`,
        },
        body: {
          date: valueDate,
          route: valueRoute,
          company: companyId,
        },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const updateTripInformation = async (
  id: number,
  user: UserActionType,
  data_update: DTO_RQ_UpdateTrip
): Promise<ApiResponse<TripType>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<TripType>>(
      `${apiGateWay}/v2/trip/update-trip-information/${id}`,
      {
        method: "PUT",
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
