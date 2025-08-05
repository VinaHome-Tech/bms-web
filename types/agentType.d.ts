export interface AgentType {
  id: string | null;
  name: string | null;
  code: string | null;
  phone: string | null;
  note: string | null;
  address: string | null;
  username: string | null;
  password: string | null;
  status: boolean;
  email: string | null;
  discount_ticket_type: string;
  discount_ticket_value: number;
  discount_goods_type: string;
  discount_goods_value: number;
}

export interface DTO_RQ_Agent {
  name: string | null;
  code: string | null;
  phone: string | null;
  note: string | null;
  address: string | null;
  username: string | null;
  password: string | null;
  status: boolean;
  email: string | null;
  discount_ticket_type: string;
  discount_ticket_value: number;
  discount_goods_type: string;
  discount_goods_value: number;
}

export interface AgentNameType {
  id: string;
  name: string;
}
