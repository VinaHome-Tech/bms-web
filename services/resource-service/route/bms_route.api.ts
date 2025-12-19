import type { ApiResponse } from "~/services/api-response";
import type { DTO_RouteNameToConfig, Route, RouteName } from "~/types/route/route.interface";

// M2_v2.F1
export const API_GetListRouteByCompanyId = async (company_id: string): Promise<ApiResponse<Route[]>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<Route[]>>(`${config.public.apiGateWay}/v2/bms-route/companies/${company_id}/routes`, {
        method: "GET",
    })
}

// M2_v2.F2
export const API_CreateRoute = async (company_id: string, data: Route): Promise<ApiResponse<Route>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<Route>>(`${config.public.apiGateWay}/v2/bms-route/companies/${company_id}/routes`, {
        method: "POST",
        body: data,
    })
}

// M2_v2.F3
export const API_UpdateRoute = async (route_id: number, data: Route): Promise<ApiResponse<Route>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<Route>>(`${config.public.apiGateWay}/v2/bms-route/${route_id}`, {
        method: "PUT",
        body: data,
    })
}

// M2_v2.F4
export const API_DeleteRoute = async (route_id: number): Promise<ApiResponse<null>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<null>>(`${config.public.apiGateWay}/v2/bms-route/${route_id}`, {
        method: "DELETE",
    })
}

// M2_v2.F5
export const API_UpdateRouteOrder = async (company_id: string, data: {route_id: number, display_order: number}): Promise<ApiResponse<Route>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<Route>>(`${config.public.apiGateWay}/v2/bms-route/companies/${company_id}/routes/update-order`, {
        method: "PUT",
        body: data,
    })
}

// M3_v2.F6
export const API_GetListRouteNameByCompanyId = async (company_id: string): Promise<ApiResponse<RouteName[]>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<RouteName[]>>(`${config.public.apiGateWay}/v2/bms-route/companies/${company_id}/route-names`, {
        method: "GET",
    })
}

// M3_v2.F7
export const API_GetListRouteNameActionByCompanyId = async (company_id: string): Promise<ApiResponse<RouteName[]>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<RouteName[]>>(`${config.public.apiGateWay}/v2/bms-route/companies/${company_id}/route-names-action`, {
        method: "GET",
    })
}

export const API_GetListRouteNameToConfigByCompanyId = async (company_id: string): Promise<ApiResponse<DTO_RouteNameToConfig[]>> => {
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<DTO_RouteNameToConfig[]>>(`${config.public.apiGateWay}/v2/bms-route/companies/${company_id}/route-name-to-config`, {
        method: "GET",
    })
}  