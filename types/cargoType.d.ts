export interface CargoType {
    id: number | null;

    sender_phone: string | null;
    sender_name: string | null;
    sender_cccd: string | null;
    sender_shipping_method: string;
    pickup_point: string | null;

    receiver_phone: string | null;
    receiver_name: string | null;
    receiver_cccd: string | null;
    receiver_delivery_method: string;
    dropoff_point: string | null;

    cargo_name: string | null;
    cargo_note: string | null;
    cargo_quantity: number;

    shipping_fee: number;
    amount_paid: number;
    total_amount: number;
    remaining_amount: number;
}