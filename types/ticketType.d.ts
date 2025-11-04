
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
  user_created?: string;
  user_id_created?: string;
  office_created?: string;
  office_id_created?: number;
  transit_up?: boolean;
  transit_down?: boolean;
  contact_status: number;
  ticket_code?: string;

  selectedBy?: string;
  agent_id?: string;
}

export interface DTO_RP_TicketsToPrint {
  id: number;
  seat_status: boolean;
  seat_floor: number;
  seat_row: number;
  seat_column: number;

  seat_name: string;
  ticket_customer_name: string;
  ticket_phone: string;
  ticket_point_up: string;
  ticket_point_down: string;
  payment_method: string;
  ticket_display_price: number;
  ticket_note: string;
  office_created: string;
  booked_status: boolean;
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
  office_id_created: number;
  office_created: string;
  user_id_created: string;
  user_created: string;
  contact_status: number;
  transit_up: boolean;
  transit_down: boolean;
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

export interface DTO_RP_CancelTicket {
  id: number;
  seat_name: string;
  ticket_phone: string;
  ticket_email: string;
  ticket_customer_name: string;
  ticket_point_up: string;
  ticket_point_down: string;
  ticket_note: string;
  ticket_display_price: number;
  payment_method: string;
  contact_status: number;
  user_created: string;
  office_created: string;
  ticket_code: UUID;
}