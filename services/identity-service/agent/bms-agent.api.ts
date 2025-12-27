import type { ApiResponse } from "~/services/api-response"
import type { Agent, DTO_RQ_Agent } from "~/types/agent/agent.interface"

export const API_GetListAgentByCompanyId = async (company_id: string): Promise<ApiResponse<Agent[]>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig() 
  return await $apiFetch<ApiResponse<Agent[]>>(`${config.public.apiGateWay}/v1/bms-agent/companies/${company_id}/agents`, {
    method: "GET",
  })
}

export const API_UpdateAgent = async (agent_id: string, data: DTO_RQ_Agent): Promise<ApiResponse<Agent>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig() 
  return await $apiFetch<ApiResponse<Agent>>(`${config.public.apiGateWay}/v1/bms-agent/${agent_id}`, {
    method: "PUT",
    body: data,
  })
}

export const API_CreateAgent = async (company_id: string, data: DTO_RQ_Agent): Promise<ApiResponse<Agent>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig() 
  return await $apiFetch<ApiResponse<Agent>>(`${config.public.apiGateWay}/v1/bms-agent/companies/${company_id}/agents`, {
    method: "POST",
    body: data,
  })
}

export const API_DeleteAgent = async (agent_id: string): Promise<ApiResponse<null>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig() 
  return await $apiFetch<ApiResponse<null>>(`${config.public.apiGateWay}/v1/bms-agent/${agent_id}`, {
    method: "DELETE",
  })
}