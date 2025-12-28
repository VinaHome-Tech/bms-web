/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApiResponse } from "~/services/api-response"
import type { DTO_RQ_SeatChart, SeatChart, SeatChartName } from "~/types/seat/seat.interface"

// M4_v2.F1
export const API_GetListSeatChartByCompanyId = async (company_id: string): Promise<ApiResponse<SeatChart[]>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    try {
        return await $apiFetch<ApiResponse<SeatChart[]>>(
            `${config.public.apiGateWay}/v2/bms-seat/companies/${company_id}/seat-charts`,
            {
                method: "GET",
            }
        )
    } catch (error: any) {
        return {
            success: false,
            message: error?.data?.message || 'Lỗi hệ thống',
            statusCode: error?.data?.statusCode || error?.statusCode || 500,
        } as ApiResponse<SeatChart[]>
    }
}

// M4_v2.F2
export const API_CreateSeatChart = async (
    company_id: string,
    data: DTO_RQ_SeatChart
): Promise<ApiResponse<SeatChart>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    try {
        return await $apiFetch<ApiResponse<SeatChart>>(
            `${config.public.apiGateWay}/v2/bms-seat/companies/${company_id}/seat-charts`,
            {
                method: "POST",
                body: data,
            }
        )
    } catch (error: any) {
        return {
            success: false,
            message: error?.data?.message || 'Lỗi hệ thống',
            statusCode: error?.data?.statusCode || error?.statusCode || 500,
        } as ApiResponse<SeatChart>
    }
}


// M4_v2.F3
export const API_UpdateSeatChart = async (seat_chart_id: string, data: DTO_RQ_SeatChart): Promise<ApiResponse<SeatChart>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    try {
        return await $apiFetch<ApiResponse<SeatChart>>(
            `${config.public.apiGateWay}/v2/bms-seat/${seat_chart_id}`,
            {
                method: "PUT",
                body: data,
            }
        )
    } catch (error: any) {
        return {
            success: false,
            message: error?.data?.message || 'Lỗi hệ thống',
            statusCode: error?.data?.statusCode || error?.statusCode || 500,
        } as ApiResponse<SeatChart>
    }
}

// M4_v2.F4
export const API_DeleteSeatChart = async (seat_chart_id: string): Promise<ApiResponse<null>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    try {
        return await $apiFetch<ApiResponse<null>>(
            `${config.public.apiGateWay}/v2/bms-seat/${seat_chart_id}`,
            {
                method: "DELETE",
            }
        )
    } catch (error: any) {
        return {
            success: false,
            message: error?.data?.message || 'Lỗi hệ thống',
            statusCode: error?.data?.statusCode || error?.statusCode || 500,
        } as ApiResponse<null>
    }
}

// M4_v2.F5
export const API_GetListSeatChartNameByCompanyId = async (company_id: string): Promise<ApiResponse<SeatChartName[]>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    try {
        return await $apiFetch<ApiResponse<SeatChartName[]>>(
            `${config.public.apiGateWay}/v2/bms-seat/companies/${company_id}/seat-chart-name`,
            {
                method: "GET",
            }
        )   
    } catch (error: any) {
        return {
            success: false,
            message: error?.data?.message || 'Lỗi hệ thống',
            statusCode: error?.data?.statusCode || error?.statusCode || 500,
        } as ApiResponse<SeatChartName[]>
    }
}