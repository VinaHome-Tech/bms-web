export interface Vehicle {
    id?: number;
    license_plate?: string;
    engine_number?: string;
    frame_number?: string;
    status?: number;
    color?: string;
    brand?: string;
    phone?: string;
    registration_expiry?: Date;
    maintenance_due?: Date;
}
export interface DTO_RQ_Vehicle {
    id?: number;
    license_plate?: string;
    engine_number?: string;
    frame_number?: string;
    status?: number;
    color?: string;
    brand?: string;
    phone?: string;
    registration_expiry?: Date;
    maintenance_due?: Date;
}