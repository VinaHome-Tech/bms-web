<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { Checked } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { API_ChangePasswordAccountById, API_GetHistoryLoginByAccountId, API_GetInfoAccountById, API_UpdateInfoAccountById } from '~/services/identity-service/account/employee.api'
import type { AccountInfo, ChangePassword } from '~/types/account/account.interface'
import type { HistoryLogin } from '~/types/account/history-login.interface'
const useUserStore = userStore()

const loadingUser = ref(false)
const saving = ref(false)

const ruleFormRef = ref<FormInstance>()
const ruleFormRefPassword = ref<FormInstance>()

const ruleForm = ref<AccountInfo>({
  id: undefined,
  username: undefined,
  name: undefined,
  email: undefined,
  phone: undefined,
  address: undefined,
  date_of_birth: undefined,
  gender: undefined
})

const passwordForm = ref<ChangePassword>({
  old_password: undefined,
  new_password: undefined,
})
const rulesPassword: FormRules = {
  old_password: [
    { required: true, message: 'Vui lòng nhập mật khẩu cũ', trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: 'Vui lòng nhập mật khẩu mới', trigger: 'blur' },
    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự', trigger: 'blur' }
  ]
}
const genderOptions = [
  { label: 'Nam', value: 1 },
  { label: 'Nữ', value: 2 },
  { label: 'Khác', value: 3 }
]

const rules: FormRules = {
  name: [
    { required: true, message: 'Vui lòng nhập họ và tên', trigger: 'blur' },
    { min: 3, max: 50, message: 'Độ dài 3 - 50 ký tự', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' },
    {
      pattern: /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-4|6-9])[0-9]{7}$/,
      message: 'Số điện thoại không hợp lệ',
      trigger: 'blur'
    }
  ],
  email: [
    { type: 'email', message: 'Email không hợp lệ', trigger: 'blur' }
  ]
}

// ===== Fetch thông tin tài khoản =====
const fetchUserInfo = async () => {
  loadingUser.value = true
  try {
    const response = await API_GetInfoAccountById(useUserStore.id ?? '')

    if (response.success) {
      Object.assign(ruleForm.value, response.result)
    } else {
      notifyError(response.message)
    }
  } catch (error) {
    console.error(error)
    notifyError('Không thể tải dữ liệu tài khoản')
  } finally {
    loadingUser.value = false
  }
}
const loadingHistoryLogin = ref(false)
const tableData = ref<HistoryLogin[]>([])
const fetchHistoryLogin = async () => {
  loadingHistoryLogin.value = true
  try {
    const response = await API_GetHistoryLoginByAccountId(useUserStore.id ?? '')
    if (response.success) {
      tableData.value = response.result
    } else {
      notifyError(response.message || 'Không thể tải lịch sử đăng nhập')
    }
  } catch (error) {
    console.error(error)
    notifyError('Không thể tải lịch sử đăng nhập')
  } finally {
    loadingHistoryLogin.value = false
  }
}

// ===== Submit cập nhật =====
const submitForm = async () => {
  if (!ruleFormRef.value) return

  await ruleFormRef.value.validate(async (valid) => {
    if (!valid) return notifyError('Vui lòng kiểm tra thông tin')

    saving.value = true
    try {
      const res = await API_UpdateInfoAccountById(ruleForm.value.id ?? '', ruleForm.value)
      if (res.success) {
        notifySuccess('Cập nhật thành công')
        Object.assign(ruleForm.value, res.result)
      } else notifyError(res.message)
    } catch (error) {
      console.error(error)
      notifyError('Cập nhật thất bại')
    } finally {
      saving.value = false
    }
  })
}
const loadingPassword = ref(false)
const submitFormPassword = async () => {
  if (!ruleFormRefPassword.value) return

  await ruleFormRefPassword.value.validate(async (valid) => {
    if (!valid) return notifyError('Vui lòng kiểm tra thông tin')
    try {
      loadingPassword.value = true
      const response = await API_ChangePasswordAccountById(useUserStore.id ?? '', passwordForm.value)
      if (response.success) {
        notifySuccess('Đổi mật khẩu thành công')
        passwordForm.value = {
          old_password: '',
          new_password: ''
        }
      } else {
        notifyError(response.message || 'Đổi mật khẩu thất bại')
      }
    } catch (error) {
      console.error(error)
      notifyError('Đổi mật khẩu thất bại')
    } finally {
      loadingPassword.value = false
    }
  })
}
const activeMenu = ref('profile')
const handleSelect = (key: string) => {
  activeMenu.value = key
}

