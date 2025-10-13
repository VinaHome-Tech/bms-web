export interface ConfigPointInRoute {
  id?: number
  config_name?: string
  route_id?: number
  seat_chart_id?: number[]
  trip_type: number
  priority: boolean;
  double_room: boolean;
  same_price: boolean;
  date_range?: [Date, Date]
  fare_configs?: {
    id?: number;
    departure_point_id?: number[];
    arrival_point_id?: number[];
    single_room_price?: number;
    double_room_price?: number;
  }[]
}

export interface DTO_RP_GroupPointName {
    id: number;
    province_name: string;
    points: DTO_RP_ItemPointName[];
}
export interface DTO_RP_ItemPointName {
    id: number;
    name: string;
}
