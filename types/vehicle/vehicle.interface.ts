export interface Vehicle {
    id?: string;
    license_plate?: string;
    engine_number?: string;
    frame_number?: string;
    status?: number;
    color?: string;
    brand?: string;
    phone?: string;
    registration_expiry?: string;
    maintenance_due?: string;
    note?: string;
    created_at?: string;
    updated_at?: string;
}
export interface DTO_RQ_Vehicle {
    id?: string;
    license_plate?: string;
    engine_number?: string;
    frame_number?: string;
    status?: number;
    color?: string;
    brand?: string;
    phone?: string;
    registration_expiry?: string;
    maintenance_due?: string;
    note?: string;
}

export interface LicensePlateVehicle {
    id: number;
    license_plate: string;
    phone?: string;
}