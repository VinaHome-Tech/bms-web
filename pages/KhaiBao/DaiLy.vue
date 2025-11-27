<script setup lang="ts">
import type { DrawerProps, FormRules } from 'element-plus'
import InputText from '~/components/inputs/inputText.vue';
import InputNumber from '~/components/inputs/inputNumber.vue';
import {
    Plus, Delete, Edit, Checked
} from '@element-plus/icons-vue'
import { useAgentManagement } from '~/composables/account/useAgentManagement';
definePageMeta({
    layout: 'default',
})
const {
    drawer,
    isEditMode,
    agents,
    loadingData,
    loadingSubmit,
    ruleFormRef,
    ruleForm,
    handleAdd,
    handleEdit,
    handleDelete,
    fetchListAgents,
    submitForm,
    cancelClick,
    resetForm,

} = useAgentManagement();
const useUserStore = userStore();
const direction = ref<DrawerProps[ 'direction' ]>('rtl')

const rules: FormRules = {
    name: [
        { required: true, message: 'Vui lòng nhập tên đại lý', trigger: 'blur' },
    ],
    phone: [
        { required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' },
        { pattern: /^0[0-9]{9}$/, message: 'Số điện thoại không hợp lệ', trigger: 'blur' }
    ],
    username: isEditMode.value ? [] : [
        { required: true, message: 'Vui lòng nhập tài khoản', trigger: 'blur' },
    ],
    password: isEditMode.value ? [] : [
        { required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' },
    ],
}

const search = ref('')
const filterTableData = computed(() =>
    agents.value.filter(
        (data) =>
            !search.value ||
            (data.name ?? '').toLowerCase().includes(search.value.toLowerCase())
    )
)



onMounted(async () => {
    await useUserStore.loadUserInfo();
    await fetchListAgents(useUserStore.company_id ?? '');
});
</script>
<template>
    <section>
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">DANH SÁCH ĐẠI LÝ</h3>
            <el-button :icon="Plus" type="primary" @click="handleAdd">Thêm đại lý</el-button>
        </div>
        <el-table v-loading="loadingData" element-loading-text="Đang tải dữ liệu..." :data="filterTableData"
            style="width: 100%">
            <el-table-column type="index" label="STT" width="50" />
            <el-table-column label="Tên đại lý" prop="name" />
            <el-table-column label="Tài khoản" prop="username" />
            <el-table-column label="Số điện thoại" prop="phone" />
            <el-table-column label="Trạng thái" prop="status">
                <template #default="scope">
                    <el-tag :type="scope.row.status ? 'success' : 'danger'">
                        {{ scope.row.status ? 'Kích hoạt' : 'Ngưng kích hoạt' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="Chiết khấu vé">
                <template #default="scope">
                    <span>{{ scope.row.commission?.ticket_value }} ({{ scope.row.commission?.ticket_type }})</span>
                </template>
            </el-table-column>
            <el-table-column label="Chiết khấu hàng hóa">
                <template #default="scope">
                    <span>{{ scope.row.commission?.goods_value }} ({{ scope.row.commission?.goods_type }})</span>
                </template>
            </el-table-column>
            <el-table-column label="Ghi chú" prop="note" />
            <el-table-column align="right">
                <template #header>
                    <el-input v-model="search" placeholder="Tìm đại lý" />
                </template>
                <template #default="scope">
                    <el-button type="primary" :icon="Edit" circle @click="handleEdit(scope.$index, scope.row)" />
                    <el-button circle type="danger" :icon="Delete" @click="handleDelete(scope.$index, scope.row)" />
                </template>
            </el-table-column>
        </el-table>

        <el-drawer v-model="drawer" :direction="direction" :before-close="cancelClick" size="55%">
            <template #header>
                <div class="font-semibold text-lg text-black">{{ isEditMode ? 'Chỉnh sửa đại lý' : 'Thêm đại lý'
                    }}</div>
            </template>
            <template #default>
                <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="auto">
                    <el-row>
                        <el-col :span="12" class="pr-5">
                            <h2 class="text-gray-500 font-medium mb-5">THÔNG TIN ĐẠI LÝ</h2>
                            <InputText v-model="ruleForm.name" prop="name" label="Tên đại lý" />
                            <InputText v-if="!isEditMode" v-model="ruleForm.username" prop="username"
                                label="Tài khoản" />
                            <InputText v-if="!isEditMode" v-model="ruleForm.password" prop="password"
                                label="Mật khẩu" />
                            <InputText v-model="ruleForm.phone" prop="phone" label="Số điện thoại liên lạc" />
                            <InputText v-model="ruleForm.email" prop="email" label="Email" />
                            <InputText v-model="ruleForm.address" prop="address" label="Địa chỉ" />
                            <el-form-item prop="status" label-position="top">
                                <template #label>
                                    <label class="text-sm font-medium text-gray-700">Trạng thái</label>
                                </template>
                                <el-switch v-model="ruleForm.status" size="large" active-text="Kích hoạt"
                                    inactive-text="Ngưng kích hoạt" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12" class="pl-5">
                            <h2 class="text-gray-500 font-medium mb-5">CHÍNH SÁCH CHIẾT KHẤU</h2>
                            <div class="mb-6">
                                <InputNumber v-model="ruleForm.commissiom.ticket_value" prop="discount_ticket_value"
                                    label="Chiết khấu vé" class="w-full" />
                                <form-item prop="discount_ticket_type" label-position="top" class="space-y-3">
                                    <template #label>
                                        <label class="block text-sm font-medium text-gray-700 mb-3">
                                            Loại chiết khấu vé
                                        </label>
                                    </template>

                                    <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                        <span class="text-sm font-medium text-gray-700 min-w-[80px]">
                                            Theo số tiền (VNĐ)
                                        </span>
                                        <el-switch v-model="ruleForm.commission.ticket_type" size="large" active-value="%"
                                            inactive-value="VND" active-text="Theo %" inactive-text="VNĐ" class="ml-4"
                                            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" />
                                        <span class="text-sm font-medium text-gray-700 min-w-[60px]">
                                            Theo phần trăm (%)
                                        </span>
                                    </div>
                                </form-item>
                            </div>

                            <div class="mb-6">
                                <InputNumber v-model="ruleForm.commission.goods_value" prop="discount_goods_value"
                                    label="Chiết khấu hàng hóa theo đơn" />
                                <form-item prop="discount_goods_type" label-position="top" class="space-y-3">
                                    <template #label>
                                        <label class="block text-sm font-medium text-gray-700 mb-3">
                                            Loại chiết khấu hàng hóa
                                        </label>
                                    </template>
                                    <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                        <span class="text-sm font-medium text-gray-700 min-w-[80px]">
                                            Theo số tiền (VNĐ)
                                        </span>
                                        <el-switch v-model="ruleForm.commission.goods_type" size="large" active-value="%"
                                            inactive-value="VND" active-text="Theo %" inactive-text="VNĐ" class="ml-4"
                                            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" />
                                        <span class="text-sm font-medium text-gray-700 min-w-[60px]">
                                            Theo phần trăm (%)
                                        </span>
                                    </div>
                                </form-item>
                            </div>
                        </el-col>
                    </el-row>
                </el-form>
            </template>
            <template #footer>
                <div style="flex: auto">
                    <el-button @click="resetForm(ruleFormRef)">Thoát</el-button>
                    <el-button type="primary" :icon="Checked" :loading="loadingSubmit" @click="submitForm(ruleFormRef)" >
                        {{ loadingSubmit ? 'Đang lưu...' : 'Lưu thông tin' }}
                    </el-button>
                </div>
            </template>
        </el-drawer>
    </section>
</template>
