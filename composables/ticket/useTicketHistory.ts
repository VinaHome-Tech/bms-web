import { API_GetHistoryTicket } from "~/api/historyTicketAPI";
import type { DTO_RP_HistoryTicket } from "~/types/historyTicketType";
import type { DTO_RP_CancelTicket } from "~/types/ticketType";

export const useTicketHistory = () => {
    const dialogHistoryCancelTicket = ref(false);
    const loadingHistoryCancelTicket = ref(false);
    const dataHistoryTicketCanceled = ref<DTO_RP_HistoryTicket[]>([]);

    const handleCopyTicketCanceled = async (ticket: DTO_RP_CancelTicket) => {
        console.log("Sao chép vé huỷ:", ticket);
    };

    const handleShowHistoryTicketCanceled = async (ticket: DTO_RP_CancelTicket) => {
        dialogHistoryCancelTicket.value = true;
        loadingHistoryCancelTicket.value = true;
        console.log("Xem lịch sử vé huỷ:", ticket);
        try {
            const response = await API_GetHistoryTicket(ticket.ticket_code);
            if (response.success) {
                if (response.result) {
                    console.log("Lịch sử vé huỷ:", response.result);
                    dataHistoryTicketCanceled.value = response.result;
                }
            } else {
                console.error(response.message || "Không thể tải lịch sử vé huỷ!");
                notifyError(response.message || "Không thể tải lịch sử vé huỷ!");
            }
        } catch (error) {
            console.error("Lỗi khi tải lịch sử vé huỷ:", error);
            notifyError("Lỗi khi tải lịch sử vé huỷ!");
        } finally {
            loadingHistoryCancelTicket.value = false;
        }
    };

    return {
        handleCopyTicketCanceled,
        handleShowHistoryTicketCanceled,
        dialogHistoryCancelTicket,
        loadingHistoryCancelTicket,
        dataHistoryTicketCanceled,
    }
}