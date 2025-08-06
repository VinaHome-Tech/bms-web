
export interface TicketType {
  id: number;
  seat_name: string;
  seat_status: boolean;
  seat_floor: number;
  seat_row: number;
  seat_column: number;
  seat_type: number;
  seat_code: string;
  booked_status: boolean;
  ticket_phone: string;
  ticket_email: string;
  ticket_customer_name: string;
  ticket_point_up: string;
  ticket_point_down: string;
  ticket_note: string;
  ticket_display_price: number;
  payment_method: string;
  user_created: string; 
  user_id_created: string;
  office_created: string;
  office_id?: number | null;
  transit_up?: boolean;
  transit_down?: boolean;

  selectedBy?: string;
  contact_status: number;
  agent_id?: string;
}

export interface IsSelectTicketType {
  id: number;
  username: string;
}

export interface UserChooserTicketType {
  id: string,
  full_name: string;
  office_name: string;
  office_id: number;
}

export interface DTO_RQ_UpdateTicket {
  id: number[];
  ticket_phone: string;
  ticket_email: string;
  ticket_customer_name: string;
  ticket_point_up: string;
  ticket_point_down: string;
  ticket_note: string;
  ticket_display_price: number;
  payment_method: string;
  office_id: number | null;
  agent_id?: string;
  transit_up: boolean;
  transit_down: boolean;
  
}

export interface CancelTicketType {
  id: number[];
}

export interface CopyTicketType {
  id: number;
  booked_status: boolean;
  ticket_phone: string;
  ticket_email: string;
  ticket_customer_name: string;
  ticket_point_up: string;
  ticket_point_down: string;
  ticket_note: string;
  ticket_display_price: number;
  payment_method: string;
}

export interface MoveTicketType {
  id: number;
  booked_status: boolean;
  ticket_phone: string;
  ticket_email: string;
  ticket_customer_name: string;
  ticket_point_up: string;
  ticket_point_down: string;
  ticket_note: string;
  ticket_display_price: number;
  payment_method: string;
  office_id: number;
  user_id_created: string;
  user_created: string;
}

export interface DTO_RP_ListCustomerByTrip {
  id: number;
  ticket_phone: string;
  ticket_customer_name: string;
  user_created: string;
  ticket_note: string;
  ticket_display_price: number;
  ticket_point_up: string;
  ticket_point_down: string;
  payment_method: string;
  seat_name: string;
}

export interface DTO_RP_ListTransitUpByTrip {
  id: number;
  ticket_phone: string;
  ticket_customer_name: string;
  user_created: string;
  ticket_note: string;
  ticket_display_price: number;
  ticket_point_up: string;
  seat_name: string;
}

export interface DTO_RP_ListTransitDownByTrip {
  id: number;
  ticket_phone: string;
  ticket_customer_name: string;
  user_created: string;
  ticket_note: string;
  ticket_display_price: number;
  ticket_point_down: string;
  seat_name: string;
}

export class DTO_RP_SearchTicket {
  ticket_id: number;
  trip_id: number;
  route_id: number;
  route_name: string;
  departure_date: Date;
  departure_time: string;
  seat_name: string;
  ticket_phone: string;
  ticket_customer_name: string;
  ticket_display_price: number;
}