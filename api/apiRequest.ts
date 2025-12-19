// import type { ApiResponse } from './api-response';

// export const apiRequest = async <T>(
//   url: string,
//   options: {
//     method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
//     body?: Record<string, unknown> | unknown[];
//     headers?: Record<string, string>;
//     requireAuth?: boolean;
//   } = {}
// ): Promise<ApiResponse<T>> => {
//   const config = useRuntimeConfig();
//   const apiGateWay = config.public.apiGateWay;
// //   const { ensureValidToken } = useTokenManager();
//   const useUserStore = userStore();
  
//   const {
//     method = 'GET',
//     body,
//     headers = {},
//     requireAuth = true
//   } = options;

//   // Kiểm tra và refresh token nếu cần
//   if (requireAuth) {
//     // const isValid = await ensureValidToken();
//     // if (!isValid) {
//     //   throw new Error('Authentication failed');
//     // }

//     // Thêm Authorization header
//     if (useUserStore.access_token) {
//       headers['Authorization'] = `Bearer ${useUserStore.access_token}`;
//     }
//   }

//   try {
//     const response = await $fetch<ApiResponse<T>>(`${apiGateWay}${url}`, {
//       method,
//       body,
//       headers,
//     });

//     return response;
//   } catch (error: unknown) {
//     // Xử lý lỗi 401
//     if (typeof error === 'object' && error !== null) {
//       const errorObj = error as { status?: number; response?: { status?: number } };
      
//       if (errorObj.status === 401 || errorObj.response?.status === 401) {
//         // const { handleTokenExpiredLogout } = useTokenManager();
//         //await handleTokenExpiredLogout();
//       }
//     }
    
//     console.error('API request error:', error);
//     throw error;
//   }
// };
