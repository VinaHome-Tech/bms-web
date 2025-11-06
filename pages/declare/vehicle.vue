<script setup lang="ts">
import {
    Plus, Delete, Edit, Checked
} from '@element-plus/icons-vue'
import InputText from '~/components/inputs/inputText.vue';
import Select from '~/components/inputs/select.vue';
import InputDate from '~/components/inputs/inputDate.vue';
import type { DrawerProps, FormRules } from 'element-plus'
import { format } from 'date-fns'
import { useVehicleManagement } from '~/composables/vehicle/useVehicleManagement';
definePageMeta({
    layout: 'default',
})
const {
    drawer,
    isEditMode,
    vehicles,
    loadingData,
    loadingSubmit,
    ruleFormRef,
    ruleForm,
    handleAdd,
    handleEdit,
    handleDelete,
    submitForm,
    resetForm,
    cancelClick,
    fetchListVehicles,
} = useVehicleManagement();
const useUserStore = userStore();

const direction = ref<DrawerProps['direction']>('rtl')
const rules = ref<FormRules>({
    license_plate: [
        { required: true, message: 'Vui lòng nhập biển số xe', trigger: 'blur' },
    ],
})

const search = ref('')
const filterTableData = computed(() =>
    vehicles.value.filter(
        (data) =>
            !search.value ||
            (data.license_plate ?? '').toLowerCase().includes(search.value.toLowerCase()) ||
            (data.phone ?? '').toLowerCase().includes(search.value.toLowerCase())
    )
)




const optionsStatus = [
    { label: 'Đang hoạt động', value: 1 },
    { label: 'Ngưng hoạt động', value: 2 },
    { label: 'Bảo trì', value: 3 },
    { label: 'Đã bán', value: 4 },
];
const getStatusTagType = (status: number): 'success' | 'danger' | 'warning' | 'info' | 'primary' => {
    switch (status) {
        case 1: // Đang hoạt động
            return 'success';
        case 2: // Ngưng hoạt động
            return 'danger';
        case 3: // Bảo trì
            return 'warning';
        case 4: // Đã bán
            return 'info';
        default:
            return 'primary';
    }
};
const optionsBrand = [
    { label: 'Thaco', value: 'Thaco' },
    { label: 'Kim Long', value: 'Kim Long' },
    { label: 'Samco', value: 'Samco' },
    { label: 'Tracomeco', value: 'Tracomeco' },
    { label: 'Hyundai', value: 'Hyundai' },
    { label: 'KIA', value: 'KIA' },
    { label: 'Mercedes-Benz', value: 'Mercedes-Benz' },
    { label: 'Haeco', value: 'Haeco' },
    { label: 'Daewoo', value: 'Daewoo' },
    { label: 'Khác', value: 'Khác' }
];
onMounted(async () => {
    await useUserStore.loadUserInfo();
    await fetchListVehicles(useUserStore.company_id ?? '');
});
</script>
<template>
    <section>
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">DANH SÁCH PHƯƠNG TIỆN</h3>
            <el-button :icon="Plus" type="primary" @click="handleAdd">Thêm phương tiện</el-button>
        </div>

        <el-table v-loading="loadingData" element-loading-text="Đang tải dữ liệu..." :data="filterTableData"
            style="width: 100%">
            <el-table-column type="index" label="STT" width="50" />
            <el-table-column label="Biển số xe" prop="license_plate" />
            <el-table-column label="Số điện thoại" prop="phone" />
            <el-table-column label="Trạng thái" prop="status">
                <template #default="{ row }">
                    <el-tag :type="getStatusTagType(row.status)" effect="light">
                        {{optionsStatus.find(option => option.value === row.status)?.label || 'Không rõ'}}
                    </el-tag>
                </template>
            </el-table-column>

            <el-table-column label="Màu xe" prop="color">
                <template #default="scope">
                    {{ scope.row.color }}
                </template>
            </el-table-column>
            <el-table-column label="Hãng xe" prop="brand">
                <template #default="scope">
                    <span v-if="scope.row.brand">
                        {{ scope.row.brand }}
                    </span>
                </template>
            </el-table-column>

            <el-table-column label="Hạn bảo dưỡng" prop="maintenance_due">
                <template #default="{ row }">
                    {{
                        row.maintenance_due
                            ? format(new Date(row.maintenance_due), 'dd/MM/yyyy')
                            : ''
                    }}
                </template>
            </el-table-column>

            <el-table-column label="Hạn đăng kiểm" prop="registration_expiry">
                <template #default="{ row }">
                    {{
                        row.registration_expiry
                            ? format(new Date(row.registration_expiry), 'dd/MM/yyyy')
                            : ''
                    }}
                </template>
            </el-table-column>

            <el-table-column align="right">
                <template #header>
                    <el-input v-model="search" placeholder="Tìm phương tiện" />
                </template>
                <template #default="scope">
                    <el-button type="primary" :icon="Edit" circle @click="handleEdit(scope.$index, scope.row)" />
                    <el-button circle type="danger" :icon="Delete" @click="handleDelete(scope.$index, scope.row)" />

                </template>
            </el-table-column>
        </el-table>

        <el-drawer v-model="drawer" :direction="direction" :before-close="cancelClick">
            <template #header>
                <div class="font-semibold text-lg text-black">{{ isEditMode ? 'Chỉnh sửa phương tiện' : 'Thêm phương tiện' }}</div>
            </template>
            <template #default>

                <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="auto">
                    <div>
                        <h2 class="text-gray-500 font-medium mb-5">THÔNG TIN CHUNG</h2>
                        <InputText v-model="ruleForm.license_plate" prop="license_plate" label="Biển số xe" />
                        <InputText v-model="ruleForm.phone" prop="phone" label="Số điện thoại xe" />

                        <Select v-model="ruleForm.status" prop="status" label="Trạng thái" :options="optionsStatus"
                            clearable />
                        <h2 class="text-gray-500 font-medium mb-5">THÔNG SỐ KỸ THUẬT</h2>
                        <InputText v-model="ruleForm.color" prop="color" label="Màu xe" />
                        <Select v-model="ruleForm.brand" prop="brand" label="Hãng xe" :options="optionsBrand"
                            clearable />
                        <InputText v-model="ruleForm.engine_number" prop="engine_number" label="Số máy" />
                        <InputText v-model="ruleForm.frame_number" prop="frame_number" label="Số khung" />
                        <InputDate v-model="ruleForm.registration_expiry" prop="registration_expiry"
                            label="Hạn đăng kiểm" format="DD/MM/YYYY" value-format="YYYY-MM-DD" />
                        <InputDate v-model="ruleForm.maintenance_due" prop="maintenance_due" label="Hạn bảo dưỡng"
                            format="DD/MM/YYYY" value-format="YYYY-MM-DD" />
                    </div>
                </el-form>
            </template>
            <template #footer>
                <div style="flex: auto">
                    <el-button @click="resetForm(ruleFormRef)">Thoát</el-button>
                    <el-button type="primary" :icon="Checked" :loading="loadingSubmit" @click="submitForm(ruleFormRef)">
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