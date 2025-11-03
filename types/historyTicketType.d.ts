export interface DTO_RP_HistoryTicket {
  id: number;
  act: string;
  created_at: string;
  act_by_full_name: string;
  act_by_office_name: string;
  ticket_phone: string;
  ticket_email: string;
  ticket_customer_name: string;
  ticket_point_up: string;
  ticket_point_down: string;
  ticket_note: string;
  ticket_display_price: number;
  payment_method: string;
  transit_up: boolean;
  transit_down: boolean;
  seat_name: string;
  contact_status: number;
  
}