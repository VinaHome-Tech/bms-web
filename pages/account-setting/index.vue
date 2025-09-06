<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'
import { getInfomationUserById, updateInfomationUserById } from '~/api/employeeAPI';
import InputDate from '~/components/inputs/inputDate.vue';
import InputText from '~/components/inputs/inputText.vue';
import Select from '~/components/inputs/select.vue';
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
const loadingDataUser = ref(false)
const loadingSubmit = ref(false)

const fetchUserInfo = async () => {
    loadingDataUser.value = true
    try {
        const response = await getInfomationUserById(useUserStore.id ?? '')
        if (response.success) {
            console.log('User info fetched successfully:', response.result)
            Object.assign(ruleForm, response.result);
        } else {
            notifyError(response.message || 'Tải dữ liệu tài khoản thất bại')
        }
    } catch (error) {
        console.error('Failed to fetch user info:', error)
        notifyError('Tải dữ liệu tài khoản thất bại')
    } finally {
        loadingDataUser.value = false
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
    gender: '',
})
const rules = reactive<FormRules>({
    name: [
        { required: true, message: 'Vui lòng nhập họ và tên', trigger: 'blur' },
        { min: 3, max: 50, message: 'Họ và tên từ 3 đến 50 ký tự', trigger: 'blur' },
    ],
    phone: [
        { required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' },
        {
            pattern: /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-4|6-9])[0-9]{7}$/,
            message: 'Số điện thoại không hợp lệ',
            trigger: 'blur',
        },
    ]
})
const categoryGenderOptions = [
    { label: 'Nam', value: 'male' },
    { label: 'Nữ', value: 'female' },
    { label: 'Khác', value: 'other' }
]
const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            console.log('Submitting form with data:', ruleForm)
            const response = await updateInfomationUserById(useUserStore.id ?? '', ruleForm)
            if (response.success) {
                notifySuccess('Cập nhật thông tin tài khoản thành công')
                if (response.result) {
                    Object.assign(ruleForm, response.result);
                }
                // fetchUserInfo()
            } else {
                notifyError(response.message || 'Cập nhật thông tin tài khoản thất bại')
            }
        } else {
            console.log('error submit!', fields)
            notifyError('Vui lòng kiểm tra lại thông tin')
        }
    })
}
onMounted(async () => {
    await useUserStore.loadUserInfo()
    fetchUserInfo()
})
</script>
<template>
    <div class="bg-white">
        <el-row class="tac">
            <el-col :span="3">
                <h5 class="my-3 mx-5 text-lg font-semibold">Cài đặt tài khoản</h5>
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
                    <div v-loading="loadingDataUser" element-loading-text="Đang tải dữ liệu...">
                        <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" :rules="rules"
                            label-width="auto">
                            <InputText v-model="ruleForm.name" label="Họ và tên" prop="name" />
                            <InputText v-model="ruleForm.phone" label="Số điện thoại" prop="phone" />
                            <InputText v-model="ruleForm.email" label="Email" prop="email" />
                            <InputText v-model="ruleForm.address" label="Địa chỉ" prop="address" />
                            <InputDate v-model="ruleForm.date_of_birth" prop="date_of_birth" label="Ngày sinh"
                                type="date" format="DD/MM/YYYY" value-format="YYYY-MM-DD" clearable />
                            <Select v-model="ruleForm.gender" prop="gender" label="Giới tính"
                                :options="categoryGenderOptions" clearable />
                        </el-form>
                        <div>
                            <el-button @click="fetchUserInfo" class="mr-3" size="large">Bỏ qua</el-button>
                            <el-button type="primary" @click="submitForm(ruleFormRef)" size="large">Lưu thay đổi</el-button>
                        </div>
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
