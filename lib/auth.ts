import { refreshToken } from "~/api/authAPI"


let refreshTimer: NodeJS.Timeout | null = null

/**
 * Đặt lịch refresh token
 */
export function scheduleTokenRefresh(expiresIn: number) {
  if (refreshTimer) clearTimeout(refreshTimer)

  // Tránh refresh liên tục nếu expiresIn quá nhỏ
  if (!expiresIn || expiresIn <= 30) {
    console.warn("⚠️ expiresIn quá nhỏ, bỏ qua scheduleTokenRefresh");
    return;
  }

  const refreshTime = (expiresIn - 30) * 1000;

  refreshTimer = setTimeout(() => {
    refreshNow();
  }, refreshTime);

  console.log(`🔄 Token sẽ được refresh sau ${Math.floor(refreshTime / 1000)} giây`);
}

/**
 * Refresh token ngay lập tức
 */
export async function refreshNow(): Promise<boolean> {
  try {
    const cookie_refresh_token = useCookie("refresh_token");
    if (!cookie_refresh_token.value) {
      console.warn("⚠️ Không có refresh_token, không thể refresh");
      return false;
    }

    const response = await refreshToken(cookie_refresh_token.value);

    if (response.success && response.result?.access_token) {
      const store = userStore();
      store.setUserInfo({
        ...store.$state,
        access_token: response.result.access_token,
        expires_in: response.result.expires_in,
      });

      scheduleTokenRefresh(response.result.expires_in);
      console.log("✅ Refresh token thành công");
      return true;
    }
  } catch (err) {
    console.error("❌ Refresh token thất bại:", err);
  }

  // ⛔ refresh fail → clear timer + logout
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  const store = userStore();
  store.resetUserInfo();
  navigateTo("/");
  return false;
}
