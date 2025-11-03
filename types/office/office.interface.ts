export interface OfficeRoomWork {
    id: number | null;
    name: string | null;
    address: string | null;
    status: boolean;
    phones: OfficePhoneType[];
}
export interface OfficePhoneType {
    id: number | null;
    phone: string | null;
}