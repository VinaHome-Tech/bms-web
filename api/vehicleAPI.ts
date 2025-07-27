import type { LicensePlateType, VehicleType } from "~/types/vehicleType";
import type { ApiResponse } from "./APIResponse";

export const createVehicle = async (
  data: VehicleType
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
        body: data,
      }
    );
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};

export const updateVehicle = async (
  id: number,
  data: VehicleType
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
        body: data,
      }
    );
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}

export const getListVehicleByCompany = async (
  companyId: number
): Promise<ApiResponse<VehicleType[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<VehicleType[]>>(
      `${apiGateWay}/v2/vehicle/get-list-vehicle-by-company/${companyId}`,
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
