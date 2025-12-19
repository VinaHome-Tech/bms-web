import type { FormInstance } from "element-plus";
import { API_CreateVehicle, API_DeleteVehicle, API_GetListVehicleByCompanyId, API_UpdateVehicle } from "~/services/resource-service/vehicle/bms_vehicle.api";
import type { Vehicle } from "~/types/vehicle/vehicle.interface";

export const useVehicleManagement = () => {
  const useUserStore = userStore();
  const drawer = ref(false);
  const isEditMode = ref(false);
  const currentEditId = ref<number | null>(null);
  const vehicles = ref<Vehicle[]>([]);
  const loadingData = ref(false);
  const loadingSubmit = ref(false);
  const ruleFormRef = ref<FormInstance>();
  const ruleForm = ref<Vehicle>({
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
  const handleEdit = (index: number, row: Vehicle) => {
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
          const response = await API_UpdateVehicle(
            currentEditId.value,
            ruleForm.value as Vehicle
          );
          if (response.success) {
            notifySuccess('Cập nhật phương tiện thành công!');
            const index = vehicles.value.findIndex(item => item.id === currentEditId.value);
            if (index !== -1) {
              vehicles.value[index] = response.result!;
            }
            //  Đợi animation nút loading hoàn tất rồi mới đóng
            await nextTick();
            drawer.value = false;
          } else {
            notifyError(response.message || 'Cập nhật phương tiện thất bại!');
          }
        } else {
          const response = await API_CreateVehicle(
            useUserStore.company_id ?? '',
            ruleForm.value as Vehicle
          );
          if (response.success) {
            notifySuccess('Tạo phương tiện thành công!');
            vehicles.value.push(response.result!);
            //  Đợi animation nút loading hoàn tất rồi mới đóng
            await nextTick();
            drawer.value = false;
          } else {
            notifyError(response.message || 'Tạo phương tiện thất bại!');
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
  const handleDelete = async (index: number, row: Vehicle) => {
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
        vehicles.value = vehicles.value.filter(vehicle => vehicle.id !== row.id);
      } else {
        notifyError(response.message || 'Xóa phương tiện thất bại!');
        return;
      }
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        notifyError('Xóa phương tiện thất bại!');
        console.error(error);
      }
    }
  };
  const fetchListVehicles = async (company_id: string) => {
    loadingData.value = true;
    try {
      const response = await API_GetListVehicleByCompanyId(company_id);
      if (response.success) {
        vehicles.value = response.result || [];
      } else {
        ElMessage.error(response.message || "Lấy danh sách phương tiện thất bại.");
      }
    } catch (error) {
      console.error(error);
      ElMessage.error("Lỗi khi tải danh sách phương tiện.");
    } finally {
      loadingData.value = false;
    }
  }
  return {
    drawer,
    isEditMode,
    currentEditId,
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
  };
};
