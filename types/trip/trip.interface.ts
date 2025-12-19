export interface TripItem {
    id?: number;
    start_time?: string;
    start_date?: Date;
    route_id?: number;
    route_name?: string;
    seat_chart_id?: number;
    seat_chart_name?: string;
    trip_type?: number;
    vehicle_id?: number;
    vehicle_phone?: string;
    license_plate?: string;
    driver?: {
        id: string;
        name: string;
        phone: string;
    }[];
    assistant?: {
        id: string;
        name: string;
        phone: string;
    }[];
    confirmation_depart?: boolean;
    total_seat?: number;
    ticket_booked?: number;
    note?: string;
    total_price?: number;
    money_paid?: number;
}

export interface DTO_RQ_ChangeTimeTrip {
  id: string;
  start_time: string;
}