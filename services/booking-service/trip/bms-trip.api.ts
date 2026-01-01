import type { ApiResponse } from "~/services/api-response"
import type { DTO_RQ_ChangeTimeTrip, DTO_RQ_UpdateTrip, Trip } from "~/types/trip/trip.interface"

export const API_GetListTripByCompany = async (company_id: string, data: { route_id: string, date: string | Date }): Promise<ApiResponse<Trip[]>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    try {
        return await $apiFetch<ApiResponse<Trip[]>>(`${config.public.apiGateWay}/v3/bms-trip/companies/${company_id}/trips`, {
            method: "POST",
            body: data,
        })
    } catch (error: any) {
        return {
            success: false,
            message: error?.data?.message || 'Lỗi hệ thống',
            statusCode: error?.data?.statusCode || error?.statusCode || 500,
        } as ApiResponse<Trip[]>
    }
}

export const API_UpdateTripInfo = async (tripId: string, data: DTO_RQ_UpdateTrip): Promise<ApiResponse<Trip>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    try {
        return await $apiFetch<ApiResponse<Trip>>(`${config.public.apiGateWay}/v3/bms-trip/${tripId}/update-info`, {
            method: "PUT",
            body: data,
        })
    } catch (error: any) {
        return {
            success: false,
            message: error?.data?.message || 'Lỗi hệ thống',
            statusCode: error?.data?.statusCode || error?.statusCode || 500,
        } as ApiResponse<Trip>
    }
}
export const API_UpdateTripNote = async (tripID: number, note: string): Promise<ApiResponse<Trip>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<Trip>>(`${config.public.apiGateWay}/v3/bms-trip/${tripID}/update-note`, {
        method: "PUT",
        body: { note },
    })
}
export const API_ChangeTimeTrip = async (data: DTO_RQ_ChangeTimeTrip): Promise<ApiResponse<Trip>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<Trip>>(`${config.public.apiGateWay}/v3/bms-trip/${data.id}/change-time`, {
        method: "PUT",
        body: data,
    })
}
export const API_CancelTrip = async (tripID: number): Promise<ApiResponse<Trip>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<Trip>>(`${config.public.apiGateWay}/v3/bms-trip/${tripID}/cancel-trip`, {
        method: "PUT",
    })
}
export const API_GetTripSummaryById = async (tripID: number): Promise<ApiResponse<any>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<any>>(`${config.public.apiGateWay}/v3/bms-trip/${tripID}/summary`, {
        method: "GET",
    })
}