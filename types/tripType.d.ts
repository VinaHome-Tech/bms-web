import type { AssistantType, DriverType } from "./employeeType";

export interface TripType {
  trip_id: number;
  departure_date: Date;
  departure_time: string;
  seat_chart_id: number;
  seat_chart_name: string;
  route_id: number;
  route_name: string;
  trip_type: number;
  tickets_booked: number;
  total_ticket: number;

  note?: string | null;
  vehicle_id?: number | undefined;
  total_fare?: number;
  license_plate?: string | null;
  vehicle_phone?: string | null;
  driver?: DriverType[];
  assistant?: AssistantType[];
}

export interface DTO_RQ_UpdateTrip {
  trip_id: number;
  departure_time: string;
  seat_chart_id: number;
  note?: string | null;
  vehicle_id?: number | undefined;
  driver: DriverType[];
  assistant: AssistantType[];
  trip_type: number;
}


