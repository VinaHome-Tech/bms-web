import type { Trip } from "~/types/trip/trip.interface";

export const valueSelectedTrip = ref<Trip | null>(null);
export const listTrip = ref<Trip[]>([]);