export interface Agent {
    id?: string;
    username?: string;
    password?: string;
    phone?: string;
    email?: string;
    name?: string;
    address?: string;
    status?: boolean;
    ticket_type?: boolean; // '%' | 'VND'
    ticket_value?: number;
    goods_type?: boolean; // '%' | 'VND'
    goods_value?: number;
}

export interface DTO_RQ_Agent {
    id?: string;
    username?: string;
    password?: string;
    phone?: string;
    email?: string;
    name?: string;
    address?: string;
    status?: boolean;
    ticket_type?: boolean; // '%' | 'VND'
    ticket_value?: number;
    goods_type?: boolean; // '%' | 'VND'
    goods_value?: number;
}