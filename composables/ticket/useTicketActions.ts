import type { DTO_RQ_CancelTicket, DTO_RQ_Ticket, Ticket } from "~/types/ticket/ticket.interface";
import { activeModeTicket, listTicket, loadingTickets, lockedByOthers, selectedTickets, sourceTickets } from "./useTicketGlobal";
import { listTrip, valueSelectedTrip } from "../trip/useTripGlobal";
import { API_CancelTickets, API_MoveTickets, API_UpdateTickets } from "~/services/booking-service/ticket/bms-ticket.api";

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
        activeModeTicket.value = null;
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
    const handleClickTicket = async (ticket: Ticket) => {
        if (!ticket?.id) return


        if (activeModeTicket.value && sourceTickets.value.length > 0) {

            const source = sourceTickets.value[ 0 ] // lấy vé đầu tiên
            if (!source) return


            if (activeModeTicket.value === 'MOVE') {
                if (
                    !useUserStore.id ||
                    !useUserStore.full_name ||
                    !useOfficeStore.id ||
                    !useOfficeStore.name
                ) {
                    notifyWarning('Thiếu thông tin tài khoản')
                    return
                }
                const movingTicketIds = [ source.id, ticket.id ]
                // 🔥 LOCAL LOADING
                addLoadingTickets(movingTicketIds)
                // 🔥 REALTIME LOADING
                $socket.emit('ticket:updating', {
                    trip_id: valueSelectedTrip.value?.id,
                    ticket_ids: movingTicketIds,
                    user_name: useUserStore.full_name,
                })
                try {
                    const response = await API_MoveTickets(
                        valueSelectedTrip.value?.id ?? '',
                        {
                            from_ticket_id: source.id,
                            to_ticket_id: ticket.id,
                            user_updated: {
                                id: useUserStore.id,
                                name: useUserStore.full_name,
                            },
                            office_updated: {
                                id: useOfficeStore.id,
                                name: useOfficeStore.name,
                            },
                        }
                    )

                    if (response.success && Array.isArray(response.result)) {
                        const updatedTickets: Ticket[] = response.result

                        listTicket.value = listTicket.value.map(t => {
                            const updated = updatedTickets.find(u => u.id === t.id)
                            return updated ?? t
                        })
                        if (!valueSelectedTrip.value) return

                        const bookedTickets = listTicket.value.filter(
                            t => t.booked_status === true
                        )

                        valueSelectedTrip.value = {
                            ...valueSelectedTrip.value,
                            ticket_booked: bookedTickets.length,
                            total_price: bookedTickets.reduce(
                                (sum, t) =>
                                    sum +
                                    (t.price?.total_price ?? 0) +
                                    (t.price?.surcharge ?? 0),
                                0,
                            ),
                            money_paid: bookedTickets.reduce(
                                (sum, t) => sum + (t.price?.money_paid ?? 0),
                                0,
                            ),
                        }
                        // 3️⃣ === DÙNG INDEX NHƯNG CÓ BẢO VỆ ===
                        const fromTicket = updatedTickets[ 0 ]
                        const toTicket = updatedTickets[ 1 ]

                        if (fromTicket && toTicket) {
                            const fromTripId = fromTicket.trip_id
                            const toTripId = toTicket.trip_id

                            listTrip.value = listTrip.value.map(trip => {
                                // Trip cũ: giảm 1 vé
                                if (trip.id === fromTripId) {
                                    return {
                                        ...trip,
                                        ticket_booked: Math.max((trip.ticket_booked ?? 1) - 1, 0),
                                    }
                                }

                                // Trip mới: tăng 1 vé
                                if (trip.id === toTripId) {
                                    return {
                                        ...trip,
                                        ticket_booked: (trip.ticket_booked ?? 0) + 1,
                                    }
                                }

                                return trip
                            })
                        } else {
                            console.warn('MOVE response thiếu vé from/to', updatedTickets)
                        }


                        notifySuccess(
                            `Đã di chuyển vé ${source.seat?.name} → ${ticket.seat?.name}`
                        )
                        // 🔥 BỎ CHỌN VÉ NGUỒN
                        selectedTickets.value = selectedTickets.value.filter(
                            t => t.id !== source.id
                        )
                        emitUnselected(source)
                    } else {
                        notifyWarning(response.message || 'Di chuyển vé thất bại')
                    }
                } catch (error) {
                    console.error(error)
                    notifyError('Di chuyển vé thất bại')
                } finally {
                    // 🔥 RELEASE LOADING LOCAL
                    removeLoadingTickets(movingTicketIds)

                    // 🔥 RELEASE LOADING REALTIME
                    $socket.emit('ticket:updated', {
                        trip_id: valueSelectedTrip.value?.id,
                        ticket_ids: movingTicketIds,
                    })
                }
            }
            if (activeModeTicket.value === 'COPY') {
                // handleCopyTickets({
                //     from: [source],
                //     to: ticket,
                // })
                notifySuccess(
                    `Đã sao chép vé ${source.seat?.name} → ${ticket.seat?.name}`
                )
            }
            // ✅ remove vé đã xử lý
            sourceTickets.value = sourceTickets.value.slice(1)

            // ✅ nếu hết vé → reset
            if (sourceTickets.value.length === 0) {
                // resetTicketAction()

                activeModeTicket.value = null
            } else {
                notifyInfo(
                    `Còn ${sourceTickets.value.length} vé, vui lòng chọn vé đích tiếp theo`
                )
            }
            return // 🔥 không chạy logic select bên dưới
        }
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
    const handleStartActionTicket = (mode: 'COPY' | 'MOVE') => {
        // 1️⃣ Không có vé được chọn
        if (selectedTickets.value.length === 0) {
            notifyWarning('Vui lòng chọn vé để thực hiện thao tác.')
            return
        }
        // 2️⃣ Không cho thao tác khi đang update
        const hasLoadingTicket = selectedTickets.value.some(t =>
            isLoadingTicket(t)
        )
        if (hasLoadingTicket) {
            notifyWarning('Vé đang được xử lý, vui lòng chờ.')
            return
        }
        // 3️⃣ Snapshot vé nguồn
        sourceTickets.value = [ ...selectedTickets.value ]
        // 4️⃣ Set mode
        activeModeTicket.value = mode

        notifyInfo(
            `${mode === 'MOVE' ? 'Di chuyển' : 'Sao chép'} vé: ` +
            sourceTickets.value.map(t => t.seat?.name).join(', ')
        )
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
        handleStartActionTicket,

    }
}


