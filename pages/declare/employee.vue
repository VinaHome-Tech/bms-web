<script setup lang="ts">
import {
    Plus, Operation
} from '@element-plus/icons-vue'
import type { DrawerProps, FormInstance, FormRules } from 'element-plus'
import type { DTO_RQ_Employee, EmployeeType } from '~/types/employeeType';
import InputText from '~/components/inputs/inputText.vue';
import InputDate from '~/components/inputs/inputDate.vue';
import Select from '~/components/inputs/select.vue';
import { changePasswordStaff, createEmployee, deleteEmployee, getListEmployeeByCompany, updateEmployee } from '~/api/employeeAPI';
import { format } from 'date-fns'
import type { UserActionType } from '~/types/userType';
import type { ChangePasswordStaffType } from '~/types/accountType';
definePageMeta({
    layout: 'default',
})
const useUserStore = userStore();
const drawer = ref(false)
const direction = ref<DrawerProps['direction']>('rtl')
const isEditMode = ref(false)
const currentEditId = ref<string | null>(null);
const loading = ref(false);
const ruleFormRef = ref<FormInstance>()
const employees = ref<EmployeeType[]>([]);
const search = ref('')
const isSubmitting = ref(false);
const filterTableData = computed(() =>
    employees.value.filter(
        (data) =>
            !search.value ||
            (data.name ?? '').toLowerCase().includes(search.value.toLowerCase()) ||
            (data.phone ?? '').toLowerCase().includes(search.value.toLowerCase())
    )
)
const ruleForm = ref<DTO_RQ_Employee>({
    username: null,
    password: null,
    phone: null,
    name: null,
    email: null,
    address: null,
    date_of_birth: null,
    gender: null,
    status: false,
    role: null,
    accept_app: {
        bms: false,
        cms: false,
        driver: false,
    }
});
const rules: FormRules = {
    username: [
        { required: true, message: 'Vui lòng nhập tên đăng nhập', trigger: 'blur' },
        { min: 3, max: 20, message: 'Tên đăng nhập phải từ 3 đến 20 ký tự', trigger: 'blur' }
    ],
    password: [
        { required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' },
        { min: 6, max: 20, message: 'Mật khẩu phải từ 6 đến 20 ký tự', trigger: 'blur' }
    ],
    name: [
        { required: true, message: 'Vui lòng nhập họ và tên', trigger: 'blur' },
        { min: 2, max: 50, message: 'Họ và tên phải từ 2 đến 50 ký tự', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' },
        { pattern: /^0[0-9]{9}$/, message: 'Số điện thoại không hợp lệ', trigger: ['blur', 'change'] }
    ],
    role: [
        { required: true, message: 'Vui lòng chọn vai trò', trigger: 'change' }
    ],
    gender: [
        { required: true, message: 'Vui lòng chọn giới tính', trigger: 'change' }
    ],
};
const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
    drawer.value = false
}
const cancelClick = () => {
    drawer.value = false;
    ruleFormRef.value?.resetFields();
}
const handleAdd = () => {
    isEditMode.value = false;
    currentEditId.value = null;
    Object.assign(ruleForm, {
        username: null,
        password: null,
        phone: null,
        name: null,
        email: null,
        address: null,
        date_of_birth: null,
        gender: null,
        status: false,
        role: null,
        accept_app: {
            bms: false,
            cms: false,
            driver: false,
        }
    });
    drawer.value = true;
}
const handleEdit = (index: number, row: EmployeeType) => {
    isEditMode.value = true;
    currentEditId.value = row.id != null ? String(row.id) : null;
    ruleForm.value = { ...row, password: null };
    drawer.value = true;
};
const handleUnlock = async (index: number, row: EmployeeType) => {
    try {

        // await updateEmployee(
        //     {
        //         id: useUserStore.id,
        //         username: useUserStore.username,
        //         full_name: useUserStore.full_name,
        //         company_id: useUserStore.company_id,
        //     } as UserActionType,
        //     { ...row, status: true },
        //     row.id!
        // );
        row.status = true;
        ElNotification({
            message: h('p', { style: 'color: teal' }, 'Mở khoá tài khoản thành công!'),
            type: 'success',
        });
    } catch {
        ElNotification({
            message: h('p', { style: 'color: red' }, 'Mở khoá tài khoản thất bại!'),
            type: 'error',
        });
    }
};

const handleLock = async (index: number, row: EmployeeType) => {
    try {
        // await updateEmployee(
        //     {
        //         id: useUserStore.id,
        //         username: useUserStore.username,
        //         full_name: useUserStore.full_name,
        //         company_id: useUserStore.company_id,
        //     } as UserActionType,
        //     { ...row, status: false },
        //     row.id!
        // );
        row.status = false;
        ElNotification({
            message: h('p', { style: 'color: teal' }, 'Khoá tài khoản thành công!'),
            type: 'success',
        });
    } catch {
        ElNotification({
            message: h('p', { style: 'color: red' }, 'Khoá tài khoản thất bại!'),
            type: 'error',
        });
    }
};

const dialogChangePasswordStaff = ref(false);
const selectedUserId = ref<string | null>(null);
const loadingChangePassword = ref(false);
const handleChangePassword = (index: number, row: EmployeeType) => {
    console.log(row);
    dialogChangePasswordStaff.value = true;
    selectedUserId.value = row.id;
};
const handleSavePassword = async (data: ChangePasswordStaffType) => {
    loadingChangePassword.value = true;
    try { 
        const response = await changePasswordStaff(data);
        if (response.success) {
            ElNotification({
                message: h('p', { style: 'color: teal' }, 'Đổi mật khẩu thành công!'),
                type: 'success',
            });
        } else {
            ElNotification({
                message: h('p', { style: 'color: red' }, response.message || 'Đổi mật khẩu thất bại!'),
                type: 'error',
            });
        }
    } catch (error) {
        console.error('Error changing password:', error);
        ElNotification({
            message: h('p', { style: 'color: red' }, 'Đã xảy ra lỗi khi đổi mật khẩu!'),
            type: 'error',
        });
    } finally {
        loadingChangePassword.value = false;
        dialogChangePasswordStaff.value = false;
        selectedUserId.value = null;
    }
}
const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    isSubmitting.value = true;
    await formEl.validate(async (valid) => {
        if (valid) {
            try {
                if (isEditMode.value && currentEditId.value !== null) {

                    console.log(ruleForm);
                    const response = await updateEmployee({
                        id: useUserStore.id,
                        username: useUserStore.username,
                        full_name: useUserStore.full_name,
                        company_id: useUserStore.company_id,
                    } as UserActionType,
                        ruleForm.value as DTO_RQ_Employee,
                        currentEditId.value);
                    if (response.success) {
                        ElNotification({
                            message: h('p', { style: 'color: teal' }, 'Cập nhật tài khoản thành công!'),
                            type: 'success',
                        })
                        const index = employees.value.findIndex(employee => employee.id === currentEditId.value);
                        if (index !== -1) {
                            employees.value[index] = {
                                ...employees.value[index],
                                ...ruleForm.value,
                                gender: ruleForm.value.gender ?? '',
                                role: ruleForm.value.role ?? '',
                            };
                        }
                    } else {
                        ElNotification({
                            message: h('p', { style: 'color: red' }, response.message || 'Cập nhật tài khoản thất bại!'),
                            type: 'error',
                        });
                    }
                } else {
                    console.log(ruleForm);
                    const response = await createEmployee(
                        {
                            id: useUserStore.id,
                            username: useUserStore.username,
                            full_name: useUserStore.full_name,
                            company_id: useUserStore.company_id,
                            company_code: useUserStore.company_code,
                        } as UserActionType,
                        ruleForm.value as DTO_RQ_Employee
                    );
                    if (response.success) {
                        ElNotification({
                            message: h('p', { style: 'color: teal' }, 'Thêm tài khoản mới thành công!'),
                            type: 'success',
                        })
                        if (response.result) {
                            employees.value.push(response.result);
                        }
                    } else {
                        ElNotification({
                            message: h('p', { style: 'color: red' }, response.message || 'Thêm tài khoản mới thất bại!'),
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
const fetchListEmployees = async () => {
    loading.value = true;
    try {
        const response = await getListEmployeeByCompany(useUserStore.company_id || '');
        if (response.result) {
            employees.value = response.result;
            console.log('Danh sách nhân viên:', employees.value);
        } else {
            ElNotification({
                message: h('p', { style: 'color: red' }, 'Không tìm thấy nhân viên nào!'),
                type: 'warning',
            });
        }
    } catch (error) {
        ElNotification({
            message: h('p', { style: 'color: red' }, 'Đã xảy ra lỗi khi tải danh sách nhân viên!'),
            type: 'error',
        });
        console.error(error);
    } finally {
        loading.value = false;
    }
};
const handleDelete = async (index: number, row: EmployeeType) => {
    try {
        await ElMessageBox.confirm(
            'Bạn có chắc chắn muốn xóa tài khoản này?',
            'Xác nhận xoá',
            {
                confirmButtonText: 'Xoá',
                cancelButtonText: 'Huỷ',
                type: 'warning',
            }
        );

        await deleteEmployee({
            id: useUserStore.id,
            username: useUserStore.username,
            full_name: useUserStore.full_name,
            company_id: useUserStore.company_id,
        } as UserActionType,
            row.id!);
        ElNotification({
            message: h('p', { style: 'color: teal' }, 'Xóa tài khoản thành công!'),
            type: 'success',
        });
        employees.value = employees.value.filter(employee => employee.id !== row.id);
    } catch (error) {
        if (error !== 'cancel' && error !== 'close') {
            ElNotification({
                message: h('p', { style: 'color: red' }, 'Xóa tài khoản thất bại!'),
                type: 'error',
            });
            console.error(error);
        }
    }
};
onMounted(() => {
    useUserStore.loadUserInfo();
    fetchListEmployees();
});
const categoryGenderOptions = [
    { label: 'Nam', value: 'male' },
    { label: 'Nữ', value: 'female' },
    { label: 'Khác', value: 'other' }
]
const categoryRoleOptions = [
    { label: 'Quản trị viên', value: 'ADMIN' },
    { label: 'Nhân viên', value: 'STAFF' },
    { label: 'Tài xế', value: 'DRIVER' },
    { label: 'Phụ xe', value: 'ASSISTANT' },
    { label: 'Đại lý', value: 'AGENT' }
];
</script>
<template>
    <section>
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">DANH SÁCH NHÂN VIÊN</h3>
            <el-button :icon="Plus" type="primary" @click="handleAdd">Thêm nhân viên</el-button>
        </div>
        <el-table v-loading="loading" element-loading-text="Đang tải dữ liệu..." :data="filterTableData"
            style="width: 100%">
            <el-table-column type="index" label="STT" width="50" />
            <el-table-column label="Tài khoản">
                <template #default="scope">
                    <span class="font-semibold">{{ scope.row.name }}</span>
                    <br />
                    <span class="text-gray-500 text-sm">{{ scope.row.username }}</span>
                </template>
            </el-table-column>
            <el-table-column label="Thông tin liên hệ" width="250">
                <template #default="scope">
                    <span class="text-gray-500">{{ scope.row.phone }}</span>
                    <br />
                    <span class="text-gray-500">{{ scope.row.email }}</span>
                </template>
            </el-table-column>
            <el-table-column label="Thông tin cá nhân">
                <template #default="scope">
                    <el-tag
                        :type="scope.row.gender === 'male' ? 'success' : scope.row.gender === 'female' ? 'danger' : 'info'"
                        disable-transitions>
                        {{
                            scope.row.gender === 'male'
                                ? 'Nam'
                                : scope.row.gender === 'female'
                                    ? 'Nữ'
                                    : 'Khác'
                        }}
                    </el-tag>

                    <br />
                    <el-tag class="text-gray-500" v-if="scope.row.date_of_birth">{{ scope.row.date_of_birth ? format(new
                        Date(scope.row.date_of_birth),
                        'dd/MM/yyyy') : '' }}</el-tag>
                </template>
            </el-table-column>

            <el-table-column label="Trạng thái" prop="status">
                <template #default="scope">
                    <el-tag :type="scope.row.status ? 'success' : 'danger'">
                        {{ scope.row.status ? 'Kích hoạt' : 'Ngưng kích hoạt' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="Vai trò">
                <template #default="scope">
                    <el-tag :type="scope.row.role === 'ADMIN' ? 'danger'
                        : scope.row.role === 'STAFF' ? 'warning'
                            : scope.row.role === 'DRIVER' ? 'success'
                                : scope.row.role === 'ASSISTANT' ? 'info'
                                    : undefined">
                        {{ scope.row.role === 'ADMIN' ? 'Quản trị viên'
                            : scope.row.role === 'STAFF' ? 'Nhân viên'
                                : scope.row.role === 'DRIVER' ? 'Tài xế'
                                    : scope.row.role === 'ASSISTANT' ? 'Phụ xe'
                                            : 'Khác' }}
                    </el-tag>

                </template>
            </el-table-column>


            <el-table-column label="Quyền truy cập" align="center">
                <template #default="scope">
                    <div class="flex flex-wrap gap-1 justify-center">
                        <el-tag v-if="scope.row.accept_app?.bms" type="success" size="small">BMS</el-tag>
                        <el-tag v-if="scope.row.accept_app?.cms" type="success" size="small">CMS</el-tag>
                        <el-tag v-if="scope.row.accept_app?.ams" type="success" size="small">AMS</el-tag>
                        <el-tag v-if="scope.row.accept_app?.driver" type="success" size="small">Driver</el-tag>
                        <span v-if="!scope.row.accept_app?.bms && !scope.row.accept_app?.cms &&
                            !scope.row.accept_app?.ams && !scope.row.accept_app?.driver" class="text-gray-400 text-xs">
                            Không có quyền
                        </span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="Địa chỉ" prop="address" />

            <el-table-column align="right">

                <template #header>
                    <el-input v-model="search" placeholder="Tìm nhân viên" />
                </template>
                <template #default="scope">
                    <el-dropdown placement="bottom">
                        <el-button circle :icon="Operation" />
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item v-if="!scope.row.status"
                                    @click="handleUnlock(scope.$index, scope.row)">Mở khoá tài khoản</el-dropdown-item>
                                <el-dropdown-item v-if="scope.row.status"
                                    @click="handleLock(scope.$index, scope.row)">Khoá tài khoản</el-dropdown-item>
                                <el-dropdown-item @click="handleChangePassword(scope.$index, scope.row)">Đổi mật
                                    khẩu</el-dropdown-item>
                                <el-dropdown-item @click="handleEdit(scope.$index, scope.row)">Chỉnh sửa tài
                                    khoản</el-dropdown-item>
                                <el-dropdown-item @click="handleDelete(scope.$index, scope.row)">
                                    <span class="text-red-500">Xoá tài khoản</span>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
            </el-table-column>
        </el-table>
        <div class="flex justify-end mt-4">
            <el-pagination background layout="prev, pager, next" :total="100" />
        </div>

        <el-drawer v-model="drawer" :direction="direction" :before-close="cancelClick" size="50%">
            <template #header>
                <div class="font-semibold text-lg text-black">{{ isEditMode ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên'
                }}</div>
            </template>
            <template #default>

                <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="auto">
                    <el-row>
                        <el-col :span="12" class="pr-5">
                            <h2 class="text-gray-500 font-medium mb-5">THÔNG TIN CÁ NHÂN</h2>

                            <InputText v-model="ruleForm.name" prop="name" label="Họ và tên" />
                            <InputText v-model="ruleForm.phone" prop="phone" label="Số điện thoại" />
                            <InputText v-model="ruleForm.email" prop="email" label="Email" />
                            <InputText v-model="ruleForm.address" prop="address" label="Địa chỉ" />
                            <InputDate v-model="ruleForm.date_of_birth" prop="date_of_birth" label="Ngày sinh"
                                placeholder="Chọn ngày sinh" type="date" format="DD/MM/YYYY" value-format="YYYY-MM-DD"
                                clearable />
                            <Select v-model="ruleForm.gender" prop="gender" label="Giới tính"
                                :options="categoryGenderOptions" clearable />
                        </el-col>
                        <el-col :span="12" class="pl-5">
                            <h2 class="text-gray-500 font-medium mb-5">THÔNG TIN TÀI KHOẢN</h2>
                            <InputText v-model="ruleForm.username" prop="username" label="Tên đăng nhập" />
                            <InputText v-if="!isEditMode" v-model="ruleForm.password" prop="password" label="Mật khẩu"
                                type="password" />

                            <Select v-model="ruleForm.role" prop="role" label="Vai trò" :options="categoryRoleOptions"
                                clearable />
                            <el-form-item prop="status" label-position="top">
                                <template #label>
                                    <span class="text-sm font-medium text-gray-700">Trạng thái</span>
                                </template>
                                <el-switch v-model="ruleForm.status" active-text="Kích hoạt"
                                    inactive-text="Ngưng kích hoạt" size="large" />
                            </el-form-item>
                            <h2 class="text-gray-500 font-medium mb-5">CÁC ỨNG DỤNG CẦN TRUY CẬP</h2>
                            <el-form-item prop="accept_app.bms" label-position="top">
                                <template #label>
                                    <span class="text-sm font-medium text-gray-700">Phần mềm Quản lý bán vé</span>
                                </template>
                                <el-switch v-model="ruleForm.accept_app.bms" size="large" />
                            </el-form-item>
                            <el-form-item prop="accept_app.cms" label-position="top">
                                <template #label>
                                    <span class="text-sm font-medium text-gray-700">Phần mềm Quản lý hàng hóa</span>
                                </template>
                                <el-switch v-model="ruleForm.accept_app.cms" size="large" />
                            </el-form-item>
                            <el-form-item prop="accept_app.driver" label-position="top">
                                <template #label>
                                    <span class="text-sm font-medium text-gray-700">Ứng dụng Tài xế đón trả khách</span>
                                </template>
                                <el-switch v-model="ruleForm.accept_app.driver" size="large" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
            </template>
            <template #footer>
                <div style="flex: auto">
                    <el-button @click="resetForm(ruleFormRef)">Thoát</el-button>
                    <el-button :loading="isSubmitting" type="primary" @click="submitForm(ruleFormRef)">Lưu</el-button>
                </div>
            </template>
        </el-drawer>

        <DialogChangePasswordStaffDialog
            v-model="dialogChangePasswordStaff"
            :loading="loadingChangePassword"
            :user-id="selectedUserId"
            @save="handleSavePassword"
        />
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