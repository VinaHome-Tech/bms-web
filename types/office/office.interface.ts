export interface OfficeRoomWork {
    id: number | null;
    name: string | null;
    address: string | null;
    status: boolean;
    phones: OfficePhoneType[];
}
export interface OfficePhoneType {
    id?: number;
    phone?: string;
    type?: string;
}

export interface Office {
    id?: number;
    name?: string;
    code?: string;
    address?: string;
    note?: string;
    status?: boolean;
    created_at?: Date;
    phones?: OfficePhoneType[];
}

export interface DTO_RQ_Office {
    id?: number;
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