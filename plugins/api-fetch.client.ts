/* eslint-disable @typescript-eslint/no-explicit-any */
import { refreshNow } from "~/lib/auth"
import type { NitroFetchOptions } from 'nitropack'

// plugins/api-fetch.client.ts
export default defineNuxtPlugin(() => {
    const apiFetch = $fetch.create({
        async onRequest({ options }) {
            const cookie_access_token = useCookie("access_token")
            if (cookie_access_token.value) {
                if (!options.headers) {
                    options.headers = new Headers()
                }

                if (options.headers instanceof Headers) {
                    options.headers.set("Authorization", `Bearer ${cookie_access_token.value}`)
                } else {
                    (options.headers as Record<string, string>)[ "Authorization" ] = `Bearer ${cookie_access_token.value}`
                }
            }
        },


        async onResponseError({ request, options, response }) {
            if (response.status === 401) {
                const ok = await refreshNow()
                if (ok) {
                    // retry request với options cũ
                    if (options && typeof options.method === "string") {
                        const allowedMethods = [
                          "OPTIONS", "GET", "HEAD", "PATCH", "POST", "PUT", "DELETE", "CONNECT", "TRACE",
                          "options", "get", "head", "patch", "post", "put", "delete", "connect", "trace"
                        ] as const;
                        if (allowedMethods.includes(options.method as any)) {
                          options.method = options.method as typeof allowedMethods[number];
                        } else {
                          options.method = undefined;
                        }
                    }
                    // Ensure options.method is a valid method or fallback to "GET"
                    const allowedMethods = [
                      "options", "get", "head", "patch", "post", "put", "delete", "connect", "trace"
                    ] as const;
                    const method = (options && typeof options.method === "string" && allowedMethods.includes(options.method.toLowerCase() as any))
                      ? options.method.toLowerCase() as typeof allowedMethods[number]
                      : "get";
                    if (options) options.method = method;
                    return await $fetch(request, options as NitroFetchOptions<RequestInfo, typeof method>)
                } else {
                    const store = userStore()
                    store.resetUserInfo()
                    navigateTo("/")
                }
            }
        },
    })

    return {
        provide: {
            apiFetch, // gọi bằng useNuxtApp().$apiFetch
        },
    }
})