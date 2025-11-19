import type { ApiResponse } from "~/api/APIResponse"
import type { TripItem } from "~/types/trip/trip.interface"

export const API_GetListTripByRouteAndDate = async (company_id: string, data: {route_id: number, date: string | Date}): Promise<ApiResponse<TripItem[]>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<TripItem[]>>(`${config.public.apiGateWay}/v3/bms-trip/companies/${company_id}/trips`, {
        method: "POST",
        body: data,
    })
}

export const API_UpdateTripInformation = async (data: TripItem): Promise<ApiResponse<null>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<null>>(`${config.public.apiGateWay}/v3/bms-trip/${data.id}`, {
        method: "PUT",
        body: data,
    })
}