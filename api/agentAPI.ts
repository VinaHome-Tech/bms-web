import type { AgentNameType, AgentType, DTO_RQ_Agent } from "~/types/agentType";
import type { ApiResponse } from "./APIResponse";
import type { UserActionType } from "~/types/userType";

export const createAgent = async (
  user: UserActionType,
  data_create: DTO_RQ_Agent
): Promise<ApiResponse<AgentType>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<AgentType>>(
      `${apiGateWay}/v3/bus-agent/create-agent-account`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookie.value}`,
        },
        body: {
          user,
          data_create,
        },
      }
    );
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};

export const getListAgentByCompany = async (
  company_id: string
): Promise<ApiResponse<AgentType[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<AgentType[]>>(
      `${apiGateWay}/v3/bus-agent/get-list-agent-by-company/${company_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cookie.value}`,
        },
      }
    );
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};

export const getListAgentNameByCompany = async (
  companyId: number
): Promise<ApiResponse<AgentNameType[]>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<AgentNameType[]>>(
      `${apiGateWay}/v3/bus-agent/get-list-agent-name-by-company/${companyId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cookie.value}`,
        },
      }
    );
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};

export const updateAgent = async (
  user: UserActionType,
  data_update: DTO_RQ_Agent,
  id: string
): Promise<ApiResponse<AgentType>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<AgentType>>(
      `${apiGateWay}/v3/bus-agent/update-agent-account/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${cookie.value}`,
        },
        body: {
          user,
          data_update,
        },
      }
    );
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};

export const deleteAgent = async (
  user: UserActionType,
  id: string
): Promise<ApiResponse<void>> => {
  const config = useRuntimeConfig();
  const apiGateWay = config.public.apiGateWay;
  const cookie = useCookie("access_token");
  try {
    return await $fetch<ApiResponse<void>>(
      `${apiGateWay}/v3/bus-agent/delete-agent-account/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${cookie.value}`,
        },
        body: {
          user,
        },
      }
    );
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};
