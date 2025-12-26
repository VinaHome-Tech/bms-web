import type { FormInstance } from "element-plus";
import { API_CreateRoute, API_DeleteRoute, API_GetListRouteByCompanyId, API_GetListRouteNameActionByCompanyId, API_GetListRouteNameByCompanyId, API_UpdateRoute, API_UpdateRouteOrder } from "~/services/resource-service/route/bms-route.api";
import type { Route, RouteName } from "~/types/route/route.interface";

export const useRouteManagement = () => {
    const useUserStore = userStore();
    const drawer = ref(false);
    const isEditMode = ref(false);
    const currentEditId = ref<number | null>(null);
    const routes = ref<Route[]>([]);
    const routesName = ref<RouteName[]>([]);
    
    const loadingData = ref(false);
    const loadingSubmit = ref(false);
    const ruleFormRef = ref<FormInstance>();
    const ruleForm = ref<Route>({
        id: undefined,
        base_price: undefined,
        distance: undefined,
        e_ticket_price: undefined,
        journey: undefined,
        note: undefined,
        route_name: undefined,
        route_name_e_ticket: undefined,
        short_name: undefined,
        status: false,
        display_order: undefined,
    });
    const handleAdd = () => {
        isEditMode.value = false;
        currentEditId.value = null;
        ruleForm.value = {
            base_price: undefined,
            distance: undefined,
            e_ticket_price: undefined,
            journey: undefined,
            note: undefined,
            route_name: undefined,
            route_name_e_ticket: undefined,
            short_name: undefined,
            status: false,
            display_order: undefined,
        };
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
    const handleEdit = (index: number, row: Route) => {
        isEditMode.value = true;
        currentEditId.value = row.id ?? null;
        ruleForm.value = { ...row };
        drawer.value = true;
    };
    const submitForm = async (formEl: FormInstance | undefined) => {
        if (!formEl) return;
        await formEl.validate(async (valid) => {
            if (!valid) return console.log('error submit!');
            loadingSubmit.value = true;
            try {
                if (isEditMode.value && currentEditId.value !== null) {
                    const response = await API_UpdateRoute(
                        currentEditId.value,
                        ruleForm.value as Route
                    );
                    if (response.success) {
                        notifySuccess('Cập nhật tuyến đường thành công!');
                        const index = routes.value.findIndex(item => item.id === currentEditId.value);
                        if (index !== -1) {
                            routes.value[index] = response.result!;
                        }
                        //  Đợi animation nút loading hoàn tất rồi mới đóng
                        await nextTick();
                        drawer.value = false;
                    } else {
                        notifyError(response.message || 'Cập nhật phương tiện thất bại!');
                    }
                } else {
                    const response = await API_CreateRoute(
                        useUserStore.company_id ?? '',
                        ruleForm.value as Route
                    );
                    if (response.success) {
                        notifySuccess('Tạo tuyến đường thành công!');
                        routes.value.push(response.result!);
                        //  Đợi animation nút loading hoàn tất rồi mới đóng
                        await nextTick();
                        drawer.value = false;
                    } else {
                        notifyError(response.message || 'Tạo tuyến đường thất bại!');
                    }
                }
            } catch (error) {
                notifyError('Đã xảy ra lỗi khi gửi biểu mẫu!');
                console.error(error);
            } finally {
                //  Chỉ tắt loading sau cùng (dù có lỗi hay không)
                loadingSubmit.value = false;
            }
        });
    };
    const handleDelete = async (index: number, row: Route) => {
        try {
            await ElMessageBox.confirm(
                'Bạn có chắc chắn muốn xóa tuyến đường này?',
                'Xác nhận xoá',
                {
                    confirmButtonText: 'Xoá',
                    cancelButtonText: 'Huỷ',
                    type: 'warning',
                }
            );
            const response = await API_DeleteRoute(row.id!);
            if (response.success) {
                notifySuccess('Xóa tuyến đường thành công!');
                routes.value = routes.value.filter(route => route.id !== row.id);
            } else {
                notifyError(response.message || 'Xóa tuyến đường thất bại!');
                return;
            }
        } catch (error) {
            if (error !== 'cancel' && error !== 'close') {
                notifyError('Xóa tuyến đường thất bại!');
                console.error(error);
            }
        }
    };
    const fetchListRoutes = async (company_id: string) => {
        loadingData.value = true;
        try {
            const response = await API_GetListRouteByCompanyId(company_id);
            if (response.success) {
                routes.value = response.result || [];
            } else {
                ElMessage.error(response.message || "Lấy danh sách tuyến thất bại.");
            }
        } catch (error) {
            console.error(error);
            ElMessage.error("Lỗi khi tải danh sách tuyến.");
        } finally {
            loadingData.value = false;
        }
    }
    const fetchListRoutesName = async (company_id: string) => {
        try {
            const response = await API_GetListRouteNameByCompanyId(company_id);
            if (response.success) {
                routesName.value = (response.result || []).map(route => ({
                    id: route.id!,
                    route_name: route.route_name || ''
                }));
            } else {
                ElMessage.error(response.message || "Lấy danh sách tuyến thất bại.");
            }
        } catch (error) {
            console.error(error);
            ElMessage.error("Lỗi khi tải danh sách tuyến.");
        } 
    }
    
    const handleMoveUp = async (item: Route, index: number) => {
        console.log('Move Up clicked', item, index);
        if (index <= 0 || !item.display_order) return;

        loadingData.value = true;
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
                API_UpdateRouteOrder(useUserStore.company_id ?? '', { route_id: item.id!, display_order: item.display_order }),
                API_UpdateRouteOrder(useUserStore.company_id ?? '', { route_id: prevItem.id!, display_order: prevItem.display_order })
            ]);

            routes.value.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
            notifySuccess('Di chuyển tuyến lên thành công!');
        } catch (error) {
            console.error('Lỗi khi di chuyển lên:', error);
            notifyError('Di chuyển không thành công!');
        } finally {
            loadingData.value = false;
        }
    };
    const handleMoveDown = async (item: Route, index: number) => {
        console.log('Move Down clicked', item, index);
        if (index >= routes.value.length - 1 || !item.display_order) return;

        loadingData.value = true;
        try {
            const nextItem = routes.value[index + 1];

            if (!nextItem.display_order) {
                throw new Error('Không tìm thấy thứ tự hiển thị');
            }

            const currentOrder = item.display_order;
            item.display_order = nextItem.display_order;
            nextItem.display_order = currentOrder;


            await Promise.all([
                API_UpdateRouteOrder(useUserStore.company_id ?? '', { route_id: item.id!, display_order: item.display_order }),
                API_UpdateRouteOrder(useUserStore.company_id ?? '', { route_id: nextItem.id!, display_order: nextItem.display_order })
            ]);

            routes.value.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

            notifySuccess('Di chuyển tuyến xuống thành công!');
        } catch (error) {
            console.error('Lỗi khi di chuyển xuống:', error);
            notifyError('Di chuyển không thành công!');
        } finally {
            loadingData.value = false;
        }
    };
    return {
        routes,
        routesName,
        loadingData,
        loadingSubmit,
        ruleFormRef,
        ruleForm,
        drawer,
        isEditMode,
        currentEditId,
        handleAdd,
        handleEdit,
        handleDelete,
        submitForm,
        resetForm,
        cancelClick,
        fetchListRoutes,
        fetchListRoutesName,
        handleMoveUp,
        handleMoveDown,
    }
}