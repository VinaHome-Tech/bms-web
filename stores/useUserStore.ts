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
    role: null,
    access_token: null,
    refresh_token: null,
    expires_in: null,
  }),

  actions: {
    setUserInfo(user: UserBMSType) {
      this.id = user.id;
      this.username = user.username;
      this.full_name = user.full_name;
      this.company_name = user.company_name;
      this.company_id = user.company_id;
      this.role = user.role;
      this.access_token = user.access_token;
      this.refresh_token = user.refresh_token;
      this.expires_in = user.expires_in;

      if (import.meta.client) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(user));
      }
    },

    loadUserInfo() {
      if (import.meta.client) {
        const saved = localStorage.getItem(LOCAL_KEY);
        if (saved) {
          const user = JSON.parse(saved);
          this.setUserInfo(user);
        } else {
          navigateTo("/");
          this.resetUserInfo();
        }
      }
    },

    resetUserInfo() {
      this.id = null;
      this.username = null;
      this.full_name = null;
      this.company_name = null;
      this.company_id = null;
      this.role = null;
      this.access_token = null;
      this.refresh_token = null;
      this.expires_in = null;

      if (import.meta.client) {
        localStorage.removeItem(LOCAL_KEY);
      }
    },
  },
});
