<script setup lang="ts">
import {
    Plus, Delete, Edit
} from '@element-plus/icons-vue'
import InputText from '~/components/inputs/inputText.vue';
import Select from '~/components/inputs/select.vue';
import InputDate from '~/components/inputs/inputDate.vue';
import type { DrawerProps, FormInstance, FormRules } from 'element-plus'
import type { DTO_RQ_Vehicle, VehicleType } from '~/types/vehicleType';
import { format } from 'date-fns'
import { createVehicle, deleteVehicle, getListVehicleByCompany, updateVehicle } from '~/api/vehicleAPI';
import type { UserActionType } from '~/types/userType';
definePageMeta({
    layout: 'default',
})
const useUserStore = userStore();
const drawer = ref(false)
const direction = ref<DrawerProps['direction']>('rtl')
const isEditMode = ref(false)
const currentEditId = ref<number | null>(null);
const loading = ref(false);
const ruleFormRef = ref<FormInstance>()
const isSubmitting = ref(false);
const vehicles = ref<VehicleType[]>([])
const ruleForm = ref<DTO_RQ_Vehicle>({
    license_plate: null,
    engine_number: null,
    frame_number: null,
    status: null,
    color: null,
    brand: null,
    phone: null,
    registration_expiry: null,
    maintenance_due: null,
})
const rules = ref<FormRules>({
    license_plate: [
        { required: true, message: 'Vui lòng nhập biển số xe', trigger: 'blur' },
    ],
})
const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
    drawer.value = false
}
const cancelClick = () => {
    drawer.value = false;
    ruleFormRef.value?.resetFields();
}
const search = ref('')
const filterTableData = computed(() =>
    vehicles.value.filter(
        (data) =>
            !search.value ||
            (data.license_plate ?? '').toLowerCase().includes(search.value.toLowerCase())
    )
)
const handleAdd = () => {
    isEditMode.value = false;
    currentEditId.value = null;
    Object.assign(ruleForm.value = {
        license_plate: null,
        engine_number: null,
        frame_number: null,
        status: null,
        color: null,
        brand: null,
        phone: null,
        registration_expiry: null,
        maintenance_due: null,
    });
    drawer.value = true;
};
const handleEdit = (index: number, row: VehicleType) => {
    isEditMode.value = true;
    currentEditId.value = row.id;
    ruleForm.value = { ...row };
    drawer.value = true;
};
const handleDelete = async (index: number, row: VehicleType) => {
    loading.value = true;
    try {
        await ElMessageBox.confirm(
            'Bạn có chắc chắn muốn xóa phương tiện này?',
            'Xác nhận xoá',
            {
                confirmButtonText: 'Xoá',
                cancelButtonText: 'Huỷ',
                type: 'warning',
            }
        );

        const response = await deleteVehicle({
            id: useUserStore.id,
            username: useUserStore.username,
            full_name: useUserStore.full_name,
            company_id: useUserStore.company_id,
        } as UserActionType,
            row.id!);
        if (response.success) {
            ElNotification({
                message: h('p', { style: 'color: teal' }, 'Xóa phương tiện thành công!'),
                type: 'success',
            });
            vehicles.value = vehicles.value.filter(vehicle => vehicle.id !== row.id);
        } else {
            ElNotification({
                message: h('p', { style: 'color: red' }, response.message || 'Xóa phương tiện thất bại!'),
                type: 'error',
            });
            return;
        }
    } catch (error) {
        if (error !== 'cancel' && error !== 'close') {
            ElNotification({
                message: h('p', { style: 'color: red' }, 'Xóa phương tiện thất bại!'),
                type: 'error',
            });
            console.error(error);
        }
    } finally {
        loading.value = false;
    }
};
const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    isSubmitting.value = true;
    await formEl.validate(async (valid) => {
        if (valid) {
            try {
                if (isEditMode.value && currentEditId.value !== null) {
                    console.log(ruleForm);
                    const response = await updateVehicle(
                        {
                            id: useUserStore.id,
                            username: useUserStore.username,
                            full_name: useUserStore.full_name,
                            company_id: useUserStore.company_id,
                        } as UserActionType,
                        ruleForm.value as DTO_RQ_Vehicle,
                        currentEditId.value
                    );
                    if (response.success) {
                        ElNotification({
                            message: h('p', { style: 'color: teal' }, 'Cập nhật phương tiện thành công!'),
                            type: 'success',
                        })
                        if (response.result) {
                            const index = vehicles.value.findIndex(vehicle => vehicle.id === currentEditId.value);
                            if (index !== -1) {
                                vehicles.value[index] = {
                                    ...vehicles.value[index],
                                    ...ruleForm.value
                                };
                            }
                        }
                    } else {
                        ElNotification({
                            message: h('p', { style: 'color: red' }, response.message || 'Cập nhật phương tiện thất bại!'),
                            type: 'error',
                        });
                    }
                } else {
                    console.log(ruleForm);
                    const response = await createVehicle(
                        {
                            id: useUserStore.id,
                            username: useUserStore.username,
                            full_name: useUserStore.full_name,
                            company_id: useUserStore.company_id,
                        } as UserActionType,
                        ruleForm.value as DTO_RQ_Vehicle
                    );
                    if (response.success) {
                        ElNotification({
                            message: h('p', { style: 'color: teal' }, 'Thêm phương tiện mới thành công!'),
                            type: 'success',
                        })
                        if (response.result) {
                            vehicles.value.push(response.result);
                        }
                    } else {
                        ElNotification({
                            message: h('p', { style: 'color: red' }, response.message || 'Thêm phương tiện thất bại!'),
                            type: 'error',
                        });
                    }
                }
                drawer.value = false;
            } catch (error) {
                ElNotification({
                    message: h('p', { style: 'color: red' }, 'Đã xảy ra lỗi. Vui lòng thử lại!'),
                    type: 'error',
                });
                console.error(error);
            } finally {
                isSubmitting.value = false;
            }
        } else {
            console.log('error submit!');
            ElNotification({
                message: h('p', { style: 'color: red' }, 'Vui lòng kiểm tra lại thông tin đã nhập!'),
                type: 'error',
            });
            isSubmitting.value = false;
        }
    });
};
const fetchListVehicle = async () => {
    loading.value = true;
    try {
        const response = await getListVehicleByCompany(useUserStore.company_id || '');
        if (response.success) {
            vehicles.value = response.result || [];
        } else {
            ElNotification({
                message: h('p', { style: 'color: red' }, response.message || 'Không tìm thấy phương tiện nào!'),
                type: 'error',
            });
        }
    } catch (error) {
        ElNotification({
            message: h('p', { style: 'color: red' }, 'Đã xảy ra lỗi khi tải dữ liệu phương tiện!'),
            type: 'error',
        });
        console.error(error);
    } finally {
        loading.value = false;
    }
};
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
onMounted(() => {
    useUserStore.loadUserInfo();
    fetchListVehicle();
});
</script>
<template>
    <section>
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">DANH SÁCH PHƯƠNG TIỆN</h3>
            <el-button :icon="Plus" type="primary" @click="handleAdd">Thêm phương tiện</el-button>
        </div>

        <el-table v-loading="loading" element-loading-text="Đang tải dữ liệu..." :data="filterTableData"
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
                    <el-button type="primary" @click="submitForm(ruleFormRef)">Lưu</el-button>
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