import type { MoveTicketType } from "~/types/ticketType";

export const useMoveTicketStore = defineStore("moveTicket", {
  state: () => ({
    mySelectedTickets: [] as MoveTicketType[],
  }),
  actions: {
    setTickets(tickets: MoveTicketType[]) {
      this.mySelectedTickets = tickets;
    },
    removeTicket() {
      this.mySelectedTickets = [];
    },
  },
});
