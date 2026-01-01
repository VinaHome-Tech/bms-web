export interface Trip {
    id?: string;
    start_time?: string;
    start_date?: Date;
    route?: {
        id: string;
        route_name: string;
    }
    seat_chart: {
        id: string;
        seat_chart_name: string;
    }
    vehicle?: {
        id: string;
        license_plate: string;
        phone: string;
    }
    driver?: {
        id: string;
        name: string;
        phone: string;
    }[]
    assistant?: {
        id: string;
        name: string;
        phone: string;
    }[]
    note?: string;
    confirmation_depart?: boolean;
    trip_type?: number;
    total_seat: number;
    ticket_booked: number;
    total_price: number;
    money_paid: number;
}

export interface DTO_RQ_ChangeTimeTrip {
  id: string;
  start_time: string;
}

export interface DTO_RQ_UpdateTrip {
    id?: string;
    start_time?: string;
    note?: string;
    vehicle?: {
        id: string;
        license_plate: string;
        phone: string;
    };
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
}