import type { Ticket } from "~/types/ticket/ticket.interface";
import { listTicket } from "./useTicketGlobal";
import { valueSelectedTrip } from "../trip/useTripGlobal";
interface LockedSeat {
    seatName?: string
    userId?: string | null
    userName?: string | null
}
export const useTicketActions = () => {
    const useUserStore = userStore();
    const { $socket } = useNuxtApp()
    const selectedTickets = ref<Ticket[]>([])

    const isTicketSelected = (ticket: Ticket) =>
        selectedTickets.value.some(t => t.id === ticket.id)

    const emitSelected = (tickets: Ticket[]) => {
        const payload = tickets.map(t => ({
            id: t.id,
            seat_name: t.seat?.name,
            user_select_id: useUserStore.id,
            user_select_name: useUserStore.full_name,
        }))

        console.log('Emitting selected tickets:', payload)

        $socket.emit('ticket:selected', {
            trip_id: valueSelectedTrip.value?.id,
            tickets: payload,
        })
    }


    const emitUnselected = (ticket: Ticket) => {
        $socket.emit('ticket:unselect', {
            trip_id: valueSelectedTrip.value?.id,
            ticketId: ticket.id,
        })
    }



    const lockedByOthers = ref<Record<string, LockedSeat>>({})

    const isLockedByOther = (ticket: Ticket) =>
        !!lockedByOthers.value[ ticket.id ]

    const lockedUserName = (ticket: Ticket) =>
        lockedByOthers.value[ ticket.id ]?.userName



    const handleClickTicket = (ticket: Ticket) => {
        if (!ticket?.id) return

        const phone = ticket.customer?.phone?.trim()
        const currentlySelected = isTicketSelected(ticket)

        if (!phone) {
            selectedTickets.value = selectedTickets.value.filter(
                t => !t.customer?.phone
            )

            if (currentlySelected) {
                selectedTickets.value = selectedTickets.value.filter(
                    t => t.id !== ticket.id
                )
                emitUnselected(ticket)
            } else {
                selectedTickets.value.push(ticket)
                emitSelected([ ticket ])
            }
            return
        }

        if (currentlySelected) {
            selectedTickets.value = selectedTickets.value.filter(
                t => t.id !== ticket.id
            )
            emitUnselected(ticket)
            return
        }

        const group = listTicket.value.filter(
            t => t.customer?.phone === phone
        )

        selectedTickets.value = selectedTickets.value.filter(
            t => t.customer?.phone === phone
        )

        selectedTickets.value.push(...group)
        emitSelected(group)
    }




    const dialogEditTicket = ref(false);
    const handleOpenDialogEditTicket = () => {
        dialogEditTicket.value = true;
    };
    const handleCloseDialogEditTicket = () => {
        dialogEditTicket.value = false;
    };
    return {
        handleClickTicket,
        isTicketSelected,
        selectedTickets,
        dialogEditTicket,
        handleOpenDialogEditTicket,
        handleCloseDialogEditTicket,
        lockedByOthers,
        isLockedByOther,
        lockedUserName,
    }
}


