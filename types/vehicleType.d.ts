export interface VehicleType {
    id: number | null;
    license_plate: string | null;
    engine_number: string | null;
    frame_number: string | null;
    status: number | null;
    color: string | null;
    brand: string | null;
    phone: string | null;
    registration_expiry: Date | null;
    maintenance_due: Date | null;
}
export interface LicensePlateType {
    id: number;
    license_plate: string;
}

export interface DTO_RQ_Vehicle {
    license_plate: string | null;
    engine_number: string | null;
    frame_number: string | null;
    status: number | null;
    color: string | null;
    brand: string | null;
    phone: string | null;
    registration_expiry: Date | null;
    maintenance_due: Date | null;
}