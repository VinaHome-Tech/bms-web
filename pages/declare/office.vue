<script setup lang="ts">
import {
    Plus, Delete, Edit, Checked
} from '@element-plus/icons-vue'
import type { DrawerProps, FormRules } from 'element-plus'
import { format } from 'date-fns'
import { useOfficeManagement } from '~/composables/declare/office/useOfficeManagement';
definePageMeta({
    layout: 'default',
})
const {
    drawer,
    offices,
    loadingData,
    ruleFormRef,
    isEditMode,
    ruleForm,
    resetForm,
    cancelClick,
    addPhone,
    removePhone,
    handleDelete,
    handleAdd,
    handleEdit,
    submitForm,
    loadingSubmit,
    fetchListOffice,
} = useOfficeManagement();
const useUserStore = userStore();
const direction = ref<DrawerProps['direction']>('rtl')

const rules = reactive<FormRules>({
    name: [
        { required: true, message: 'Vui lòng nhập tên văn phòng', trigger: 'blur' },
    ],
    code: [
        { required: true, message: 'Vui lòng nhập mã văn phòng', trigger: 'blur' },
    ],
    address: [
        { required: true, message: 'Vui lòng nhập địa chỉ văn phòng', trigger: 'blur' },
    ],
});
const phoneRules = [
    { required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' },
    {
        pattern: /^[0-9+\-\s()]+$/,
        message: 'Số điện thoại không hợp lệ',
        trigger: 'blur'
    }
]

const search = ref('')
const filterTableData = computed(() =>
    offices.value.filter(
        (data) =>
            !search.value ||
            (data.name ?? '').toLowerCase().includes(search.value.toLowerCase()) ||
            (data.code ?? '').toLowerCase().includes(search.value.toLowerCase())
    )
);

onMounted(async () => {
    await useUserStore.loadUserInfo();
    await fetchListOffice(useUserStore.company_id ?? '');
});
</script>
<template>
    <section>
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">DANH SÁCH VĂN PHÒNG</h3>
            <el-button :icon="Plus" type="primary" @click="handleAdd">Thêm văn phòng</el-button>
        </div>

        <el-table v-loading="loadingData" element-loading-text="Đang tải dữ liệu..." :data="filterTableData"
            style="width: 100%">
            <el-table-column type="index" label="STT" width="50" />
            <el-table-column label="Tên văn phòng" prop="name" />
            <el-table-column label="Mã văn phòng" prop="code" />
            <el-table-column label="Địa chỉ" prop="address" />
            <el-table-column label="Trạng thái" prop="status">
                <template #default="scope">
                    <el-tag :type="scope.row.status ? 'success' : 'danger'">
                        {{ scope.row.status ? 'Kích hoạt' : 'Ngưng kích hoạt' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="Số điện thoại" prop="phones">
                <template #default="scope">
                    <div v-for="(phone, index) in scope.row.phones" :key="index" class="mb-1">
                        <el-tag :type="phone.type === 'mobile' ? 'success'
                            : phone.type === 'landline' ? 'info'
                                : phone.type === 'fax' ? 'warning'
                                    : 'danger'" effect="dark">
                            {{ phone.phone }}
                        </el-tag>
                    </div>
                </template>
            </el-table-column>

            <el-table-column label="Ghi chú" prop="note" />
            <el-table-column label="Ngày tạo" prop="created_at">
                <template #default="scope">
                    {{ format(new Date(scope.row.created_at), 'dd/MM/yyyy') }}
                </template>
            </el-table-column>
            <el-table-column align="right">
                <template #header>
                    <el-input v-model="search" placeholder="Tìm văn phòng" />
                </template>
                <template #default="scope">
                    <el-button type="primary" :icon="Edit" circle @click="handleEdit(scope.$index, scope.row)" />
                    <el-button circle type="danger" :icon="Delete" @click="handleDelete(scope.$index, scope.row)" />

                </template>
            </el-table-column>
        </el-table>

        <el-drawer v-model="drawer" :direction="direction" :before-close="cancelClick">
            <template #header>
                <div class="font-semibold text-lg text-black">{{ isEditMode ? 'Chỉnh sửa văn phòng' : 'Thêm văn phòng'
                    }}</div>
            </template>
            <template #default>

                <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="auto">
                    <div>
                        <h2 class="text-gray-500 font-medium mb-5">THÔNG TIN VĂN PHÒNG</h2>

                        <el-form-item prop="name" label-position="top">
                            <template #label>
                                <label class="text-sm font-medium text-gray-700">Tên văn phòng</label>
                            </template>
                            <el-input v-model="ruleForm.name" />
                        </el-form-item>

                        <el-form-item prop="code" label-position="top">
                            <template #label>
                                <label class="text-sm font-medium text-gray-700">Mã văn phòng</label>
                            </template>
                            <el-input v-model="ruleForm.code" />
                        </el-form-item>

                        <el-form-item prop="address" label-position="top">
                            <template #label>
                                <label class="text-sm font-medium text-gray-700">Địa chỉ</label>
                            </template>
                            <el-input v-model="ruleForm.address" />
                        </el-form-item>
                        <el-form-item prop="note" label-position="top">
                            <template #label>
                                <label class="text-sm font-medium text-gray-700">Ghi chú</label>
                            </template>
                            <el-input v-model="ruleForm.note" />
                        </el-form-item>

                        <el-form-item prop="status" label-position="top">
                            <template #label>
                                <label class="text-sm font-medium text-gray-700">Trạng thái</label>
                            </template>
                            <el-switch v-model="ruleForm.status" active-text="Kích hoạt"
                                inactive-text="Ngưng kích hoạt" />
                        </el-form-item>

                        <div class="phone-section">
                            <div class="flex items-center justify-between mb-3">
                                <label class="text-sm font-medium text-gray-700">Số điện thoại</label>
                                <el-button type="primary" size="small" :icon="Plus" @click="addPhone">
                                    Thêm số điện thoại
                                </el-button>
                            </div>

                            <div v-if="(ruleForm.phones ?? []).length === 0" class="text-gray-500 text-sm mb-3">
                                Chưa có số điện thoại nào. Nhấn "Thêm số điện thoại" để bắt đầu.
                            </div>

                            <div v-for="(phone, index) in ruleForm.phones ?? []" :key="index" class="flex gap-2 ">
                                <el-form-item :prop="`phones.${index}.phone`" :rules="phoneRules" class="flex-1 mb-0">
                                    <el-input v-model="phone.phone" :placeholder="`Số điện thoại ${index + 1}`" />
                                </el-form-item>

                                <el-form-item :prop="`phones.${index}.type`" class="w-40 mb-0">
                                    <el-select v-model="phone.type" placeholder="Loại">
                                        <el-option label="Di động" value="mobile" />
                                        <el-option label="Cố định" value="landline" />
                                        <el-option label="Fax" value="fax" />
                                        <el-option label="Khác" value="other" />
                                    </el-select>
                                </el-form-item>

                                <el-button type="danger" size="small" class="mt-[4.5px]"
                                    :disabled="(ruleForm.phones ?? []).length === 1" :icon="Delete" circle
                                    @click="removePhone(index)" />
                            </div>
                        </div>
                    </div>
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
<style scoped>
:deep(.el-drawer__footer) {
    padding-bottom: 10px !important;
    background-color: whitesmoke !important;
    border-top: 1px solid rgb(240, 240, 240) !important;
}

:deep(.el-drawer__header) {
    background-color: whitesmoke !important;
    border-bottom: 1px solid rgb(240, 240, 240) !important;
    padding-bottom: 20px;
    margin-bottom: 0 !important;
}
</style>