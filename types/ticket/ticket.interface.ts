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
}

export interface DTO_RQ_Ticket {
    // price
    total_price?: number
    money_paid?: number
    surcharge?: number
    payment_method?: string

    // customer
    name?: string
    email?: string
    phone?: string
    date_of_birth?: string
    gender?: number
    note?: string
    // point
    point_up?: string
    point_down?: string
    transit_up?: boolean
    transit_down?: boolean
}