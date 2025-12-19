import type { ApiResponse } from "~/services/api-response"
import type { Agent } from "~/types/account/agent.interface"

// M2_v1.F6
export const API_CreateAgentAccount = async (company_id: string, data: Agent): Promise<ApiResponse<Agent>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig() 
  return await $apiFetch<ApiResponse<Agent>>(`${config.public.apiGateWay}/v1/bms-agent/companies/${company_id}/agents`, {
    method: "POST",
    body: data,
  })
}

// M2_v1.F7
export const API_GetListAgentByCompanyId = async (company_id: string): Promise<ApiResponse<Agent[]>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig() 
  return await $apiFetch<ApiResponse<Agent[]>>(`${config.public.apiGateWay}/v1/bms-agent/companies/${company_id}/agents`, {
    method: "GET",
  })
}

// M2_v1.F9
export const API_DeleteAgent = async (agent_id: number): Promise<ApiResponse<null>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig() 
  return await $apiFetch<ApiResponse<null>>(`${config.public.apiGateWay}/v1/bms-agent/${agent_id}`, {
    method: "DELETE",
  })
}

// M2_v1.F8
export const API_UpdateAgentAccount = async (agent_id: number, data: Agent): Promise<ApiResponse<Agent>> => {
  const { $apiFetch } = useNuxtApp()
  const config = useRuntimeConfig() 
  return await $apiFetch<ApiResponse<Agent>>(`${config.public.apiGateWay}/v1/bms-agent/${agent_id}`, {
    method: "PUT",
    body: data,
  })
}