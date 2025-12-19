import type { DTO_RQ_Office, Office } from "~/types/office/office.interface";
import type { FormInstance } from 'element-plus'
import { API_CreateOffice, API_DeleteOffice, API_GetListOfficeByCompanyId, API_UpdateOffice } from "~/api/resource-service/office/bms_office.api";
export const useOfficeManagement = () => {
    const useUserStore = userStore();
    const drawer = ref(false);
    const isEditMode = ref(false);
    const currentEditId = ref<string | null>(null);
    const offices = ref<Office[]>([]);
    const loadingData = ref(false);
    const loadingSubmit = ref(false);
    const ruleFormRef = ref<FormInstance>()
    const ruleForm = ref<DTO_RQ_Office>({
        id: undefined,
        name: undefined,
        code: undefined,
        address: undefined,
        status: false,
        note: undefined,
        phones: [
            { id: undefined, phone: undefined, type: 'mobile' }
        ],
    });


    const submitForm = async (formEl: FormInstance | undefined) => {
        if (!formEl) return;
        await formEl.validate(async (valid) => {
            if (!valid) return console.log('error submit!');
            loadingSubmit.value = true;
            try {
                if (isEditMode.value && currentEditId.value !== null) {
                    const response = await API_UpdateOffice(
                        currentEditId.value,
                        ruleForm.value as DTO_RQ_Office
                    );
                    if (response.success) {
                        notifySuccess('Cập nhật văn phòng thành công!');
                        const index = offices.value.findIndex(item => item.id === currentEditId.value);
                        if (index !== -1) {
                            offices.value[index] = response.result!;
                        }
                        //  Đợi animation nút loading hoàn tất rồi mới đóng
                        await nextTick();
                        drawer.value = false;
                    } else {
                        notifyError(response.message || 'Cập nhật văn phòng thất bại!');
                    }
                } else {
                    const response = await API_CreateOffice(
                        useUserStore.company_id ?? '',
                        ruleForm.value as DTO_RQ_Office
                    );
                    if (response.success) {
                        notifySuccess('Tạo văn phòng thành công!');
                        offices.value.push(response.result!);
                        //  Đợi animation nút loading hoàn tất rồi mới đóng
                        await nextTick();
                        drawer.value = false;
                    } else {
                        notifyError(response.message || 'Tạo văn phòng thất bại!');
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

    const handleAdd = () => {
        isEditMode.value = false;
        currentEditId.value = null;
        ruleForm.value = {
            name: undefined,
            address: undefined,
            phones: [],
            code: undefined,
            status: false,
            note: undefined,
        };
        drawer.value = true;
    };

    const handleEdit = (index: number, row: DTO_RQ_Office) => {
        isEditMode.value = true;
        currentEditId.value = row.id ?? null;
        ruleForm.value = ({
            name: row.name,
            code: row.code,
            address: row.address,
            status: row.status,
            note: row.note,
            phones: row.phones,
        });
        drawer.value = true;
    };

    const removePhone = (index: number) => {
        if (!ruleForm.value) return;
        if (!ruleForm.value.phones || ruleForm.value.phones.length === 0) return;
        if (ruleForm.value.phones.length > 1) {
            ruleForm.value.phones.splice(index, 1)
            // Clear validation for removed field
            ruleFormRef.value?.clearValidate([ `phones.${index}.number` ])
        }
    };

    const addPhone = () => {
        if (!ruleForm.value) return;
        if (!ruleForm.value.phones) {
            ruleForm.value.phones = [ { id: undefined, phone: undefined, type: 'mobile' } ];
            return;
        }
        ruleForm.value.phones.push({
            id: undefined, phone: undefined, type: 'mobile',
        })
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

    const handleDelete = async (index: number, row: DTO_RQ_Office) => {
        try {
            await ElMessageBox.confirm(
                'Bạn có chắc chắn muốn xóa văn phòng này?',
                'Xác nhận xoá',
                {
                    confirmButtonText: 'Xoá',
                    cancelButtonText: 'Huỷ',
                    type: 'warning',
                }
            );

            const response = await API_DeleteOffice(row.id!);
            if (response.success) {
                notifySuccess('Xóa văn phòng thành công!');
                offices.value.splice(index, 1);
            } else {
                notifyError(response.message || 'Xóa văn phòng thất bại!');
            }
        } catch (error) {
            if (error !== 'cancel' && error !== 'close') {
                notifyError('Xóa văn phòng thất bại!');
                console.error(error);
            }
        }
    };

    const fetchListOffice = async (company_id: string) => {
        loadingData.value = true;
        try {
            const response = await API_GetListOfficeByCompanyId(company_id);
            if (response.success) {
                offices.value = response.result || [];
            } else {
                ElMessage.error(response.message || 'Không thể tải danh sách văn phòng');
            }
        } catch (error) {
            console.error(error);
            ElMessage.error('Đã xảy ra lỗi khi tải danh sách văn phòng');
        } finally {
            loadingData.value = false;
        }
    };
    return {
        offices,
        loadingData,
        drawer,
        isEditMode,
        currentEditId,
        ruleFormRef,
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
    };
}