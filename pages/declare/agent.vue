<script setup lang="ts">
import type { DrawerProps, FormInstance, FormRules } from 'element-plus'
import type { AgentType, DTO_RQ_Agent } from '~/types/agentType';
import InputText from '~/components/inputs/inputText.vue';
import InputNumber from '~/components/inputs/inputNumber.vue';
import {
    Plus, Delete, Edit
} from '@element-plus/icons-vue'
import { createAgent, deleteAgent, getListAgentByCompany, updateAgent } from '~/api/agentAPI';
import type { UserActionType } from '~/types/userType';
definePageMeta({
    layout: 'default',
})
const useUserStore = userStore();
const drawer = ref(false)
const direction = ref<DrawerProps['direction']>('rtl')
const isEditMode = ref(false)
const currentEditId = ref<string | null>(null);
const loading = ref(false);
const agents = ref<AgentType[]>([]);
const ruleFormRef = ref<FormInstance>()
const isSubmitting = ref(false);
const ruleForm = ref<DTO_RQ_Agent>({
    name: null,
    code: null,
    phone: null,
    note: null,
    address: null,
    username: null,
    password: null,
    status: false,
    email: null,
    discount_ticket_type: '%',
    discount_ticket_value: 0,
    discount_goods_type: '%',
    discount_goods_value: 0,
})
const rules: FormRules = {
    name: [
        { required: true, message: 'Vui lòng nhập tên đại lý', trigger: 'blur' },
    ],
    code: [
        { required: true, message: 'Vui lòng nhập mã đại lý', trigger: 'blur' },
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
const handleEdit = (index: number, row: AgentType) => {
    console.log('handleEdit', row);
    isEditMode.value = true;
    currentEditId.value = row.id;
    ruleForm.value = { ...row };
    drawer.value = true;
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
const search = ref('')
const filterTableData = computed(() =>
    agents.value.filter(
        (data) =>
            !search.value ||
            (data.name ?? '').toLowerCase().includes(search.value.toLowerCase())
    )
)

const handleAdd = () => {
    isEditMode.value = false;
    currentEditId.value = null;
    ruleForm.value = {
        name: null,
        code: null,
        phone: null,
        note: null,
        address: null,
        username: null,
        password: null,
        status: false,
        email: null,
        discount_ticket_type: '%',
        discount_ticket_value: 0,
        discount_goods_type: '%',
        discount_goods_value: 0,
    };
    drawer.value = true;
};

const handleDelete = async (index: number, row: AgentType) => {
    loading.value = true;
    try {
        await ElMessageBox.confirm(
            'Bạn có chắc chắn muốn xóa đại lý này?',
            'Xác nhận xoá',
            {
                confirmButtonText: 'Xoá',
                cancelButtonText: 'Huỷ',
                type: 'warning',
            }
        );

        await deleteAgent(
            {
                id: useUserStore.id,
                username: useUserStore.username,
                full_name: useUserStore.full_name,
                company_id: useUserStore.company_id,
            } as UserActionType,
            row.id!);
        agents.value = agents.value.filter(agent => agent.id !== row.id);
        ElNotification({
            message: h('p', { style: 'color: teal' }, 'Xóa đại lý thành công!'),
            type: 'success',
        });
    } catch (error) {
        if (error !== 'cancel' && error !== 'close') {
            ElNotification({
                message: h('p', { style: 'color: red' }, 'Xóa đại lý thất bại!'),
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
                    const response = await updateAgent({
                        id: useUserStore.id,
                        username: useUserStore.username,
                        full_name: useUserStore.full_name,
                        company_id: useUserStore.company_id,
                    } as UserActionType,
                        ruleForm.value as DTO_RQ_Agent,
                        currentEditId.value 
                    );
                    if (response.success) {
                        ElNotification({
                            message: h('p', { style: 'color: teal' }, 'Cập nhật đại lý thành công!'),
                            type: 'success',
                        })
                        const index = agents.value.findIndex(agent => agent.id === currentEditId.value);
                        if (index !== -1) {
                            agents.value[index] = {
                                ...agents.value[index],
                                ...ruleForm.value
                            };
                        }
                    } else {
                        ElNotification({
                            message: h('p', { style: 'color: red' }, response.message || 'Cập nhật đại lý thất bại!'),
                            type: 'error',
                        });
                    }
                } else {
                    console.log(ruleForm);
                    const response = await createAgent(
                        {
                            id: useUserStore.id,
                            username: useUserStore.username,
                            full_name: useUserStore.full_name,
                            company_id: useUserStore.company_id,
                        } as UserActionType,
                        ruleForm.value as DTO_RQ_Agent
                    );
                    if (response.success) {
                        ElNotification({
                            message: h('p', { style: 'color: teal' }, 'Thêm đại lý mới thành công!'),
                            type: 'success',
                        })
                        if (response.result) {
                            agents.value.push(response.result);
                        }
                    } else {
                        ElNotification({
                            message: h('p', { style: 'color: red' }, response.message || 'Thêm đại lý thất bại!'),
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
const fetchListAgent = async () => {
    loading.value = true;
    try {
        const response = await getListAgentByCompany(useUserStore.company_id ?? '');
        if (response.result) {
            agents.value = response.result || [];
        } else {
            ElNotification({
                message: h('p', { style: 'color: red' }, response.message || 'Lấy danh sách đại lý thất bại!'),
                type: 'error',
            });
        }
    } catch (error) {
        ElNotification({
            message: h('p', { style: 'color: red' }, 'Đã xảy ra lỗi khi lấy danh sách đại lý!'),
            type: 'error',
        });
        console.error(error);
    } finally {
        loading.value = false;
    }
};
onMounted(() => {
    useUserStore.loadUserInfo();
    fetchListAgent();
});
</script>
<template>
    <section>
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">DANH SÁCH ĐẠI LÝ</h3>
            <el-button :icon="Plus" type="primary" @click="handleAdd">Thêm đại lý</el-button>
        </div>
        <el-table v-loading="loading" element-loading-text="Đang tải dữ liệu..." :data="filterTableData"
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
                    <span>{{ scope.row.discount_ticket_value }} ({{ scope.row.discount_ticket_type }})</span>
                </template>
            </el-table-column>
            <el-table-column label="Chiết khấu hàng hóa">
                <template #default="scope">
                    <span>{{ scope.row.discount_goods_value }} ({{ scope.row.discount_goods_type }})</span>
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
                            <InputText v-model="ruleForm.code" prop="code" label="Mã đại lý" />
                            <InputText v-model="ruleForm.phone" prop="phone" label="Số điện thoại liên lạc" />
                            <InputText v-model="ruleForm.email" prop="email" label="Email" />
                            <InputText v-model="ruleForm.address" prop="address" label="Địa chỉ" />
                            <InputText v-model="ruleForm.note" prop="note" label="Ghi chú" />
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
                                <InputNumber v-model="ruleForm.discount_ticket_value" prop="discount_ticket_value"
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
                                        <el-switch v-model="ruleForm.discount_ticket_type" size="large" active-value="%"
                                            inactive-value="VND" active-text="Theo %" inactive-text="VNĐ" class="ml-4"
                                            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949" />
                                        <span class="text-sm font-medium text-gray-700 min-w-[60px]">
                                            Theo phần trăm (%)
                                        </span>
                                    </div>
                                </form-item>
                            </div>

                            <div class="mb-6">
                                <InputNumber v-model="ruleForm.discount_goods_value" prop="discount_goods_value"
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
                                        <el-switch v-model="ruleForm.discount_goods_type" size="large" active-value="%"
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
                    <el-button :loading="isSubmitting" type="primary" @click="submitForm(ruleFormRef)">Lưu</el-button>
                </div>
            </template>
        </el-drawer>
    </section>
</template>
