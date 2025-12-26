import type { FormInstance } from "element-plus"
import { routeList, valueSelectedRoute } from "./useRouteGlobal"
import type { DTO_RQ_Route } from "~/types/route/route.interface"
import { API_CreateRoute, API_DeleteRoute, API_UpdateRoute } from "~/services/resource-service/route/bms-route.api"

export const useRouteActions = () => {
    const handleChangeRoute = (value: string) => {
        valueSelectedRoute.value = value
        localStorage.setItem('selectedRoute', value.toString())
    }

    const useUserStore = userStore();
    const isEditMode = ref(false);
    const currentEditId = ref<string | null>(null);
    const ruleFormRef = ref<FormInstance>()
    const drawer = ref(false);
    const loadingSubmit = ref(false);
    const ruleForm = ref<DTO_RQ_Route>({
        id: undefined,
        base_price: undefined,
        distance: undefined,
        e_ticket_price: undefined,
        journey: undefined,
        note: undefined,
        route_name: undefined,
        route_name_e_ticket: undefined,
        short_name: undefined,
        status: undefined,
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
            status: undefined,
            display_order: undefined,
        };
        drawer.value = true;
    };

    const handleEdit = (index: string, row: DTO_RQ_Route) => {
        isEditMode.value = true;
        currentEditId.value = row.id ?? null;
        ruleForm.value = ({
            base_price: row.base_price,
            distance: row.distance,
            e_ticket_price: row.e_ticket_price,
            journey: row.journey,
            note: row.note,
            route_name: row.route_name,
            route_name_e_ticket: row.route_name_e_ticket,
            short_name: row.short_name,
            status: row.status,
            display_order: row.display_order,
        });
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

    const handleDelete = async (index: number, row: DTO_RQ_Route) => {
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

            const response = await API_DeleteRoute(row.id!);
            if (response.success) {
                notifySuccess('Xóa tuyến thành công!');
                routeList.value.splice(index, 1);
            } else {
                notifyWarning(response.message || 'Xóa tuyến thất bại!');
            }
        } catch (error) {
            if (error !== 'cancel' && error !== 'close') {
                notifyError('Xóa tuyến thất bại!');
                console.error(error);
            }
        }
    };

    const handleSubmitRoute = async (formEl?: FormInstance) => {
        if (!formEl) return;
        const valid = await formEl.validate();
        if (!valid) return;
        loadingSubmit.value = true;
        try {
            if (isEditMode.value && currentEditId.value !== null) {
                const response = await API_UpdateRoute(
                    currentEditId.value,
                    ruleForm.value as DTO_RQ_Route
                );

                if (response.success) {
                    notifySuccess('Cập nhật tuyến thành công!');
                    const index = routeList.value.findIndex(
                        item => item.id === currentEditId.value
                    );
                    if (index !== -1) {
                        routeList.value[ index ] = {
                            ...response.result!,
                        };
                    }
                    await nextTick();
                    drawer.value = false;
                } else {
                    notifyWarning(response.message || 'Cập nhật tuyến thất bại!');
                }
            } else {
                const response = await API_CreateRoute(
                    useUserStore.company_id ?? '',
                    ruleForm.value as DTO_RQ_Route
                );
                if (response.success) {
                    notifySuccess('Tạo tuyến thành công!');
                    routeList.value.push(response.result!);
                    await nextTick();
                    drawer.value = false;
                } else {
                    notifyWarning(response.message || 'Tạo tuyến thất bại!');
                }
            }
        } catch (error) {
            notifyError('Đã xảy ra lỗi khi gửi biểu mẫu!');
            console.error(error);
        } finally {
            loadingSubmit.value = false;
        }
    };

    return {
        handleChangeRoute,
        handleAdd,
        handleEdit,
        handleDelete,
        handleSubmitRoute,
        cancelClick,
        resetForm,
        drawer,
        isEditMode,
        ruleForm,
        ruleFormRef,
        loadingSubmit,
        currentEditId,
    }
}