import { API_RefreshToken } from "~/services/identity-service/auth/bms-auth.api";

let refreshTimer: NodeJS.Timeout | null = null;

export function scheduleTokenRefresh(expiresIn: number) {
  if (refreshTimer) clearTimeout(refreshTimer);

  expiresIn = Number(expiresIn);

  if (!expiresIn || isNaN(expiresIn) || expiresIn <= 30) {
    console.warn("⚠ expiresIn quá nhỏ hoặc không hợp lệ:", expiresIn);
    return;
  }

  const refreshTime = (expiresIn - 30) * 1000;

  refreshTimer = setTimeout(() => {
    refreshNow();
  }, refreshTime);

  console.log(`🔁 Refresh sẽ chạy sau ${Math.floor(refreshTime / 1000)} giây`);
}

export async function refreshNow(): Promise<boolean> {
  // Multi-tab lock
  if (localStorage.getItem("refresh_lock") === "true") {
    console.log("⛔ Tab khác đang refresh → bỏ qua");
    return false;
  }
  localStorage.setItem("refresh_lock", "true");

  try {
    const cookie_refresh_token = useCookie("refresh_token");
    if (!cookie_refresh_token.value) {
      console.warn("⚠ Không có refresh_token");
      localStorage.setItem("refresh_lock", "false");
      return false;
    }

    const response = await API_RefreshToken(cookie_refresh_token.value);

    if (response.success && response.result?.access_token) {
      const store = userStore();

      const cookie_access = useCookie("access_token");
      cookie_access.value = response.result.access_token;

      store.setUserInfo({
        ...store.$state,
        access_token: response.result.access_token,
        expires_in: response.result.expires_in,
      });

      scheduleTokenRefresh(response.result.expires_in);

      console.log("✅ Refresh token thành công");
      localStorage.setItem("refresh_lock", "false");
      return true;
    }
  } catch (err) {
    console.error("❌ Refresh token lỗi:", err);
  }

  // Unlock trước khi logout
  localStorage.setItem("refresh_lock", "false");

  if (refreshTimer) clearTimeout(refreshTimer);

  const store = userStore();
  store.resetUserInfo();
  navigateTo("/");
  return false;
}
