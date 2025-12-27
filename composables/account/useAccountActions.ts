import type { FormInstance } from "element-plus";
import type { DTO_RQ_Account, DTO_RQ_ChangePassword } from "~/types/account/account.interface";
import { accountList } from "./useAccountGlobal";
import { API_ChangePasswordStaff, API_CreateAccount, API_DeleteAccount, API_LockAccount, API_UnlockAccount, API_UpdateAccount } from "~/services/identity-service/account/bms-account.api";

export const useAccountActions = () => {
    const useUserStore = userStore();
    const isEditMode = ref(false);
    const currentEditId = ref<string | null>(null);
    const ruleFormRef = ref<FormInstance>()
    const drawer = ref(false);
    const loadingSubmit = ref(false);
    const ruleForm = ref<DTO_RQ_Account>({
        id: undefined,
        username: undefined,
        phone: undefined,
        email: undefined,
        name: undefined,
        address: undefined,
        date_of_birth: undefined,
        gender: undefined,
        role: undefined,
        status: false,
        password: undefined,
        accept_bms: undefined,
        accept_cms: undefined,
        accept_ams: undefined,
        accept_driver: undefined,
    });
    const handleAdd = () => {
        isEditMode.value = false;
        currentEditId.value = null;
        ruleForm.value = {
            username: undefined,
            phone: undefined,
            email: undefined,
            name: undefined,
            address: undefined,
            date_of_birth: undefined,
            gender: undefined,
            role: undefined,
            status: false,
            password: undefined,
            accept_bms: undefined,
            accept_cms: undefined,
            accept_ams: undefined,
            accept_driver: undefined,
        };
        drawer.value = true;
    };

    const handleEdit = (index: string, row: DTO_RQ_Account) => {
        console.log('row edit:', row);
        isEditMode.value = true;
        currentEditId.value = row.id ?? null;
        ruleForm.value = ({
            username: row.username,
            phone: row.phone,
            email: row.email,
            name: row.name,
            address: row.address,
            date_of_birth: row.date_of_birth,
            gender: row.gender,
            role: row.role,
            status: row.status,
            accept_bms: row.accept_bms,
            accept_cms: row.accept_cms,
            accept_ams: row.accept_ams,
            accept_driver: row.accept_driver,
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

    const handleDelete = async (index: number, row: DTO_RQ_Account) => {
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
                accountList.value.splice(index, 1);
            } else {
                notifyWarning(response.message || 'Xóa tài khoản thất bại!');
            }
        } catch (error) {
            if (error !== 'cancel' && error !== 'close') {
                notifyError('Xóa tài khoản thất bại!');
                console.error(error);
            }
        }
    };

    const handleLock = async (index: number, row: DTO_RQ_Account) => {
        try {
            await ElMessageBox.confirm(
                'Bạn có chắc chắn muốn khoá tài khoản này?',
                'Xác nhận khoá',
                {
                    confirmButtonText: 'Khoá',
                    cancelButtonText: 'Huỷ',
                    type: 'warning',
                }
            );

            const response = await API_LockAccount(row.id!);
            if (response.success) {
                notifySuccess('Khoá tài khoản thành công!');
                accountList.value[ index ] = {
                    ...response.result!,
                };
            } else {
                notifyWarning(response.message || 'Khoá tài khoản thất bại!');
            }
        } catch (error) {
            if (error !== 'cancel' && error !== 'close') {
                notifyError('Khoá tài khoản thất bại!');
                console.error(error);
            }
        }
    };
    const handleUnlock = async (index: number, row: DTO_RQ_Account) => {
        try {
            await ElMessageBox.confirm(
                'Bạn có chắc chắn muốn mở khoá tài khoản này?',
                'Xác nhận mở khoá',
                {
                    confirmButtonText: 'Mở khoá',
                    cancelButtonText: 'Huỷ',
                    type: 'warning',
                }
            );

            const response = await API_UnlockAccount(row.id!);
            if (response.success) {
                notifySuccess('Mở khoá tài khoản thành công!');
                accountList.value[ index ] = {
                    ...response.result!,
                };
            } else {
                notifyWarning(response.message || 'Mở khoá tài khoản thất bại!');
            }
        } catch (error) {
            if (error !== 'cancel' && error !== 'close') {
                notifyError('Mở khoá tài khoản thất bại!');
                console.error(error);
            }
        }
    }

    const handleSubmitAccount = async (formEl?: FormInstance) => {
        if (!formEl) return;

        const valid = await formEl.validate();
        if (!valid) return;

        loadingSubmit.value = true;

        try {
            if (isEditMode.value && currentEditId.value !== null) {
                const response = await API_UpdateAccount(
                    currentEditId.value,
                    ruleForm.value as DTO_RQ_Account
                );

                if (response.success) {
                    notifySuccess('Cập nhật tài khoản thành công!');

                    const index = accountList.value.findIndex(
                        item => item.id === currentEditId.value
                    );

                    if (index !== -1) {
                        accountList.value[ index ] = {
                            ...response.result!,
                        };
                    }
                    await nextTick();
                    drawer.value = false;
                } else {
                    notifyWarning(response.message || 'Cập nhật tài khoản thất bại!');
                }
            } else {
                const response = await API_CreateAccount(
                    useUserStore.company_id ?? '',
                    ruleForm.value as DTO_RQ_Account
                );

                if (response.success) {
                    notifySuccess('Tạo tài khoản thành công!');
                    accountList.value.push(response.result!);

                    await nextTick();
                    drawer.value = false;
                } else {
                    notifyWarning(response.message || 'Tạo tài khoản thất bại!');
                }
            }
        } catch (error) {
            notifyError('Đã xảy ra lỗi khi gửi biểu mẫu!');
            console.error(error);
        } finally {
            loadingSubmit.value = false;
        }
    };

    const dialogChangePasswordAccount = ref(false);
    const selectedAccountId = ref<string | null>(null);
    const loadingSubmitChangePassword = ref(false);
    const handleChangePassword = (index: number, row: DTO_RQ_Account) => {
        console.log(row);
        dialogChangePasswordAccount.value = true;
        selectedAccountId.value = row.id!;
    };
    const handleSubmitChangePassword = async (data: DTO_RQ_ChangePassword) => {
        loadingSubmitChangePassword.value = true;
        try {
            console.log('Change password data:', data);
            const response = await API_ChangePasswordStaff(
                selectedAccountId.value!,
                data
            )
            if (response.success) {
                notifySuccess('Đổi mật khẩu thành công!');
                dialogChangePasswordAccount.value = false;
            } else {
                notifyWarning(response.message || 'Đổi mật khẩu thất bại!');
            }
        } catch (error) {
            notifyError('Đổi mật khẩu thất bại!');
            console.error(error);
        } finally {
            loadingSubmitChangePassword.value = false;
        }
    }
    return {
        isEditMode,
        ruleFormRef,
        drawer,
        loadingSubmit,
        ruleForm,
        handleAdd,
        handleEdit,
        handleSubmitAccount,
        cancelClick,
        resetForm,
        handleDelete,
        handleUnlock,
        handleLock,

        dialogChangePasswordAccount,
        selectedAccountId,
        loadingSubmitChangePassword,
        handleChangePassword,
        handleSubmitChangePassword,
    }
}