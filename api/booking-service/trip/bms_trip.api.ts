import type { ApiResponse } from "~/api/APIResponse"
import type { DTO_RQ_ChangeTimeTrip, TripItem } from "~/types/trip/trip.interface"

export const API_GetListTripByRouteAndDate = async (company_id: string, data: {route_id: number, date: string | Date}): Promise<ApiResponse<TripItem[]>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<TripItem[]>>(`${config.public.apiGateWay}/v3/bms-trip/companies/${company_id}/trips`, {
        method: "POST",
        body: data,
    })
}

export const API_UpdateTripInformation = async (data: TripItem): Promise<ApiResponse<TripItem>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<TripItem>>(`${config.public.apiGateWay}/v3/bms-trip/${data.id}`, {
        method: "PUT",
        body: data,
    })
}
export const API_UpdateTripNote = async (tripID: number, note: string): Promise<ApiResponse<TripItem>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<TripItem>>(`${config.public.apiGateWay}/v3/bms-trip/${tripID}/update-note`, {
        method: "PUT",
        body: { note },
    })
}
export const API_ChangeTimeTrip = async (data: DTO_RQ_ChangeTimeTrip): Promise<ApiResponse<TripItem>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<TripItem>>(`${config.public.apiGateWay}/v3/bms-trip/${data.id}/change-time`, {
        method: "PUT",
        body: data,
    })
}
export const API_CancelTrip = async (tripID: number): Promise<ApiResponse<TripItem>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<TripItem>>(`${config.public.apiGateWay}/v3/bms-trip/${tripID}/cancel-trip`, {
        method: "PUT",
    })
}