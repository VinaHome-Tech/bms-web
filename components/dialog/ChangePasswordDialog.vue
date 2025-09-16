<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { Checked } from '@element-plus/icons-vue'

import type { FormInstance, FormRules } from 'element-plus'
import type { ChangePasswordType } from '~/types/accountType';
const props = defineProps<{
    modelValue: boolean
    loading?: boolean
}>()
const useUserStore = userStore();
const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'closed'): void
    (e: 'save', data: ChangePasswordType): void
}>()
const visible = ref(props.modelValue)
watch(
    () => props.modelValue,
    (val) => {
        visible.value = val
    }
)
function handleClose() {
    visible.value = false
    resetForm(ruleFormRef.value)
    emit('closed')
}

watch(visible, (val) => {
    emit('update:modelValue', val)
})
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<ChangePasswordType>({
    user_id: String(useUserStore.id ?? ''),
    old_password: null,
    new_password: null,
    confirm_password: null
})

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value === '' || value === null || value.length === 0) {
    callback(new Error('Vui lòng xác nhận mật khẩu mới'))
  } else if (value !== ruleForm.new_password) {
    callback(new Error('Mật khẩu xác nhận không khớp với mật khẩu mới'))
  } else {
    callback()
  }
}

const validateNewPassword = (rule: any, value: any, callback: any) => {
  if (value === '' || value === null || value.length === 0) {
    callback(new Error('Vui lòng nhập mật khẩu mới'))
  } else if (value.length < 6 || value.length > 20) {
    callback(new Error('Mật khẩu phải từ 6 đến 20 ký tự'))
  } else if (value === ruleForm.old_password) {
    callback(new Error('Mật khẩu mới không được trùng với mật khẩu cũ'))
  } else {
    if (ruleForm.confirm_password !== null && ruleForm.confirm_password !== '') {
      ruleFormRef.value?.validateField('confirm_password', () => {})
    }
    callback()
  }
}

const rules = reactive<FormRules>({
    old_password: [
        { required: true, message: 'Vui lòng nhập mật khẩu hiện tại', trigger: 'blur' }
    ],
    new_password: [
        { validator: validateNewPassword, trigger: 'blur' }
    ],
    confirm_password: [
        { validator: validateConfirmPassword, trigger: 'blur' }
    ]
})
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
      emit('save', ruleForm)
    } else {
      console.log('error submit!', fields)
    }
  })
}
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
onMounted(async () => {
  await useUserStore.loadUserInfo();
})
</script>
<template>
    <el-dialog v-model="visible" width="350" @close="handleClose" style="padding: 0px;">
        <template #header>
            <div class="pt-[10px] pl-2">
                <span class="text-[16px] font-semibold text-white">
                    Thay đổi mật khẩu
                </span>
            </div>
        </template>
        <div class="px-2 pt-3">
            <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" :rules="rules" label-width="auto">
                <el-form-item label-position="top" width="100%" prop="old_password">
                    <template #label>
                        <span class="text-sm font-semibold">Mật khẩu hiện tại</span>
                    </template>
                    <el-input v-model="ruleForm.old_password"/>
                </el-form-item>
                <el-form-item label-position="top" width="100%" prop="new_password">
                    <template #label>
                        <span class="text-sm font-semibold">Mật khẩu mới</span>
                    </template>
                    <el-input v-model="ruleForm.new_password" />
                </el-form-item>
                <el-form-item label-position="top" width="100%" prop="confirm_password">
                    <template #label>
                        <span class="text-sm font-semibold">Nhập lại mật khẩu mới</span>
                    </template>
                    <el-input v-model="ruleForm.confirm_password"/>
                </el-form-item>
            </el-form>

        </div>
        <template #footer>
            <div class="flex justify-end p-2">

                <el-button 
                    @click="submitForm(ruleFormRef)" 
                    type="primary" 
                    :icon="Checked" 
                    :loading="props.loading"
                    :disabled="props.loading"
                    plain
                >
                    {{ props.loading ? 'Đang lưu...' : 'Lưu mật khẩu mới' }}
                </el-button>
                <el-button @click="handleClose">Đóng</el-button>

            </div>
        </template>
    </el-dialog>

</template>
<style>
.el-dialog__header {
    background-color: #0072bc;
    padding-bottom: 10px;
}

.el-dialog__headerbtn {
    color: white;
}

.el-dialog__footer {
    padding-top: 0;
}
</style>