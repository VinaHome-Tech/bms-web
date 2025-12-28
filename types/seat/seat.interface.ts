export interface Seat {
    id?: string;
    name?: string;
    code?: string;
    status?: boolean;
    floor?: number;
    row?: number;
    column?: number;
}
export interface SeatChart {
    id?: string;
    seat_chart_name?: string;
    seat_chart_type?: number;
    total_floor?: number;  
    total_row?: number;
    total_column?: number;
    total_seat?: number;
    seats?: Seat[];
}
export interface SeatChartName {
    id: string;
    seat_chart_name: string;
}

export interface DTO_RQ_SeatChart {
    id?: string;
    seat_chart_name?: string;
    seat_chart_type?: number;
    total_floor?: number;  
    total_row?: number;
    total_column?: number;
    seats?: DTO_RQ_Seat[];
}

export interface DTO_RQ_Seat {
    id?: string;
    name?: string;
    code?: string;
    status?: boolean;
    floor?: number;
    row?: number;
    column?: number;
}