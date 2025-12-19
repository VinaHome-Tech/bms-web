// import type { AssistantType, DriverType, DTO_RQ_Employee, EmployeeType } from "~/types/employeeType";
// import type { ApiResponse } from "./APIResponse";
// import type { UserActionType } from "~/types/userType";
// import type { AccountSettingType, ChangePasswordStaffType, ChangePasswordType } from "~/types/accountType";

// export const createEmployee = async (user: UserActionType, data_create: DTO_RQ_Employee): Promise<ApiResponse<EmployeeType>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
//   const cookie = useCookie('access_token');
//   try {
//     return await $fetch<ApiResponse<EmployeeType>>(`${apiGateWay}/v3/bus-account/create-employee-account`, {
//       method: "POST",
//       headers: {
//         'Authorization': `Bearer ${cookie.value}`,
//       },
//       body: {
//         user,
//         data_create
//       }
//     });
//   } catch (error) {
//     console.error("API error:", error);
//     throw error;
//   }
// }

// export const updateEmployee = async (user: UserActionType, data_update: DTO_RQ_Employee, id: string): Promise<ApiResponse<EmployeeType>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
//   const cookie = useCookie('access_token');
//   try {
//     return await $fetch<ApiResponse<EmployeeType>>(`${apiGateWay}/v3/bus-account/update-employee-account/${id}`, {
//       method: "PUT",
//       headers: {
//         'Authorization': `Bearer ${cookie.value}`,
//       },
//       body: {
//         user,
//         data_update
//       }
//     });
//   } catch (error) {
//     console.error("API error:", error);
//     throw error;
//   }
// }

// export const deleteEmployee = async (user: UserActionType, id: string): Promise<ApiResponse<void>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
//   const cookie = useCookie('access_token');
//   try {
//     return await $fetch<ApiResponse<void>>(`${apiGateWay}/v3/bus-account/delete-employee-account/${id}`, {
//       method: "DELETE",
//       headers: {
//         'Authorization': `Bearer ${cookie.value}`
//       },
//       body: {
//         user
//       }
//     });
//   } catch (error) {
//     console.error("API error:", error);
//     throw error;
//   }
// }

// export const getListEmployeeByCompany = async (company_id: string): Promise<ApiResponse<EmployeeType[]>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
//   const cookie = useCookie('access_token');
//   try {
//     return await $fetch<ApiResponse<EmployeeType[]>>(`${apiGateWay}/v3/bus-account/get-list-account-employee-by-company/${company_id}`, {
//       method: "GET",
//       headers: {
//         'Authorization': `Bearer ${cookie.value}`,
//       }
//     });
//   } catch (error) {
//     console.error("API error:", error);
//     throw error;
//   }
// }

// export const getListDriverByCompany = async (id: string): Promise<ApiResponse<DriverType[]>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
//   const cookie = useCookie('access_token');
//   try {
//     return await $fetch<ApiResponse<DriverType[]>>(`${apiGateWay}/v3/bus-account/get-list-driver-by-company/${id}`, {
//       method: "GET",
//       headers: {
//         'Authorization': `Bearer ${cookie.value}`,
//       }
//     });
//   } catch (error) {
//     console.error("API error:", error);
//     throw error;
//   }
// }

// export const getListAssistantByCompany = async (id: string): Promise<ApiResponse<AssistantType[]>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
//   const cookie = useCookie('access_token');
//   try {
//     return await $fetch<ApiResponse<AssistantType[]>>(`${apiGateWay}/v3/bus-account/get-list-assistant-by-company/${id}`, {
//       method: "GET",
//       headers: {
//         'Authorization': `Bearer ${cookie.value}`,
//       }
//     });
//   } catch (error) {
//     console.error("API error:", error);
//     throw error;
//   }
// }

// export const getInfomationUserById = async (id: string): Promise<ApiResponse<AccountSettingType>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
//   const cookie = useCookie('access_token');
//   try {
//     return await $fetch<ApiResponse<AccountSettingType>>(`${apiGateWay}/v3/bus-account/get-user-info-bms/${id}`, {
//       method: "GET",
//       headers: {
//         'Authorization': `Bearer ${cookie.value}`,
//       }
//     });
//   } catch (error) {
//     console.error("API error:", error);
//     throw error;
//   }
// }

// export const updateInfomationUserById = async (id: string, data_update: AccountSettingType): Promise<ApiResponse<AccountSettingType>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
//   const cookie = useCookie('access_token');
//   try {
//     return await $fetch<ApiResponse<AccountSettingType>>(`${apiGateWay}/v3/bus-account/update-user-info-bms/${id}`, {
//       method: "PUT",
//       headers: {
//         'Authorization': `Bearer ${cookie.value}`,
//       },
//       body: data_update
//     });
//   } catch (error) {
//     console.error("API error:", error);
//     throw error;
//   }
// }

// export const changePasswordApi = async (data: ChangePasswordType): Promise<ApiResponse<void>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
//   const cookie = useCookie('access_token');
//   try {
//     return await $fetch<ApiResponse<void>>(`${apiGateWay}/v3/bus-account/change-password`, {
//       method: "POST",
//       body: data,
//       headers: {
//         'Authorization': `Bearer ${cookie.value}`
//       }
//     });
//   } catch (error) {
//     console.error('API error:', error);
//     throw error;
//   }
// }

// export const changePasswordStaff = async (data: ChangePasswordStaffType): Promise<ApiResponse<void>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
//   const cookie = useCookie('access_token');
//   try {
//     return await $fetch<ApiResponse<void>>(`${apiGateWay}/v3/bus-account/change-password-staff`, {
//       method: "POST",
//       body: data,
//       headers: {
//         'Authorization': `Bearer ${cookie.value}`
//       }
//     });
//   } catch (error) {
//     console.error('API error:', error);
//     throw error;
//   }
// }