import type { Ticket } from "~/types/ticket/ticket.interface";
import { listTicket, lockedByOthers, selectedTickets } from "./useTicketGlobal";
import { valueSelectedTrip } from "../trip/useTripGlobal";

export const useTicketActions = () => {
    const useUserStore = userStore();
    const { $socket } = useNuxtApp()


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

    const handleForceUnlock = (ticket: Ticket) => {
        if (!ticket?.id) return
        console.log('Forcing unlock for ticket:', ticket.id)
        $socket.emit('ticket:unselect', {
            trip_id: valueSelectedTrip.value?.id,
            ticketId: ticket.id,
        })
    }

    const handleRemoveAllSelectedTickets = () => {
        const ticketsToUnselect = [ ...selectedTickets.value ]
        selectedTickets.value = []
        ticketsToUnselect.forEach(t => emitUnselected(t))
    }



    const isLockedByOther = (ticket: Ticket) =>
        !!lockedByOthers.value[ ticket.id ]

    const lockedUserName = (ticket: Ticket) =>
        lockedByOthers.value[ ticket.id ]?.userName



    const handleClickTicket = (ticket: Ticket) => {
        if (!ticket?.id) return

        const phone = ticket.customer?.phone?.trim()
        const currentlySelected = isTicketSelected(ticket)

        /* ==================================================
           LUỒNG 1: CLICK VÉ KHÔNG PHONE
           ================================================== */
        if (!phone) {
            // 🔥 bỏ toàn bộ vé CÓ PHONE (emit WS)
            const removedPhoneTickets = selectedTickets.value.filter(
                t => !!t.customer?.phone
            )
            removedPhoneTickets.forEach(t => emitUnselected(t))

            // local: bỏ vé có phone
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

        /* ==================================================
           LUỒNG 2: CLICK LẠI VÉ ĐÃ CHỌN
           ================================================== */
        if (currentlySelected) {
            selectedTickets.value = selectedTickets.value.filter(
                t => t.id !== ticket.id
            )
            emitUnselected(ticket)
            return
        }

        /* ==================================================
           LUỒNG 3: KHÔNG PHONE → PHONE (BỔ SUNG)
           ================================================== */
        const removedNoPhoneTickets = selectedTickets.value.filter(
            t => !t.customer?.phone
        )
        removedNoPhoneTickets.forEach(t => emitUnselected(t))

        /* ==================================================
           LUỒNG 4: PHONE A → PHONE B
           ================================================== */
        const removedOtherPhoneTickets = selectedTickets.value.filter(
            t => t.customer?.phone && t.customer?.phone !== phone
        )
        removedOtherPhoneTickets.forEach(t => emitUnselected(t))

        // local: chỉ giữ vé cùng phone mới
        selectedTickets.value = selectedTickets.value.filter(
            t => t.customer?.phone === phone
        )

        // chọn group mới
        const group = listTicket.value.filter(
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
        dialogEditTicket,
        handleOpenDialogEditTicket,
        handleCloseDialogEditTicket,
        lockedByOthers,
        isLockedByOther,
        lockedUserName,
        handleForceUnlock,
        handleRemoveAllSelectedTickets,
    }
}


