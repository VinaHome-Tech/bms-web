<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import type { LoginFormType } from '~/types/authType';
import { Search } from '@element-plus/icons-vue';
defineProps<{
  loading?: boolean
}>()
const emit = defineEmits<{
  (e: 'submit', payload: LoginFormType): void
}>()

const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<LoginFormType>({
    username: '',
    password: ''
})
const rules = ref<FormRules<LoginFormType>>({
    username: [
        { required: true, message: 'Vui lòng nhập tên đăng nhập', trigger: 'blur' },
        { min: 3, message: 'Tên đăng nhập không hợp lệ', trigger: 'blur' }
    ],
    password: [
        { required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' },
        { min: 6, message: 'Mật khẩu không hợp lệ', trigger: 'blur' }
    ]
})
const validateAndSubmit = async () => {
  if (!ruleFormRef.value) return
  await ruleFormRef.value.validate((valid) => {
    if (valid) {
      emit('submit', { ...ruleForm })
    }
  })
}

</script>
<template>
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="auto">
        <el-form-item label-position="top" prop="username">
            <template #label>
                <span class="text-sm font-semibold tracking-wide">Tên đăng nhập</span>
            </template>
            <el-input v-model="ruleForm.username" type="text" placeholder="Nhập tên đăng nhập" size="large" />
        </el-form-item>
        <el-form-item label-position="top" prop="password">
            <template #label>
                <span class="text-sm font-semibold tracking-wide">Mật khẩu</span>
            </template>
            <el-input v-model="ruleForm.password" type="password" placeholder="Nhập mật khẩu" size="large" />
        </el-form-item>
        <el-form-item>
            <el-button type="primary" class="w-full mt-5" size="large" @click="validateAndSubmit" :loading="loading">
                <span class="text-base font-semibold tracking-wide">Đăng nhập</span>
            </el-button>
        </el-form-item>
    </el-form>
</template>