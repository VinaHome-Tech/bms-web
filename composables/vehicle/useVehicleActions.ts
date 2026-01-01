import type { FormInstance } from "element-plus";
import type { DTO_RQ_Office } from "~/types/office/office.interface";
import type { DTO_RQ_Vehicle } from "~/types/vehicle/vehicle.interface";
import { vehicleList } from "./useVehicleGlobal";
import { API_CreateVehicle, API_DeleteVehicle, API_UpdateVehicle } from "~/services/resource-service/vehicle/bms-vehicle.api";

export const useVehicleActions = () => {
    const useUserStore = userStore();
    const isEditMode = ref(false);
    const currentEditId = ref<string | null>(null);
    const ruleFormRef = ref<FormInstance>()
    const drawer = ref(false);
    const loadingSubmit = ref(false);
    const ruleForm = ref<DTO_RQ_Vehicle>({
        id: undefined,
        license_plate: undefined,
        engine_number: undefined,
        frame_number: undefined,
        status: undefined,
        color: undefined,
        brand: undefined,
        phone: undefined,
        registration_expiry: undefined,
        maintenance_due: undefined,
        note: undefined,
    });
    const handleAdd = () => {
        isEditMode.value = false;
        currentEditId.value = null;
        ruleForm.value = {
            
            license_plate: undefined,
            engine_number: undefined,
            frame_number: undefined,
            status: undefined,
            color: undefined,
            brand: undefined,
            phone: undefined,
            registration_expiry: undefined,
            maintenance_due: undefined,
            note: undefined,
        };
        drawer.value = true;
    };

    const handleEdit = (index: string, row: DTO_RQ_Vehicle) => {
        isEditMode.value = true;
        currentEditId.value = row.id ?? null;
        ruleForm.value = ({
            license_plate: row.license_plate,
            engine_number: row.engine_number,
            frame_number: row.frame_number,
            status: row.status,
            color: row.color,
            brand: row.brand,
            phone: row.phone,
            registration_expiry: row.registration_expiry,
            maintenance_due: row.maintenance_due,
            note: row.note,
        });
        drawer.value = true;
    }

    const resetForm = (formEl: FormInstance | undefined) => {
        if (!formEl) return
        formEl.resetFields()
        drawer.value = false
    }


    const cancelClick = () => {
        drawer.value = false;
        ruleFormRef.value?.resetFields();
    }

    const handleDelete = async (index: number, row: DTO_RQ_Office) => {
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

            const response = await API_DeleteVehicle(row.id!);
            if (response.success) {
                notifySuccess('Xóa phương tiện thành công!');
                vehicleList.value.splice(index, 1);
            } else {
                notifyWarning(response.message || 'Xóa phương tiện thất bại!');
            }
        } catch (error) {
            if (error !== 'cancel' && error !== 'close') {
                notifyError('Xóa phương tiện thất bại!');
                console.error(error);
            }
        }
    };


    const handleSubmitVehicle = async (formEl?: FormInstance) => {
        if (!formEl) return;

        const valid = await formEl.validate();
        if (!valid) return;

        loadingSubmit.value = true;

        try {
            if (isEditMode.value && currentEditId.value !== null) {
                const response = await API_UpdateVehicle(
                    currentEditId.value,
                    ruleForm.value as DTO_RQ_Vehicle
                );

                if (response.success) {
                    notifySuccess('Cập nhật phương tiện thành công!');

                    const index = vehicleList.value.findIndex(
                        item => item.id === currentEditId.value
                    );

                    if (index !== -1) {
                        vehicleList.value[ index ] = {
                            ...response.result!,
                            
                        };
                    }
                    await nextTick();
                    drawer.value = false;
                } else {
                    notifyWarning(response.message || 'Cập nhật phương tiện thất bại!');
                }
            } else {
                const response = await API_CreateVehicle(
                    useUserStore.company_id ?? '',
                    ruleForm.value as DTO_RQ_Vehicle
                );

                if (response.success) {
                    notifySuccess('Tạo phương tiện thành công!');
                    vehicleList.value.push(response.result!);

                    await nextTick();
                    drawer.value = false;
                } else {
                    notifyWarning(response.message || 'Tạo phương tiện thất bại!');
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
        handleSubmitVehicle,
        ruleForm,
        ruleFormRef,
        drawer,
        isEditMode,
        currentEditId,
        loadingSubmit,
        handleAdd,
        handleEdit,
        resetForm,
        cancelClick,
        handleDelete,
    }
}