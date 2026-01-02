/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApiResponse } from "~/services/api-response"
import type { DTO_RQ_Ticket, Ticket, TicketItem } from "~/types/ticket/ticket.interface"

export const API_GetListTicketByTripId = async (tripID: string, data: { seat_chart_id: string }): Promise<ApiResponse<Ticket[]>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    try {
        return await $apiFetch<ApiResponse<Ticket[]>>(`${config.public.apiGateWay}/v3/bms-ticket/trips/${tripID}/tickets`, {
            method: "POST",
            body: data,
        })
    } catch (error: any) {
        return {
            success: false,
            message: error?.data?.message || 'Lỗi hệ thống',
            statusCode: error?.data?.statusCode || error?.statusCode || 500,
        } as ApiResponse<Ticket[]>
    }
}

export const API_UpdateTickets = async (tripID: string, data: DTO_RQ_Ticket): Promise<ApiResponse<Ticket[]>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    try {
        return await $apiFetch<ApiResponse<Ticket[]>>(`${config.public.apiGateWay}/v3/bms-ticket/trips/${tripID}/update-tickets`, {
            method: "POST",
            body: data,
        })
    } catch (error: any) {
        return {
            success: false,
            message: error?.data?.message || 'Lỗi hệ thống',
            statusCode: error?.data?.statusCode || error?.statusCode || 500,
        } as ApiResponse<Ticket[]>
    }
}
export const API_CancelTickets = async (tripID: number, ticketIds: number[], user: any): Promise<ApiResponse<TicketItem[]>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<TicketItem[]>>(`${config.public.apiGateWay}/v3/bms-ticket/trip/${tripID}/cancel-tickets`, {
        method: "POST",
        body: {
            ticket_ids: ticketIds,
            user
        },
    })
}
export const API_MoveTickets = async (tripID: number, oldTicketId: number, newTicketId: number): Promise<ApiResponse<any>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<any>>(`${config.public.apiGateWay}/v3/bms-ticket/trip/${tripID}/move-tickets`, {
        method: "POST",
        body: {
            old_ticket_id: oldTicketId,
            new_ticket_id: newTicketId,
        },
    })
}
export const API_GetTicketByTripId = async (tripID: number): Promise<ApiResponse<TicketItem[]>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<TicketItem[]>>(`${config.public.apiGateWay}/v3/bms-ticket/trip/${tripID}/tickets`, {
        method: "GET",
    })
}