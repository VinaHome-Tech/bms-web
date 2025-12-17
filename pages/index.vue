<script setup lang="ts">
import logo from '@/assets/image/logo-4.png';
import LoginForm from '~/components/form/LoginForm.vue';
import type { LoginFormType } from '~/types/authType';
import { ecosystemModules } from '~/mock/ecosystemModules';
import { scheduleTokenRefresh } from '~/lib/auth';
import { API_LoginBMS } from '~/api/identity-service/auth/bms_auth.api';
definePageMeta({
    middleware: [ 'guest' ],
    layout: false,
})
const submitLoading = ref(false);
const handleLogin = async (payload: LoginFormType) => {
    const store = userStore()
    submitLoading.value = true;
    try {
        const response = await API_LoginBMS(payload)
        if (response.success && response.result) {
            notifySuccess('Đăng nhập thành công!')
            const {
                id, username, full_name, company_name, company_id, company_code, role,
                access_token, refresh_token, expires_in
            } = response.result
            store.setUserInfo({
                id,
                username,
                full_name,
                company_name,
                company_id,
                company_code,
                role,
                access_token,
                refresh_token,
                expires_in,
            })
            console.log('Login response:', response.result)
            scheduleTokenRefresh(expires_in ?? 0)
            navigateTo('/room-work')
        } else {
            notifyError(response.message || 'Đăng nhập thất bại!')
        }
    } catch (err) {
        notifyError('Lỗi đăng nhập, vui lòng thử lại sau!')
        console.error('Login error:', err)
    } finally {
        submitLoading.value = false;
    }
}

function goToDetail(item: { route?: string }) {
    if (item.route) window.open(item.route, '_blank')
}
</script>
<template>
    <el-row>
        <el-col :xs="24" :sm="24" :md="8" :lg="6" :xl="6"
            class="min-h-screen h-screen flex flex-col items-center bg-white shadow-2xl shadow-blue-100 border-r border-blue-100 z-20">
            <div class="w-full max-w-sm mx-auto my-auto px-5 flex flex-col justify-center h-full">
                <div>
                    <div class="pb-5">
                        <img :src="logo" alt="Logo" class="w-[280px] m-auto" />
                    </div>
                    <div class="text-center text-[16px] font-semibold text-[#0072bc] tracking-wide">
                        Chúc bạn có một ngày làm việc hiệu quả!
                    </div>
                    <div class="mt-10">
                        <LoginForm :loading="submitLoading" @submit="handleLogin" />
                    </div>

                    <div class="mt-5 text-center">
                        <span class="text-[12px] italic text-[#0a2e5c] font-regular tracking-wider">
                            Liên hệ Hotline: 0877 71 7575 nếu gặp sự cố đăng nhập
                        </span>
                    </div>
                </div>
            </div>
        </el-col>

        <el-col :xs="24" :sm="24" :md="16" :lg="18" :xl="18"
            class="relative flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 overflow-hidden md:overflow-y-auto md:h-screen">

            <div class="relative z-10 w-full max-w-5xl mx-auto px-6 py-16">
                <h2 class="text-4xl md:text-5xl font-extrabold text-blue-900 mb-6 text-center drop-shadow-lg">
                    Hệ sinh thái phần mềm nhà xe VinaHome
                </h2>
                <p class="text-lg md:text-xl text-blue-800 mb-12 text-center font-medium">
                    VinaHome cung cấp giải pháp toàn diện cho doanh nghiệp vận tải:
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    <div v-for="(item, idx) in ecosystemModules" :key="idx" :class="[
                        'group pt-6 pb-10 flex flex-col items-center bg-white/80 rounded-xl shadow-lg p-6 hover:scale-105 transition relative',
                    ]">
                        <img :src="item.icon" class="w-16 h-16 mb-3" :alt="item.title" />
                        <span class="font-semibold text-blue-900 text-center mb-2" v-html="item.title"></span>
                        <button
                            class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            @click="goToDetail(item)">
                            Xem chi tiết
                        </button>
                    </div>
                </div>
                <div class="mt-12 text-center">
                    <span class="text-lg md:text-xl text-blue-700 font-semibold tracking-wide">
                        Tối ưu vận hành - Nâng tầm thương hiệu - Kết nối khách hàng
                    </span>
                </div>
            </div>
        </el-col>
    </el-row>
</template>