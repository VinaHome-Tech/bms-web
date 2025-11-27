export interface CommissionAgent {
    ticket_type: '%' | 'VND';
    ticket_value: number;
    goods_type: '%' | 'VND';
    goods_value: number;
}
export interface Agent {
    id?: number;
    username?: string;
    password?: string;
    phone?: string;
    email?: string;
    name?: string;
    address?: string;
    status?: boolean;
    commission: CommissionAgent;
}