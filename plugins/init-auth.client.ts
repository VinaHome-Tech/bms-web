import { refreshNow, scheduleTokenRefresh } from "~/lib/auth"

export default defineNuxtPlugin(() => {
  const store = userStore()

  store.loadUserInfo()

  if (store.expires_at) {
    const remaining = store.expires_at - Date.now()

    if (remaining > 0) {
      scheduleTokenRefresh(remaining / 1000)
    } else {
      // token hết hạn → refresh ngay
      refreshNow()
    }
  }
})