import type { FormInstance } from "element-plus";
import { API_CreateAccount, API_DeleteAccount, API_GetListAccountByCompanyId, API_UpdateAccount } from "~/services/identity-service/account/employee.api";
import type { Account } from "~/types/account/account.interface";

export const useAccountManagement = () => {
    const useUserStore = userStore();
    const drawer = ref(false);
    const isEditMode = ref(false);
    const currentEditId = ref<number | null>(null);
    const accounts = ref<Account[]>([]);
    const loadingData = ref(false);
    const loadingSubmit = ref(false);
    const ruleFormRef = ref<FormInstance>();
    const ruleForm = ref<Account>({
        id: undefined,
        username: undefined,
        password: undefined,
        phone: undefined,
        email: undefined,
        name: undefined,
        address: undefined,
        date_of_birth: undefined,
        gender: undefined,
        role: undefined,
        status: false,
        accept_app: {
            bms: false,
            cms: false,
            ams: false,
            driver: false,
        }
    });
    const handleAdd = () => {
        isEditMode.value = false;
        currentEditId.value = null;
        ruleForm.value = {
            username: undefined,
            password: undefined,
            phone: undefined,
            email: undefined,
            name: undefined,
            address: undefined,
            date_of_birth: undefined,
            gender: undefined,
            role: undefined,
            status: false,
            accept_app: {
                bms: false,
                cms: false,
                ams: false,
                driver: false,
            }
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
    const handleEdit = (index: number, row: Account) => {
        isEditMode.value = true;
        currentEditId.value = row.id ?? null;
        drawer.value = true;
        ruleForm.value = { ...row };
    };
    const fetchListAccounts = async (company_id: string) => {
        loadingData.value = true;
        try {
            const response = await API_GetListAccountByCompanyId(company_id);
            if (response.success) {
                accounts.value = response.result || [];
            } else {
                ElMessage.error(response.message || "Lấy danh sách nhân viên thất bại.");
            }
        } catch (error) {
            console.error(error);
            ElMessage.error("Lỗi khi tải danh sách nhân viên.");
        } finally {
            loadingData.value = false;
        }
    }
    const handleDelete = async (index: number, row: Account) => {
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
            const response = await API_DeleteAccount(row.id!);
            if (response.success) {
                notifySuccess('Xóa tài khoản thành công!');
                accounts.value = accounts.value.filter(account => account.id !== row.id);
            } else {
                notifyError(response.message || 'Xóa tài khoản thất bại!');
                return;
            }
        } catch (error) {
            if (error !== 'cancel' && error !== 'close') {
                notifyError('Xóa tài khoản thất bại!');
                console.error(error);
            }
        }
    };
    const submitForm = async (formEl: FormInstance | undefined) => {
        if (!formEl) return;
        await formEl.validate(async (valid) => {
            if (!valid) return console.log('error submit!');
            loadingSubmit.value = true;
            try {
                if (isEditMode.value && currentEditId.value !== null) {
                    const response = await API_UpdateAccount(
                        currentEditId.value,
                        ruleForm.value as Account
                    );
                    if (response.success) {
                        notifySuccess('Cập nhật tài khoản thành công!');
                        const index = accounts.value.findIndex(item => item.id === currentEditId.value);
                        if (index !== -1) {
                            accounts.value[ index ] = response.result!;
                        }
                        //  Đợi animation nút loading hoàn tất rồi mới đóng
                        await nextTick();
                        drawer.value = false;
                    } else {
                        notifyError(response.message || 'Cập nhật tài khoản thất bại!');
                    }
                } else {
                    const response = await API_CreateAccount(
                        useUserStore.company_id ?? '',
                        ruleForm.value as Account
                    );
                    if (response.success) {
                        notifySuccess('Tạo tài khoản thành công!');
                        accounts.value.push(response.result!);
                        //  Đợi animation nút loading hoàn tất rồi mới đóng
                        await nextTick();
                        drawer.value = false;
                    } else {
                        notifyError(response.message || 'Tạo tài khoản thất bại!');
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
    return {
        drawer,
        isEditMode,
        currentEditId,
        accounts,
        loadingData,
        loadingSubmit,
        ruleFormRef,
        ruleForm,
        handleAdd,
        handleEdit,
        handleDelete,
        submitForm,
        fetchListAccounts,
        cancelClick,
        resetForm,
    };
}