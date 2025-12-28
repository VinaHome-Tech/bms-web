import type { Route, RouteName } from "~/types/route/route.interface";

export const valueSelectedRoute = ref<string | undefined>(undefined)

export const valueSelectedDate = ref<string | Date | undefined>(undefined);

export const routeList = ref<Route[]>([]);
export const routeNameList = ref<RouteName[]>([]);