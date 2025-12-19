/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApiResponse } from "~/api/api-response"
import type { DTO_RQ_Ticket, TicketItem } from "~/types/ticket/ticket.interface"

export const API_GetListTicketByTripId = async (tripID: number, data: {seat_chart_id: number}): Promise<ApiResponse<TicketItem[]>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<TicketItem[]>>(`${config.public.apiGateWay}/v3/bms-ticket/trip/${tripID}/tickets`, {
        method: "POST",
        body: data,
    })
}

export const API_UpdateTickets = async (tripID: number, ticketIds: number[], data: DTO_RQ_Ticket, user: any): Promise<ApiResponse<TicketItem[]>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<TicketItem[]>>(`${config.public.apiGateWay}/v3/bms-ticket/trip/${tripID}/update-tickets`, {
        method: "POST",
        body: {
            ticket_ids: ticketIds,
            data,
            user
        },
    })
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