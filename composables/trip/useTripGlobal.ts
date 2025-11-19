import type { TripItem } from "~/types/trip/trip.interface";

export const valueSelectedTrip = ref<TripItem | null>(null);
export const listItemTrip = ref<TripItem[]>([]);