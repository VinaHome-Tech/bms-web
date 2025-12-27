<script setup lang="ts">
import { Checked } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { DTO_RQ_ChangePassword } from '~/types/account/account.interface'

/* ================= PROPS & EMITS ================= */
const props = defineProps<{
  modelValue: boolean
  loading?: boolean
  userId?: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'closed'): void
  (e: 'save', data: DTO_RQ_ChangePassword): void
}>()

/* ================= DIALOG VISIBLE ================= */
const visible = ref(props.modelValue)

watch(
  () => props.modelValue,
  val => (visible.value = val)
)

watch(visible, val => emit('update:modelValue', val))

/* ================= FORM ================= */
const ruleFormRef = ref<FormInstance>()

const ruleForm = reactive<DTO_RQ_ChangePassword>({
  new_password: '',
  confirm_password: ''
})

/* ================= VALIDATORS ================= */
const validateNewPassword = (_: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('Vui lòng nhập mật khẩu mới'))
  } else if (value.length < 6 || value.length > 20) {
    callback(new Error('Mật khẩu phải từ 6 đến 20 ký tự'))
  } else {
    if (ruleForm.confirm_password) {
      ruleFormRef.value?.validateField('confirm_password')
    }
    callback()
  }
}

const validateConfirmPassword = (_: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('Vui lòng xác nhận mật khẩu mới'))
  } else if (value !== ruleForm.new_password) {
    callback(new Error('Mật khẩu xác nhận không khớp'))
  } else {
    callback()
  }
}

/* ================= RULES ================= */
const rules = reactive<FormRules>({
  new_password: [{ validator: validateNewPassword, trigger: 'blur' }],
  confirm_password: [{ validator: validateConfirmPassword, trigger: 'blur' }]
})

/* ================= METHODS ================= */
const submitForm = async () => {
  if (!ruleFormRef.value) return

  await ruleFormRef.value.validate(valid => {
    if (valid) {
      emit('save', { ...ruleForm })
    }
  })
}

const resetForm = () => {
  ruleFormRef.value?.resetFields()
}

const handleClose = () => {
  visible.value = false
  resetForm()
  emit('closed')
}
</script>

<template>
  <el-dialog
    v-model="visible"
    width="350px"
    @close="handleClose"
    style="padding: 0"
  >
    <!-- HEADER -->
    <template #header>
      <div class="pt-[10px] pl-2">
        <span class="text-[16px] font-semibold text-white">
          Thay đổi mật khẩu
        </span>
      </div>
    </template>

    <!-- BODY -->
    <div class="px-2 pt-3">
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="rules"
        label-position="top"
      >
        <el-form-item prop="new_password">
          <template #label>
            <span class="text-sm font-semibold">Mật khẩu mới</span>
          </template>
          <el-input
            v-model="ruleForm.new_password"
            type="password"
            show-password
            autocomplete="new-password"
          />
        </el-form-item>

        <el-form-item prop="confirm_password">
          <template #label>
            <span class="text-sm font-semibold">Nhập lại mật khẩu mới</span>
          </template>
          <el-input
            v-model="ruleForm.confirm_password"
            type="password"
            show-password
            autocomplete="new-password"
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- FOOTER -->
    <template #footer>
      <div class="flex justify-end p-2 gap-2">
        <el-button
          type="primary"
          plain
          :icon="Checked"
          :loading="props.loading"
          :disabled="props.loading"
          @click="submitForm"
        >
          {{ props.loading ? 'Đang lưu...' : 'Lưu mật khẩu mới' }}
        </el-button>

        <el-button @click="handleClose">Đóng</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
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
