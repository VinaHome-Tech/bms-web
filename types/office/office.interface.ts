export interface OfficeRoomWork {
    id: string | null;
    name: string | null;
    address: string | null;
    status: boolean;
    phones: OfficePhoneType[];
}
export interface OfficePhoneType {
    id?: string;
    phone?: string;
    type?: string;
}

export interface Office {
    id?: string;
    name?: string;
    code?: string;
    address?: string;
    note?: string;
    status?: boolean;
    created_at?: Date;
    updated_at?: Date;
    phones?: OfficePhoneType[];
}

export interface DTO_RQ_Office {
    id?: string;
    name?: string;
    code?: string;
    address?: string;
    note?: string;
    status?: boolean;
    phones?: DTO_RQ_OfficePhone[];
}
export interface DTO_RQ_OfficePhone {
    id?: number;
    phone?: string;
    type?: string;
}