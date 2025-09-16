import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/fonts', '@element-plus/nuxt', '@pinia/nuxt'],
  css: ['@/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ]
  },
  nitro: {
    routeRules: {
      '/.well-known/**': { prerender: false }
    }
  },
  app: {
    head: {
      title: 'Phần mềm nhà xe - VinaHome',
      charset: "utf-8",
      meta: [
        { name: 'description', content: 'Phần mềm quản lý nhà xe' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
     
    }
  },
  runtimeConfig: {
    public: {
      apiGateWay: process.env.NUXT_PUBLIC_API_GATEWAY,
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseDatabaseURL: process.env.NUXT_PUBLIC_FIREBASE_DATABASE_URL,
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
    }
  },
})