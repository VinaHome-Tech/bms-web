import type { ApiResponse } from "~/services/api-response"
import type { DTO_RQ_Schedule, Schedule } from "~/types/schedule/schedule.interface"

// M5_v2.F1
export const API_GetListScheduleByCompanyId = async (company_id: string): Promise<ApiResponse<Schedule[]>> =>{
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<Schedule[]>>(`${config.public.apiGateWay}/v2/bms-schedule/companies/${company_id}/schedules`, {
        method: "GET",
    })
}
// M5_v2.F2
export const API_CreateSchedule = async (company_id: string, data: DTO_RQ_Schedule): Promise<ApiResponse<Schedule>> =>{
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<Schedule>>(`${config.public.apiGateWay}/v2/bms-schedule/companies/${company_id}/schedules`, {
        method: "POST",
        body: data,
    })
}
// M5_v2.F3
export const API_UpdateSchedule = async (schedule_id: string, data: DTO_RQ_Schedule): Promise<ApiResponse<Schedule>> =>{
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<Schedule>>(`${config.public.apiGateWay}/v2/bms-schedule/${schedule_id}`, {
        method: "PUT",
        body: data,
    })
}
// M5_v2.F4
export const API_DeleteSchedule = async (schedule_id: string): Promise<ApiResponse<null>> =>{
    const { $apiFetch } = useNuxtApp()
    const config = useRuntimeConfig()
    return await $apiFetch<ApiResponse<null>>(`${config.public.apiGateWay}/v2/bms-schedule/${schedule_id}`, {
        method: "DELETE",
    })
}