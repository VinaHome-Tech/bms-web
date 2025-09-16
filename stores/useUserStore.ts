/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import type { UserBMSType } from "~/types/userType";

const LOCAL_KEY = "user_bms";

export const userStore = defineStore("user_bms", {
  state: (): UserBMSType => ({
    id: null,
    username: null,
    full_name: null,
    company_name: null,
    company_id: null,
    company_code: null,
    role: null,
    access_token: null,
    refresh_token: null,
    expires_in: null,
    expires_at: null,
  }),

  actions: {
    setUserInfo(user: UserBMSType) {
      this.id = user.id;
      this.username = user.username;
      this.full_name = user.full_name;
      this.company_name = user.company_name;
      this.company_id = user.company_id;
      this.company_code = user.company_code;
      this.role = user.role;

      this.expires_in = user.expires_in;
      this.expires_at = Date.now() + (user.expires_in ?? 0) * 1000;

      // ✅ chỉ lưu token vào cookie
      const cookie_access_token = useCookie("access_token");
      const cookie_refresh_token = useCookie("refresh_token");
      if ((user as any).access_token) {
        cookie_access_token.value = (user as any).access_token;
      }
      if ((user as any).refresh_token) {
        cookie_refresh_token.value = (user as any).refresh_token;
      }

      // ✅ lưu user info (không chứa token) vào localStorage
      if (import.meta.client) {
        const { access_token, refresh_token, ...safeUser } = user;
        localStorage.setItem(LOCAL_KEY, JSON.stringify({
          ...safeUser,
          expires_at: this.expires_at,
        }));
      }
    },

    loadUserInfo() {
      if (import.meta.client) {
        const saved = localStorage.getItem(LOCAL_KEY);
        if (saved) {
          const user = JSON.parse(saved);
          this.$patch(user);
        } else {
          this.resetUserInfo();
          navigateTo("/");
        }
      }
    },
    updateTokens(accessToken: string, refreshToken: string, expiresIn: number) {
      this.expires_in = expiresIn;
      this.expires_at = Date.now() + expiresIn * 1000;

      // ✅ cập nhật lại cookie
      const cookie_access_token = useCookie("access_token");
      const cookie_refresh_token = useCookie("refresh_token");
      cookie_access_token.value = accessToken;
      cookie_refresh_token.value = refreshToken;
    },



    resetUserInfo() {
      this.$reset();

      if (import.meta.client) {
        localStorage.removeItem(LOCAL_KEY);
        const cookie_access_token = useCookie("access_token");
        const cookie_refresh_token = useCookie("refresh_token");
        cookie_access_token.value = null;
        cookie_refresh_token.value = null;
      }
    },
  },
});
