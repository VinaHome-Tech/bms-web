import { API_LogoutBMS } from "~/services/identity-service/auth/bms-auth.api";



export const useAuth = () => {
    const useUserStore = userStore();
    const useOfficeStore = officeStore();
    const handleManualLogout = async (): Promise<void> => {
        try {
            const cookie_access_token = useCookie('access_token');
            const response = await API_LogoutBMS(useUserStore.id || '');
            if (response.success) {
                notifySuccess('Đăng xuất thành công!');
            }
        } catch (error) {
            console.error('Logout API error:', error);
            notifyWarning('Đăng xuất thành công!');
        } finally {
            useUserStore.resetUserInfo();
            useOfficeStore.resetOfficeStore();
            await navigateTo('/');
        }
    };
    return {
        handleManualLogout,
    };
}