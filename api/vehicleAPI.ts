import type { DTO_RQ_Vehicle, LicensePlateType, VehicleType } from "~/types/vehicleType";
import type { ApiResponse } from "./APIResponse";
import type { UserActionType } from "~/types/userType";

export const createVehicle = async (
  user: UserActionType,
  data_create: DTO_RQ_Vehicle
): Promise<ApiResponse<VehicleType>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<VehicleType>>(
      `${apiGateWay}/v2/vehicle/create-vehicle`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookie.value}`,
        },
        body: {
          user,
          data_create,
        },
      }
    );
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};

export const updateVehicle = async (
  user: UserActionType,
  data_update: DTO_RQ_Vehicle,
  id: number,
): Promise<ApiResponse<VehicleType>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<VehicleType>>(
      `${apiGateWay}/v2/vehicle/update-vehicle/${id}`,
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
    console.error("API error:", error);
    throw error;
  }
}

export const getListVehicleByCompany = async (
  company_id: string
): Promise<ApiResponse<VehicleType[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<VehicleType[]>>(
      `${apiGateWay}/v2/vehicle/get-list-vehicle-by-company/${company_id}`,
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
};

export const deleteVehicle = async (
  user: UserActionType,
  id: number
): Promise<ApiResponse<void>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<void>>(
      `${apiGateWay}/v2/vehicle/delete-vehicle/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${cookie.value}`,
        },
        body: {
          user,
        },
      }
    );
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};

export const getLicensePlateByCompany = async (
  id: number
): Promise<ApiResponse<LicensePlateType[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<LicensePlateType[]>>(
      `${apiGateWay}/v2/vehicle/get-license-plate-by-company/${id}`,
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
};
