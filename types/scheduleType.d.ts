export interface ScheduleType {
    id: number | null;
    route_id: number | null;
    seat_chart_id: number | null;
    start_time: string;
    repeat_type: string;
    weekdays: string[];
    odd_even_type: string;
    start_date: Date | null;
    end_date: Date | null;
    is_known_end_date: boolean;
    trip_type: number | null;
}

export interface DTO_RQ_Schedule {
    route_id: number | null;
    seat_chart_id: number | null;
    start_time: string;
    repeat_type: string;
    weekdays: string[];
    odd_even_type: string;
    start_date: Date | null;
    end_date: Date | null;
    is_known_end_date: boolean;
    trip_type: number | null;
}