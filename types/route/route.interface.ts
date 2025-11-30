export interface Route {
    id?: number;
    base_price?: number;
    distance?: number;
    e_ticket_price?: number;
    journey?: string;
    note?: string;
    route_name?: string;
    route_name_e_ticket?: string;
    short_name?: string;
    status?: boolean;
    display_order?: number;
}
export interface RouteName {
    id: string;
    route_name: string;
}
export interface DTO_RouteNameToConfig {
  id?: string;
  route_name?: string;
  base_price?: number;
}