onMounted(() => {
  fetchUserInfo()
  fetchHistoryLogin()
})
</script>

<template>
  <div class="bg-white rounded-md shadow-sm p-6">
    <el-row>
      <!-- MENU TRÁI -->
      <el-col :span="5" class=" pr-4">

        <el-menu v-model="activeMenu" class="el-menu-vertical-demo" @select="handleSelect" :default-active="activeMenu">
          <el-menu-item index="profile">
            <span>Thông tin cá nhân</span>
          </el-menu-item>

          <el-menu-item index="security">
            <span>Mật khẩu</span>
          </el-menu-item>

          <el-menu-item index="activity">
            <span>Lịch sử đăng nhập</span>
          </el-menu-item>
        </el-menu>

      </el-col>

      <!-- NỘI DUNG BÊN PHẢI -->
      <el-col :span="19" class="pl-6">

        <!-- TAB 1: Thông tin cá nhân -->
        <section v-if="activeMenu === 'profile'">
          <h2 class="text-xl font-semibold mb-6">Thông tin tài khoản</h2>

          <div class="flex gap-6 items-start">

            <!-- Form -->
            <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="140px" class="flex-1"
              v-loading="loadingUser" element-loading-text="Đang tải thông tin..." style="max-width: 600px">
              <el-form-item label="Tên đăng nhập">
                <el-input v-model="ruleForm.username" disabled />
              </el-form-item>

              <el-form-item label="Họ và tên" prop="name">
                <el-input v-model="ruleForm.name" placeholder="Nhập họ tên" />
              </el-form-item>

              <el-form-item label="Email" prop="email">
                <el-input v-model="ruleForm.email" placeholder="Nhập email" />
              </el-form-item>

              <el-form-item label="Số điện thoại" prop="phone">
                <el-input v-model="ruleForm.phone" placeholder="Nhập SĐT" />
              </el-form-item>

              <el-form-item label="Địa chỉ">
                <el-input v-model="ruleForm.address" placeholder="Nhập địa chỉ" />
              </el-form-item>

              <el-form-item label="Ngày sinh">
                <el-date-picker v-model="ruleForm.date_of_birth" type="date" value-format="YYYY-MM-DD"
                  placeholder="Chọn ngày sinh" style="width: 100%" />
              </el-form-item>

              <el-form-item label="Giới tính">
                <el-select v-model="ruleForm.gender" placeholder="Chọn giới tính" style="width: 100%">
                  <el-option v-for="item in genderOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>

              <el-form-item>
                <el-button @click="fetchUserInfo">Tải lại</el-button>
                <el-button type="primary" :loading="saving" :icon="Checked" @click="submitForm">
                  Lưu thay đổi
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </section>

        <!-- TAB 2: Bảo mật -->
        <section v-if="activeMenu === 'security'">
          <h2 class="text-xl font-semibold mb-6">Thay đổi mật khẩu</h2>

          <el-form ref="ruleFormRefPassword" :model="passwordForm" :rules="rulesPassword" label-width="140px"
            style="max-width: 600px">
            <el-form-item label="Mật khẩu hiện tại" prop="old_password">
              <el-input type="password" v-model="passwordForm.old_password" />
            </el-form-item>

            <el-form-item label="Mật khẩu mới" prop="new_password">
              <el-input type="password" v-model="passwordForm.new_password" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="loadingPassword" :icon="Checked" @click="submitFormPassword">Đổi mật
                khẩu</el-button>
            </el-form-item>

          </el-form>

        </section>

        <!-- TAB 3: Lịch sử đăng nhập -->
        <section v-if="activeMenu === 'activity'">
          <h2 class="text-xl font-semibold mb-6">Lịch sử đăng nhập</h2>

          <el-table v-loading="loadingHistoryLogin" :data="tableData"  style="width: 100%">
            <el-table-column prop="user_agent" label="Thiết bị"  />
            <el-table-column prop="ip_address" label="IP" />
            <el-table-column prop="created_at" label="Thời gian" />
          </el-table>
        </section>

      </el-col>
    </el-row>
  </div>
</template>
