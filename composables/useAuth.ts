import { logout } from "~/api/identity-service/auth/bms_auth";


export const useAuth = () => {
    const useUserStore = userStore();
    const officeStore = useOfficeStore();
    const handleManualLogout = async (): Promise<void> => {
        try {
            const cookie_access_token = useCookie('access_token');
            const response = await logout(cookie_access_token.value ?? '');
            if (response.success) {
                notifySuccess('Đăng xuất thành công!');
            }
        } catch (error) {
            console.error('Logout API error:', error);
            notifyWarning('Đăng xuất thành công!');
        } finally {
            useUserStore.resetUserInfo();
            officeStore.resetOfficeStore();
            await navigateTo('/');
        }
    };
    return {
        handleManualLogout,
    };
}