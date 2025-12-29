export interface Schedule {
    id: string;
    start_time: string;
    start_date: Date;
    end_date: Date;
    weekdays: string[];
    repeat_type: boolean;
    odd_even_type: boolean;
    is_known_end_date: boolean;
    trip_type: number;
    route: {
        id: string;
        route_name: string;
    }
    seat_chart: {
        id: string;
        seat_chart_name: string;
    };
    created_at: Date;
    updated_at: Date;
}

export interface DTO_RQ_Schedule {
    id?: string;
    route_id?: string;
    seat_chart_id?: string;
    start_time?: string;
    trip_type?: number;
    repeat_type?: boolean;
    weekdays?: string[];
    odd_even_type?: boolean;
    is_known_end_date?: boolean;
    start_date?: Date;
    end_date?: Date;
}
    