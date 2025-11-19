/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TicketItem } from "~/types/ticket/ticket.interface";
import { valueSelectedTrip } from "../trip/useTripGlobal";

export const useTicketFirebase = () => {
    const { $firebase } = useNuxtApp();
    const useUserStore = userStore();
    const isSyncing = ref(false);
    const syncError = ref<string | null>(null);

    // ✅ 1 path chung cho tất cả vé được chọn trong chuyến này
    const selectedTicketsPath = computed(() => {
        try {
            const companyID = useUserStore.company_id;
            const tripID = valueSelectedTrip.value?.id;
            return `${companyID}/trips/${tripID}/selected_tickets`;
        } catch (error) {
            console.error("Error computing path:", error);
            return null;
        }
    });

    // ✅ Đồng bộ vé lên Firebase (MERGE, không overwrite)
    // 🔧 Sửa trong useTicketFirebase.ts - syncLocalTicketsToFirebase

    const syncLocalTicketsToFirebase = async (tickets: TicketItem[]) => {
        try {
            isSyncing.value = true;
            syncError.value = null;

            if (!selectedTicketsPath.value) {
                throw new Error("Firebase path không hợp lệ");
            }

            // ✅ Nếu tickets rỗng, vẫn cần xử lý để xóa khỏi Firebase
            console.log("📤 Syncing tickets to Firebase:", tickets.length, "tickets");

            const ticketData = tickets.map(ticket => ({
                id: ticket.id,
                name: ticket?.seat_name,
                selected_by_id: useUserStore.id,
                selected_by_name: useUserStore.full_name,
                selected_by_username: useUserStore.username,
            }));

            const ticketsRef = $firebase.ref($firebase.db, selectedTicketsPath.value);

            // ✅ Lấy dữ liệu hiện tại từ Firebase
            const snapshot = await new Promise((resolve: any) => {
                $firebase.onValue(
                    ticketsRef,
                    (snap: any) => {
                        resolve(snap);
                        $firebase.off(ticketsRef);
                    },
                    () => resolve(null)
                );
            });

            let existingTickets: any[] = [];
            if (snapshot && typeof (snapshot as any).exists === "function" && (snapshot as any).exists()) {
                const data = (snapshot as any).val();
                existingTickets = data.tickets || [];
            }

            // ✅ Xóa vé cũ của user này, thêm vé mới
            const filteredExisting = existingTickets.filter(
                (t: any) => t.selected_by_id !== useUserStore.id
            );

            // ✅ Merge: vé của user khác + vé mới của user này
            const mergedTickets = [ ...filteredExisting, ...ticketData ];

            console.log("📊 Merged result:", {
                otherUsersTickets: filteredExisting.length,
                currentUserTickets: ticketData.length,
                total: mergedTickets.length
            });

            // ✅ Nếu không còn vé nào sau merge, xóa path
            if (mergedTickets.length === 0) {
                console.log("🗑️ No tickets left, removing path from Firebase");
                await $firebase.remove(ticketsRef);
                console.log("✅ Path removed from Firebase");
            } else {
                // ✅ Luôn cập nhật, kể cả khi user hiện tại không có vé nào
                await $firebase.set(ticketsRef, {
                    tickets: mergedTickets,
                    count: mergedTickets.length,
                    lastUpdated: new Date().toISOString(),
                });
                console.log("✅ Merged tickets to Firebase:", mergedTickets);
            }

            return true;
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Sync failed";
            console.error("❌ Error syncing tickets to Firebase:", error);
            syncError.value = errorMsg;
            throw error;
        } finally {
            isSyncing.value = false;
        }
    };

    // ✅ Lắng nghe tất cả vé từ Firebase
    const listenToFirebaseTickets = (callback: (tickets: TicketItem[]) => void) => {
        try {
            if (!selectedTicketsPath.value) {
                throw new Error("Firebase path không hợp lệ");
            }

            const ticketsRef = $firebase.ref($firebase.db, selectedTicketsPath.value);

            const unsubscribe = $firebase.onValue(
                ticketsRef,
                (snapshot) => {
                    try {
                        if (snapshot && typeof (snapshot as any).exists === "function" && (snapshot as any).exists()) {
                            const data = (snapshot as any).val();
                            const tickets = data.tickets || [];
                            callback(tickets);
                            console.log("📡 Received tickets from Firebase:", tickets);
                        } else {
                            callback([]);
                            console.log("No tickets found in Firebase");
                        }
                    } catch (error) {
                        console.error("Error processing snapshot:", error);
                        syncError.value = "Error processing data";
                    }
                },
                (error) => {
                    console.error("❌ Error listening to Firebase:", error);
                    syncError.value = error instanceof Error ? error.message : "Listener error";
                }
            );

            return unsubscribe;
        } catch (error) {
            console.error("❌ Error setting up listener:", error);
            syncError.value = error instanceof Error ? error.message : "Setup failed";
            throw error;
        }
    };

    // ✅ Xóa chỉ vé của user hiện tại (không xóa vé của user khác)
    const clearFirebaseTickets = async () => {
        try {
            isSyncing.value = true;
            syncError.value = null;

            if (!selectedTicketsPath.value) {
                throw new Error("Firebase path không hợp lệ");
            }

            const ticketsRef = $firebase.ref($firebase.db, selectedTicketsPath.value);

            // Lấy dữ liệu hiện tại
            const snapshot = await new Promise((resolve: any) => {
                $firebase.onValue(
                    ticketsRef,
                    (snap: any) => {
                        resolve(snap);
                        $firebase.off(ticketsRef);
                    },
                    () => resolve(null)
                );
            });

            if (snapshot && typeof (snapshot as any).exists === "function" && (snapshot as any).exists()) {
                const data = (snapshot as any).val();
                const existingTickets = data.tickets || [];

                // ✅ Xóa chỉ vé của user này, giữ vé của user khác
                const filteredTickets = existingTickets.filter(
                    (t: any) => t.selected_by_id !== useUserStore.id
                );

                // ✅ Nếu không còn vé nào, xóa path
                if (filteredTickets.length === 0) {
                    await $firebase.remove(ticketsRef);
                    console.log("✅ No tickets left, removed path from Firebase");
                } else {
                    await $firebase.set(ticketsRef, {
                        tickets: filteredTickets,
                        count: filteredTickets.length,
                        lastUpdated: new Date().toISOString(),
                    });
                    console.log("✅ Cleared tickets for current user only");
                }
            }

            return true;
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Clear failed";
            console.error("❌ Error clearing Firebase tickets:", error);
            syncError.value = errorMsg;
            throw error;
        } finally {
            isSyncing.value = false;
        }
    };

    // ✅ Xóa ticket cụ thể khỏi Firebase và cleanup nếu không còn vé
    const deleteTicketFromFirebase = async (ticketId: string | number | undefined) => {
        if (ticketId === undefined || ticketId === null || ticketId === "") {
            throw new Error("Ticket ID không hợp lệ");
        }

        try {
            isSyncing.value = true;
            syncError.value = null;

            if (!selectedTicketsPath.value) {
                throw new Error("Firebase path không hợp lệ");
            }

            const ticketsRef = $firebase.ref($firebase.db, selectedTicketsPath.value);

            // Lấy dữ liệu hiện tại
            const snapshot = await new Promise((resolve: any) => {
                $firebase.onValue(
                    ticketsRef,
                    (snap: any) => {
                        resolve(snap);
                        $firebase.off(ticketsRef);
                    },
                    () => resolve(null)
                );
            });

            if (snapshot && typeof (snapshot as any).exists === "function" && (snapshot as any).exists()) {
                const data = (snapshot as any).val();
                const existingTickets = data.tickets || [];

                // ✅ Lọc bỏ ticket có id tương ứng (convert về cùng kiểu)
                const filteredTickets = existingTickets.filter(
                    (t: any) => String(t.id) !== String(ticketId)
                );

                console.log("✅ Filtered tickets:", filteredTickets);

                // ✅ Nếu không còn vé nào, xóa luôn path
                if (filteredTickets.length === 0) {
                    await $firebase.remove(ticketsRef);
                    console.log("✅ No tickets left, removed path from Firebase");
                } else {
                    // Nếu còn vé, cập nhật lại
                    await $firebase.set(ticketsRef, {
                        tickets: filteredTickets,
                        count: filteredTickets.length,
                        lastUpdated: new Date().toISOString(),
                    });
                    console.log("✅ Updated tickets in Firebase");
                }

                console.log("✅ Deleted ticket from Firebase:", ticketId);
            }

            return true;
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Delete failed";
            console.error("❌ Error deleting ticket from Firebase:", error);
            syncError.value = errorMsg;
            throw error;
        } finally {
            isSyncing.value = false;
        }
    };

    return {
        isSyncing,
        syncError,
        syncLocalTicketsToFirebase,
        listenToFirebaseTickets,
        clearFirebaseTickets,
        deleteTicketFromFirebase,
    };
};