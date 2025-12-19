import type { ApiResponse } from "~/services/api-response";
import type { LicensePlateVehicle, Vehicle } from "~/types/vehicle/vehicle.interface";

// M2_v2.F1
export const API_GetListVehicleByCompanyId = async (company_id: string): Promise<ApiResponse<Vehicle[]>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig()
  return await $apiFetch<ApiResponse<Vehicle[]>>(`${config.public.apiGateWay}/v2/bms-vehicle/companies/${company_id}/vehicles`, {
    method: "GET",
  })
}

// M2_v2.F2
export const API_CreateVehicle = async (company_id: string, data: Vehicle): Promise<ApiResponse<Vehicle>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig() 
  return await $apiFetch<ApiResponse<Vehicle>>(`${config.public.apiGateWay}/v2/bms-vehicle/companies/${company_id}/vehicles`, {
    method: "POST",
    body: data,
  })
}

// M2_v2.F3
export const API_UpdateVehicle = async (vehicle_id: number, data: Vehicle): Promise<ApiResponse<Vehicle>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig()
  return await $apiFetch<ApiResponse<Vehicle>>(`${config.public.apiGateWay}/v2/bms-vehicle/${vehicle_id}`, {
    method: "PUT",
    body: data,
  })
}

// M2_v2.F4
export const API_DeleteVehicle = async (vehicle_id: number): Promise<ApiResponse<null>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig()
  return await $apiFetch<ApiResponse<null>>(`${config.public.apiGateWay}/v2/bms-vehicle/${vehicle_id}`, {
    method: "DELETE",
  })
}

export const API_GetListLicensePlateVehicleByCompanyId = async (company_id: string): Promise<ApiResponse<LicensePlateVehicle[]>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig()
  return await $apiFetch<ApiResponse<LicensePlateVehicle[]>>(`${config.public.apiGateWay}/v2/bms-vehicle/companies/${company_id}/vehicles/license-plates`, {
    method: "GET",
  })
}