import type { LockedSeat, Ticket, TicketItem } from "~/types/ticket/ticket.interface";

export const localSelectedTickets = ref<TicketItem[]>([]);
export const listTicket = ref<Ticket[]>([]);
export const selectedTickets = ref<Ticket[]>([])
export const lockedByOthers = ref<Record<string, LockedSeat>>({})