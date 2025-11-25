export interface AcceptApp {
    bms?: boolean;
    cms?: boolean;
    ams?: boolean;
    driver?: boolean;
}
export interface Account {
    id?: number;
    username?: string;
    password?: string;
    phone?: string;
    email?: string;
    name?: string;
    address?: string;
    date_of_birth?: Date;
    gender?: number;
    role?: string;
    status?: boolean;
    accept_app?: AcceptApp;
}

export interface Driver {
    id: string;
    name: string;
    phone: string;
}

export interface Assistant {
    id: string;
    name: string;
    phone: string;
}

