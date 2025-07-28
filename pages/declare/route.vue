<script setup lang="ts">
import {
    Plus, Delete, Edit, ArrowUp, ArrowDown
} from '@element-plus/icons-vue'
import type { DrawerProps, FormInstance, FormRules } from 'element-plus'
import { createRoute, deleteRoute, getListRouteByCompany, updateRoute, updateRouteOrder } from '~/api/routeAPI';
import type { DTO_RQ_Route, RouteType } from '~/types/routeType';
import InputText from '~/components/inputs/inputText.vue';
import InputNumber from '~/components/inputs/inputNumber.vue';
import { formatCurrency } from '~/lib/formatCurrency';
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
const routes = ref<RouteType[]>([]);
const rules = reactive<FormRules>({
    route_name: [
        { required: true, message: 'Vui lòng nhập tên tuyến', trigger: 'blur' },
        { min: 2, max: 50, message: 'Tên tuyến phải từ 2 đến 50 ký tự', trigger: 'blur' }
    ],
    base_price: [
        { required: true, message: 'Vui lòng nhập giá cơ bản', trigger: 'blur' }
    ],
    short_name: [
        { required: true, message: 'Vui lòng nhập tên tuyến rút gọn', trigger: 'blur' },
        { min: 1, max: 20, message: 'Tên rút gọn phải từ 1 đến 20 ký tự', trigger: 'blur' }
    ],
});
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<DTO_RQ_Route>({
    route_name: null,
    short_name: null,
    route_name_e_ticket: null,
    base_price: null,
    e_ticket_price: null,
    note: null,
    status: false,
    distance: null,
    journey: null,
});
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
        route_name: null,
        short_name: null,
        route_name_e_ticket: null,
        base_price: null,
        e_ticket_price: null,
        note: null,
        status: false,
        distance: null,
        journey: null,
    });
    drawer.value = true;
};
const search = ref('')
const filterTableData = computed(() =>
    routes.value.filter(
        (data) =>
            !search.value ||
            (data.route_name ?? '').toLowerCase().includes(search.value.toLowerCase())
    )
)
const handleEdit = (index: number, row: RouteType) => {
    isEditMode.value = true;
    currentEditId.value = row.id;
    Object.assign(ruleForm, { ...row });
    drawer.value = true;
};
const handleDelete = async (index: number, row: RouteType) => {
    loading.value = true;
    try {
        await ElMessageBox.confirm(
            'Bạn có chắc chắn muốn xóa tuyến này?',
            'Xác nhận xoá',
            {
                confirmButtonText: 'Xoá',
                cancelButtonText: 'Huỷ',
                type: 'warning',
            }
        );

        const response = await deleteRoute({
            id: useUserStore.id,
            username: useUserStore.username,
            full_name: useUserStore.full_name,
            company_id: useUserStore.company_id,
        } as UserActionType,
            row.id!
        );
        if (response.success) {
            routes.value = routes.value.filter(route => route.id !== row.id);
            routes.value.forEach((route, idx) => {
                route.display_order = idx + 1;
            });
            ElNotification({
                message: h('p', { style: 'color: teal' }, 'Xóa tuyến thành công!'),
                type: 'success',
            });
        } else {
            ElNotification({
                message: h('p', { style: 'color: red' }, response.message || 'Xóa tuyến thất bại!'),
                type: 'error',
            });
            return;
        }
    } catch (error) {
        if (error !== 'cancel' && error !== 'close') {
            ElNotification({
                message: h('p', { style: 'color: red' }, 'Xóa tuyến thất bại!'),
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
    await formEl.validate(async (valid) => {
        if (valid) {
            try {
                if (isEditMode.value && currentEditId.value !== null) {

                    console.log(ruleForm);
                    const response = await updateRoute(
                        {
                            id: useUserStore.id,
                            username: useUserStore.username,
                            full_name: useUserStore.full_name,
                            company_id: useUserStore.company_id,
                        } as UserActionType,
                        ruleForm as DTO_RQ_Route,
                        currentEditId.value
                    );
                    if (response.success) {
                        ElNotification({
                            message: h('p', { style: 'color: teal' }, 'Cập nhật tuyến thành công!'),
                            type: 'success',
                        })
                        const index = routes.value.findIndex(route => route.id === currentEditId.value);
                        if (index !== -1) {
                            routes.value[index] = {
                                ...routes.value[index],
                                ...ruleForm
                            };
                        }
                    }
                } else {
                    const response = await createRoute(
                        {
                            id: useUserStore.id,
                            username: useUserStore.username,
                            full_name: useUserStore.full_name,
                            company_id: useUserStore.company_id,
                        } as UserActionType,
                        ruleForm as DTO_RQ_Route
                    );
                    if (response.success) {
                        ElNotification({
                            message: h('p', { style: 'color: teal' }, 'Thêm tuyến mới thành công!'),
                            type: 'success',
                        })
                        if (response.result) {
                            routes.value.push(response.result);
                        }
                    } else {
                        ElNotification({
                            message: h('p', { style: 'color: red' }, response.message || 'Thêm tuyến mới thất bại!'),
                            type: 'error',
                        });
                        return;
                    }
                }
                drawer.value = false;
            } catch (error) {
                ElNotification({
                    message: h('p', { style: 'color: red' }, 'Đã xảy ra lỗi. Vui lòng thử lại!'),
                    type: 'error',
                });
                console.error(error);
            }
        } else {
            console.log('error submit!');
        }
    });
};
const fetchListRoute = async () => {
    loading.value = true;
    try {
        const response = await getListRouteByCompany(useUserStore.company_id || '');
        if (response.result) {
            routes.value = response.result;
        } else {
            ElNotification({
                message: h('p', { style: 'color: red' }, 'Không tìm thấy tuyến nào!'),
                type: 'warning',
            });
        }
    } catch (error) {
        ElNotification({
            message: h('p', { style: 'color: red' }, 'Đã xảy ra lỗi khi tải danh sách tuyến!'),
            type: 'error',
        });
        console.error(error);
    } finally {
        loading.value = false;
    }
};
const handleMoveUp = async (item: RouteType, index: number) => {
    console.log('Move Up clicked', item, index);
    if (index <= 0 || !item.display_order) return;

    loading.value = true;
    try {
        const prevItem = routes.value[index - 1];

        if (!prevItem.display_order) {
            throw new Error('Không tìm thấy thứ tự hiển thị');
        }

        // const originalItems = [...routes.value];

        const currentOrder = item.display_order;
        item.display_order = prevItem.display_order;
        prevItem.display_order = currentOrder;

        await Promise.all([
            updateRouteOrder({ route_id: item.id!, display_order: item.display_order, company_id: useUserStore.company_id ?? '' }),
            updateRouteOrder({ route_id: prevItem.id!, display_order: prevItem.display_order, company_id: useUserStore.company_id ?? '' })
        ]);

        routes.value.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        ElNotification({
            message: h('p', { style: 'color: teal' }, 'Di chuyển tuyến lên thành công!'),
            type: 'success',
        })
    } catch (error) {
        console.error('Lỗi khi di chuyển lên:', error);
        ElNotification({
            message: h('p', { style: 'color: teal' }, 'Di chuyển không thành công!'),
            type: 'error',
        })
    } finally {
        loading.value = false;
    }
};

const handleMoveDown = async (item: RouteType, index: number) => {
    console.log('Move Down clicked', item, index);
    if (index >= routes.value.length - 1 || !item.display_order) return;

    loading.value = true;
    try {
        const nextItem = routes.value[index + 1];

        if (!nextItem.display_order) {
            throw new Error('Không tìm thấy thứ tự hiển thị');
        }

        const currentOrder = item.display_order;
        item.display_order = nextItem.display_order;
        nextItem.display_order = currentOrder;


        await Promise.all([
            updateRouteOrder({ route_id: item.id!, display_order: item.display_order, company_id: useUserStore.company_id ?? '' }),
            updateRouteOrder({ route_id: nextItem.id!, display_order: nextItem.display_order, company_id: useUserStore.company_id ?? '' })
        ]);

        routes.value.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

        ElNotification({
            message: h('p', { style: 'color: teal' }, 'Di chuyển tuyến xuống thành công!'),
            type: 'success',
        })
    } catch (error) {
        console.error('Lỗi khi di chuyển xuống:', error);
        ElNotification({
            message: h('p', { style: 'color: teal' }, 'Di chuyển không thành công!'),
            type: 'error',
        })
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    useUserStore.loadUserInfo();
    fetchListRoute();
});

</script>
<template>
    <section>
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">DANH SÁCH TUYẾN</h3>
            <el-button :icon="Plus" type="primary" @click="handleAdd">Thêm tuyến</el-button>
        </div>
        <el-table v-loading="loading" element-loading-text="Đang tải dữ liệu..." :data="filterTableData"
            style="width: 100%">
            <el-table-column type="index" label="STT" width="50" />
            <el-table-column label="Tên tuyến" prop="route_name" />
            <el-table-column label="Tên tuyến rút gọn" prop="short_name" />
            <el-table-column label="Giá cơ bản" prop="base_price"
                :formatter="(_, __, value) => formatCurrency(value)" />
            <el-table-column label="Trạng thái" prop="status">
                <template #default="scope">
                    <el-tag :type="scope.row.status ? 'success' : 'danger'">
                        {{ scope.row.status ? 'Kích hoạt' : 'Ngưng kích hoạt' }}
                    </el-tag>
                </template>
            </el-table-column>

            <el-table-column label="Ghi chú" prop="note" />
            <el-table-column label="Vị trí" width="120">
                <template #default="scope">
                    <el-button-group>
                        <el-button :disabled="scope.$index === 0" size="small"
                            @click="handleMoveUp(scope.row, scope.$index)" :icon="ArrowUp" @click.stop.prevent="" />
                        <el-button :disabled="scope.$index === filterTableData.length - 1" size="small"
                            @click="handleMoveDown(scope.row, scope.$index)" :icon="ArrowDown" @click.stop.prevent="" />
                    </el-button-group>
                </template>
            </el-table-column>
            <el-table-column align="right">
                <template #header>
                    <el-input v-model="search" placeholder="Tìm tuyến" />
                </template>
                <template #default="scope">
                    <el-button type="primary" :icon="Edit" circle @click="handleEdit(scope.$index, scope.row)" />
                    <el-button circle type="danger" :icon="Delete" @click="handleDelete(scope.$index, scope.row)" />

                </template>
            </el-table-column>
        </el-table>

        <el-drawer v-model="drawer" :direction="direction" :before-close="cancelClick">
            <template #header>
                <div class="font-semibold text-lg text-black">{{ isEditMode ? 'Chỉnh sửa tuyến' : 'Thêm tuyến'
                }}</div>
            </template>
            <template #default>

                <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="auto">
                    <div>
                        <h2 class="text-gray-500 font-medium mb-5">THÔNG TIN TUYẾN</h2>

                        <InputText v-model="ruleForm.route_name" prop="route_name" label="Tên tuyến" />

                        <InputNumber v-model="ruleForm.base_price" prop="base_price" label="Giá cơ bản" />

                        <InputText v-model="ruleForm.short_name" prop="short_name" label="Tên rút gọn" />

                        <el-form-item prop="status" label-position="top">
                            <template #label>
                                <label class="text-sm font-medium text-gray-700">Trạng thái</label>
                            </template>
                            <el-switch v-model="ruleForm.status" size="large" active-text="Kích hoạt"
                                inactive-text="Ngưng kích hoạt" />
                        </el-form-item>

                        <InputText v-model="ruleForm.route_name_e_ticket" prop="route_name_e_ticket"
                            label="Tên tuyến xuất vé điện tử" />

                        <InputNumber v-model="ruleForm.e_ticket_price" prop="e_ticket_price" label="Giá vé điện tử" />

                        <InputText v-model="ruleForm.note" prop="note" label="Ghi chú" />

                        <InputNumber v-model="ruleForm.distance" prop="distance" label="Quảng đường (km)" />

                        <InputText v-model="ruleForm.journey" prop="journey" label="Lộ trình" />
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
