export interface TicketItem {
    id?: number;
    seat_status?: boolean;
    seat_code?: string;
    seat_name?: string;
    seat_floor?: number;
    seat_row?: number;
    seat_column?: number;
    /// Price
    base_price?: number;
    total_price?: number;
    surcharge?: number;
    money_paid?: number;
    payment_method?: string;
    /// Customer
    name?: string;
    email?: string;
    phone?: string;
    date_of_birth?: Date;
    gender?: number;
    note?: string;
    /// Point
    point_up?: string;
    time_up?: string;
    point_down?: string;
    time_down?: string;
    transit_up?: boolean;
    transit_down?: boolean;
    /// User
    user_id?: string;
    user_name?: string;
    office_id?: number;
    office_name?: string;

    /// Other
    booked_status?: boolean;
    contact_status?: number;
    ticket_code?: string;
    trip_id?: number;

    selected?: boolean;
    selectedBy?: string;
    selected_by_id?: string;
}

export interface Ticket {
    id: string;
    seat?: {
        code: string;
        name: string;
        floor: number;
        row: number;
        column: number;
        status: boolean;
    }
    customer?: {
        name: string;
        email: string;
        phone: string;
        date_of_birth: Date;
        gender: number;
        note: string;
    };
    point?: {
        point_up: string;
        time_up: string;
        point_down: string;
        time_down: string;
        transit_up: boolean;
        transit_down: boolean;
    };
    user_created?: {
        id: string;
        name: string;
    };
    office_created?: {
        id: string;
        name: string;
    };
    price?: {
        total_price: number;
        surcharge: number;
        money_paid: number;
        payment_method: string;
    };
    contact_status?: number;
    ticket_note?: string;
    booked_status?: boolean;
}

export interface DTO_RQ_Ticket {
    ticket_ids?: string[];
    customer?: {
        name?: string;
        email?: string;
        phone?: string;
        date_of_birth?: Date;
        gender?: number;
        note?: string;
    };
    point?: {
        point_up?: string;
        time_up?: string;
        point_down?: string;
        time_down?: string;
        transit_up?: boolean;
        transit_down?: boolean;
    };
    user_created?: {
        id?: string;
        name?: string;
    };
    office_created?: {
        id?: string;
        name?: string;
    };
    user_updated?: {
        id?: string;
        name?: string;
    };
    office_updated?: {
        id?: string;
        name?: string;
    };
    price?: {
        total_price?: number;
        surcharge?: number;
        money_paid?: number;
        payment_method?: string;
    };
    ticket_note?: string;
}
export interface LockedSeat {
    seatName?: string
    userId?: string | null
    userName?: string | null
}