import type { CopyTicketType } from "~/types/ticketType";

export const useCopyTicketStore = defineStore("copyTicket", {
  state: () => ({
    mySelectedTickets: [] as CopyTicketType[],
  }),
  actions: {
    addTicket(ticket: CopyTicketType) {
      this.mySelectedTickets.push(ticket);
    },
    removeTicket(ticket: CopyTicketType) {
      this.mySelectedTickets = this.mySelectedTickets.filter(
        (t) => t.id !== ticket.id
      );
    },
    setTickets(tickets: CopyTicketType[]) {
      this.mySelectedTickets = tickets;
    },
  },
});
