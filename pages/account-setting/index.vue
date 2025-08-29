<script lang="ts" setup>
import {
    Document,
    Menu as IconMenu,
    Location,
    Setting,
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { getInfomationUserById } from '~/api/employeeAPI';
import InputText from '~/components/inputs/inputText.vue';
import type { AccountSettingType } from '~/types/accountType'
definePageMeta({
    layout: 'default',
})
const useUserStore = userStore();
const activeMenu = ref('1')
const handleSelect = (key: string) => {
    activeMenu.value = key
}
const handleOpen = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)
}
const fetchUserInfo = async () => {
    try {
        const response = await getInfomationUserById(useUserStore.id ?? '')
        if (response.success) {
            console.log('User info fetched successfully:', response.result)
            Object.assign(ruleForm, response.result);
        } else {
            ElNotification({
                message: h('p', { style: 'color: red' }, response.message || 'Tải dữ liệu tài khoản thất bại'),
                type: 'error',
            });
        }
    } catch (error) {
        console.error('Failed to fetch user info:', error)
        ElNotification({
            message: h('p', { style: 'color: red' }, 'Tải dữ liệu tài khoản thất bại'),
            type: 'error',
        });
    } finally {
        console.log('User info fetched successfully')
    }
}
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<AccountSettingType>({
    id: useUserStore.id || '',
    name: '',
    phone: '',
    email: '',
    address: '',
    date_of_birth: null,
    gender: null
})
onMounted(async () => {
    await useUserStore.loadUserInfo()
    fetchUserInfo()
})
</script>
<template>
    <div class="bg-white">
        <el-row class="tac">
            <el-col :span="3">
                <h5 class="my-3 mx-5 text-xl font-semibold">Cài đặt tài khoản</h5>
                <el-menu v-model:default-active="activeMenu" class="el-menu-vertical-demo" @select="handleSelect"
                    @open="handleOpen" @close="handleClose">

                    <el-menu-item index="1">
                        <span>Thông tin cá nhân</span>
                    </el-menu-item>
                    <el-menu-item index="2">
                        <span>Thông báo</span>
                    </el-menu-item>

                </el-menu>
            </el-col>
            <el-col :span="21">
                <section v-if="activeMenu === '1'" class="p-6">
                    <h3 class="text-lg font-semibold mb-4">Thông tin cá nhân</h3>
                    <div>
                        <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" :rules="rules"
                            label-width="auto">
                            <InputText v-model="ruleForm.name" label="Họ và tên" prop="name"/>
                            <InputText v-model="ruleForm.phone" label="Số điện thoại" prop="phone"/>
                            <InputText v-model="ruleForm.email" label="Email" prop="email"/>
                            <InputText v-model="ruleForm.address" label="Địa chỉ" prop="address"/>
                            <!-- <InputText v-model="ruleForm.date_of_birth" label="Ngày sinh" type="date" /> -->
                            <!-- <InputText v-model="ruleForm.gender" label="Giới tính" /> -->
                     
                        </el-form>
                    </div>
                </section>

                <section v-if="activeMenu === '2'" class="p-6">
                    <h3 class="text-lg font-semibold mb-4">Thông báo</h3>
                    <div>
                        <p>Cài đặt thông báo</p>
                    </div>
                </section>
            </el-col>
        </el-row>
    </div>
</template>
