import type { DTO_RQ_CancelTicket, DTO_RQ_Ticket, Ticket } from "~/types/ticket/ticket.interface";
import { listTicket, loadingTickets, lockedByOthers, selectedTickets } from "./useTicketGlobal";
import { listTrip, valueSelectedTrip } from "../trip/useTripGlobal";
import { API_CancelTickets, API_UpdateTickets } from "~/services/booking-service/ticket/bms-ticket.api";

export const useTicketActions = () => {
    const useUserStore = userStore();
    const useOfficeStore = officeStore();
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

    const addUniqueTickets = (tickets: Ticket[]) => {
        const map = new Map<string, Ticket>()

        // giữ vé đã chọn
        selectedTickets.value.forEach(t => {
            map.set(t.id, t)
        })

        // thêm vé mới (ghi đè nếu trùng id)
        tickets.forEach(t => {
            map.set(t.id, t)
        })

        selectedTickets.value = Array.from(map.values())
    }


    const handleClickTicket = (ticket: Ticket) => {
        if (!ticket?.id) return

        const phone = ticket.customer?.phone?.trim()
        const currentlySelected = isTicketSelected(ticket)

        /* ========= LUỒNG 1: VÉ KHÔNG PHONE ========= */
        if (!phone) {
            // bỏ vé có phone
            const removedPhoneTickets = selectedTickets.value.filter(
                t => !!t.customer?.phone
            )
            removedPhoneTickets.forEach(t => emitUnselected(t))

            selectedTickets.value = selectedTickets.value.filter(
                t => !t.customer?.phone
            )

            if (currentlySelected) {
                selectedTickets.value = selectedTickets.value.filter(
                    t => t.id !== ticket.id
                )
                emitUnselected(ticket)
            } else {
                addUniqueTickets([ ticket ])
                emitSelected([ ticket ])
            }
            return
        }

        /* ========= LUỒNG 2: CLICK LẠI VÉ ĐÃ CHỌN ========= */
        if (currentlySelected) {
            selectedTickets.value = selectedTickets.value.filter(
                t => t.id !== ticket.id
            )
            emitUnselected(ticket)
            return
        }

        /* ========= LUỒNG 3: KHÔNG PHONE → PHONE ========= */
        const removedNoPhoneTickets = selectedTickets.value.filter(
            t => !t.customer?.phone
        )
        removedNoPhoneTickets.forEach(t => emitUnselected(t))

        /* ========= LUỒNG 4: PHONE A → PHONE B ========= */
        const removedOtherPhoneTickets = selectedTickets.value.filter(
            t => t.customer?.phone && t.customer?.phone !== phone
        )
        removedOtherPhoneTickets.forEach(t => emitUnselected(t))

        selectedTickets.value = selectedTickets.value.filter(
            t => t.customer?.phone === phone
        )

        const group = listTicket.value.filter(t =>
            t.customer?.phone === phone &&
            !isLockedByOther(t) // 🔥 CHỐT Ở ĐÂY
        )
        if (group.length === 0) {
            return
        }


        addUniqueTickets(group)
        emitSelected(group)
    }














    const addLoadingTickets = (ticketIds: string[]) => {
        ticketIds.forEach(id => {
            if (!loadingTickets.value.includes(id)) {
                loadingTickets.value.push(id)
            }
        })
    }

    const removeLoadingTickets = (ticketIds: string[]) => {
        loadingTickets.value = loadingTickets.value.filter(
            id => !ticketIds.includes(id)
        )

    }

    const isLoadingTicket = (ticket: Ticket) =>
        loadingTickets.value.includes(ticket.id)




    const handleUpdateTickets = async (updatedTickets: DTO_RQ_Ticket) => {
        const ticketIds = updatedTickets.ticket_ids ?? []
        if (ticketIds.length === 0) return
        const updatingTickets = selectedTickets.value.filter(t =>
            ticketIds.includes(t.id)
        )
        // 🔥 LOCAL LOADING (USER HIỆN TẠI)
        addLoadingTickets(updatingTickets.map(t => t.id))
        // 🔥 REALTIME LOADING (USER KHÁC)
        $socket.emit('ticket:updating', {
            trip_id: valueSelectedTrip.value?.id,
            ticket_ids: ticketIds,
            user_name: useUserStore.full_name,
        })
        try {
            const response = await API_UpdateTickets(
                valueSelectedTrip.value?.id ?? '',
                updatedTickets
            )
            if (response.success) {
                notifySuccess('Cập nhật thông tin vé thành công')
                if (response.result) {
                    listTicket.value = listTicket.value.map(t => {
                        const updated = response.result?.find(ut => ut.id === t.id)
                        return updated ? { ...t, ...updated } : t
                    })

                    if (!valueSelectedTrip.value) return

                    valueSelectedTrip.value = {
                        ...valueSelectedTrip.value,
                        ticket_booked: listTicket.value.filter(
                            t => t.booked_status === true
                        ).length,
                        total_price: listTicket.value
                            .filter(t => t.booked_status === true)
                            .reduce(
                                (sum, t) => sum + (t.price?.total_price ?? 0) + (t.price?.surcharge ?? 0),
                                0
                            ),

                        money_paid: listTicket.value
                            .filter(t => t.booked_status === true)
                            .reduce(
                                (sum, t) => sum + (t.price?.money_paid ?? 0),
                                0
                            ),
                    }

                    listTrip.value = listTrip.value.map(trip => {
                        if (trip.id === valueSelectedTrip.value?.id) {
                            return { ...trip, ...valueSelectedTrip.value }
                        }
                        return trip
                    })


                }
                // 🔓 RELEASE WS
                const releasedTickets = selectedTickets.value.filter(
                    t => ticketIds.includes(t.id)
                )
                releasedTickets.forEach(ticket => {
                    emitUnselected(ticket)
                })
                // 🧹 CLEAR LOCAL SELECT
                selectedTickets.value = selectedTickets.value.filter(
                    t => !ticketIds.includes(t.id)
                )
            } else {
                notifyWarning(response.message || 'Cập nhật thông tin vé thất bại')
            }
        } catch (error) {
            console.error(error)
            notifyError('Cập nhật thông tin vé thất bại')
        } finally {
            // 🔥 TẮT LOADING LOCAL
            removeLoadingTickets(ticketIds)
            // 🔥 TẮT LOADING REALTIME
            $socket.emit('ticket:updated', {
                trip_id: valueSelectedTrip.value?.id,
                ticket_ids: ticketIds,
            })
        }
    }

    const handleCancelTickets = async () => {
        if (
            !useUserStore.id ||
            !useUserStore.full_name ||
            !useOfficeStore.id ||
            !useOfficeStore.name
        ) {
            notifyWarning('Thiếu thông tin tài khoản')
            return
        }
        const ticketIds = selectedTickets.value.map(t => t.id)
        const canceledTickets: DTO_RQ_CancelTicket = {
            ticket_ids: ticketIds,
            user_updated: {
                id: useUserStore.id,
                name: useUserStore.full_name,
            },
            office_updated: {
                id: useOfficeStore.id,
                name: useOfficeStore.name,
            },
        }
        if (ticketIds.length === 0) return
        const updatingTickets = selectedTickets.value.filter(t =>
            ticketIds.includes(t.id)
        )
        // 🔥 LOCAL LOADING (USER HIỆN TẠI)
        addLoadingTickets(updatingTickets.map(t => t.id))
        // 🔥 REALTIME LOADING (USER KHÁC)
        $socket.emit('ticket:updating', {
            trip_id: valueSelectedTrip.value?.id,
            ticket_ids: ticketIds,
            user_name: useUserStore.full_name,
        })
        try {
            const response = await API_CancelTickets(
                valueSelectedTrip.value?.id ?? '',
                canceledTickets
            )
            if (response.success) {
                notifySuccess('Hủy vé thành công')
                if (response.result) {
                    listTicket.value = listTicket.value.map(t => {
                        const updated = response.result?.find(ut => ut.id === t.id)
                        return updated ? { ...t, ...updated } : t
                    })
                    if (!valueSelectedTrip.value) return

                    valueSelectedTrip.value = {
                        ...valueSelectedTrip.value,
                        ticket_booked: listTicket.value.filter(
                            t => t.booked_status === true
                        ).length,
                        total_price: listTicket.value
                            .filter(t => t.booked_status === true)
                            .reduce(
                                (sum, t) => sum + (t.price?.total_price ?? 0) + (t.price?.surcharge ?? 0),
                                0
                            ),

                        money_paid: listTicket.value
                            .filter(t => t.booked_status === true)
                            .reduce(
                                (sum, t) => sum + (t.price?.money_paid ?? 0),
                                0
                            ),
                    }

                    listTrip.value = listTrip.value.map(trip => {
                        if (trip.id === valueSelectedTrip.value?.id) {
                            return { ...trip, ...valueSelectedTrip.value }
                        }
                        return trip
                    })
                }
                // 🔓 RELEASE WS
                const releasedTickets = selectedTickets.value.filter(
                    t => ticketIds.includes(t.id)
                )
                releasedTickets.forEach(ticket => {
                    emitUnselected(ticket)
                })
                // 🧹 CLEAR LOCAL SELECT
                selectedTickets.value = selectedTickets.value.filter(
                    t => !ticketIds.includes(t.id)
                )
            } else {
                notifyWarning(response.message || 'Hủy vé thất bại')
            }
        } catch (error) {
            console.error(error)
            notifyError('Hủy vé thất bại')
        } finally {
            // 🔥 TẮT LOADING LOCAL
            removeLoadingTickets(ticketIds)
            // 🔥 TẮT LOADING REALTIME
            $socket.emit('ticket:updated', {
                trip_id: valueSelectedTrip.value?.id,
                ticket_ids: ticketIds,
            })
        }
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
        isLockedByOther,
        lockedUserName,
        handleForceUnlock,
        handleRemoveAllSelectedTickets,
        handleUpdateTickets,
        isLoadingTicket,
        addLoadingTickets,
        removeLoadingTickets,
        handleCancelTickets,
    }
}


