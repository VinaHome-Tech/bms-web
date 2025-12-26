import type { Route } from "~/types/route/route.interface";

export const valueSelectedRoute = ref<string | undefined>(undefined)

export const valueSelectedDate = ref<string | Date | undefined>(undefined);

export const routeList = ref<Route[]>([]);