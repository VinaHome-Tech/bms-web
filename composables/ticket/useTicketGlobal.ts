import type { Ticket, TicketItem } from "~/types/ticket/ticket.interface";

export const localSelectedTickets = ref<TicketItem[]>([]);
export const listTicket = ref<Ticket[]>([]);