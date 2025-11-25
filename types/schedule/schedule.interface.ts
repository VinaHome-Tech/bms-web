export interface Schedule {
    id?: number;
    start_date?: Date;
    end_date?: Date;
    route_id?: number;
    route_name?: string;
    seat_chart_name?: string;
    seat_chart_id?: number;
    start_time?: string;
    trip_type?: number;
    repeat_type?: string;
    weekdays?: string[];
    odd_even_type?: string;
    is_known_end_date?: boolean;
}