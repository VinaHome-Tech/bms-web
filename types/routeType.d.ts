export interface RouteType {
  id: number | null;
  route_name: string | null;
  short_name: string | null;
  route_name_e_ticket: string | null;
  base_price: number | null;
  note: string | null;
  e_ticket_price: number | null;
  status: boolean;
  display_order?: number;
  distance: number | null;
  journey: string | null;
}

export interface DTO_RQ_Route {
  route_name: string | null;
  short_name: string | null;
  route_name_e_ticket: string | null;
  base_price: number | null;
  note: string | null;
  e_ticket_price: number | null;
  status: boolean;
  distance: number | null;
  journey: string | null;
}
export interface DTO_RP_ListRouteName {
  id: number;
  route_name: string;
}

export interface DTO_RP_ListRouteNameToConfig {
  id: number;
  route_name: string;
  display_price: number;
}
