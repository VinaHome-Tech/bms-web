import type { ApiResponse } from "~/api/api-response"
import type { SeatChart, SeatChartName } from "~/types/seat/seat.interface"

// M4_v2.F1
export const API_GetListSeatChartByCompanyId = async (company_id: string): Promise<ApiResponse<SeatChart[]>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<SeatChart[]>>(`${config.public.apiGateWay}/v2/bms-seat/companies/${company_id}/seat-charts`, {
        method: "GET",
    })
}

// M4_v2.F2
export const API_CreateSeatChart = async (company_id: string, data: SeatChart): Promise<ApiResponse<SeatChart>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<SeatChart>>(`${config.public.apiGateWay}/v2/bms-seat/companies/${company_id}/seat-charts`, {
        method: "POST",
        body: data,
    })
}

// M4_v2.F3
export const API_UpdateSeatChart = async (seat_chart_id: number, data: SeatChart): Promise<ApiResponse<SeatChart>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<SeatChart>>(`${config.public.apiGateWay}/v2/bms-seat/${seat_chart_id}`, {
        method: "PUT",
        body: data,
    })
}

// M4_v2.F4
export const API_DeleteSeatChart = async (seat_chart_id: number): Promise<ApiResponse<null>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<null>>(`${config.public.apiGateWay}/v2/bms-seat/${seat_chart_id}`, {
        method: "DELETE",
    })
}

// M4_v2.F5
export const API_GetListSeatChartNameByCompanyId = async (company_id: string): Promise<ApiResponse<SeatChartName[]>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<SeatChartName[]>>(`${config.public.apiGateWay}/v2/bms-seat/companies/${company_id}/seat-charts-name`, {
        method: "GET",
    })
}