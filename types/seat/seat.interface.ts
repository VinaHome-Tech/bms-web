export interface Seat {
    id?: number;
    name?: string;
    code?: string;
    status?: boolean;
    floor?: number;
    row?: number;
    column?: number;
}
export interface SeatChart {
    id?: number;
    seat_chart_name?: string;
    seat_chart_type?: number;
    total_floor?: number;  
    total_row?: number;
    total_column?: number;
    total_seat?: number;
    seats?: Seat[];
}
export interface SeatChartName {
    id: number;
    seat_chart_name: string;
}