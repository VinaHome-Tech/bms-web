export interface AcceptApp {
    bms?: boolean;
    cms?: boolean;
    ams?: boolean;
    driver?: boolean;
}
export interface Account {
    id?: string;
    username?: string;
    phone?: string;
    email?: string;
    name?: string;
    address?: string;
    date_of_birth?: Date;
    gender?: number;
    role?: string;
    status?: boolean;
    created_at?: string;
    updated_at?: string;
    accept_bms?: boolean;
    accept_cms?: boolean;
    accept_ams?: boolean;
    accept_driver?: boolean;
}

export interface DTO_RQ_Account {
    id?: string;
    username?: string;
    phone?: string;
    email?: string;
    name?: string;
    address?: string;
    date_of_birth?: Date;
    gender?: number;
    role?: string;
    status?: boolean;
    password?: string;
    accept_bms?: boolean;
    accept_cms?: boolean;
    accept_ams?: boolean;
    accept_driver?: boolean;
}

export interface Driver {
    id?: string;
    name?: string;
    phone?: string;
}

export interface Assistant {
    id: string;
    name?: string;
    phone?: string;
}

export interface AccountInfo {
    id?: string;
    username?: string;
    phone?: string;
    email?: string;
    name?: string;
    address?: string;
    date_of_birth?: Date;
    gender?: number;
}
export interface ChangePassword {
    old_password?: string;
    new_password?: string;
}
export interface DTO_RQ_ChangePassword {
    new_password?: string;
    confirm_password?: string;
}

