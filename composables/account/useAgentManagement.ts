import type { FormInstance } from "element-plus";
import { API_CreateAgentAccount, API_DeleteAgent, API_GetListAgentByCompanyId, API_UpdateAgentAccount } from "~/api/identity-service/account/agent.api";
import type { Agent } from "~/types/account/agent.interface";

export const useAgentManagement = () => {
    const useUserStore = userStore();
    const drawer = ref(false);
    const isEditMode = ref(false);
    const currentEditId = ref<number | null>(null);
    const agents = ref<Agent[]>([]);
    const loadingData = ref(false);
    const loadingSubmit = ref(false);
    const ruleFormRef = ref<FormInstance>();
    const ruleForm = ref<Agent>({
        id: undefined,
        username: undefined,
        password: undefined,
        phone: undefined,
        email: undefined,
        name: undefined,
        address: undefined,
        status: false,
        commission: {
            ticket_type: "%",
            ticket_value: 0,
            goods_type: "%",
            goods_value: 0,
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
            status: false,
            commission: {
                ticket_type: "%",
                ticket_value: 0,
                goods_type: "%",
                goods_value: 0,
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
    const handleEdit = (index: number, row: Agent) => {
        isEditMode.value = true;
        currentEditId.value = row.id ?? null;
        drawer.value = true;
        ruleForm.value = { ...row };
    };
    const fetchListAgents = async (company_id: string) => {
        loadingData.value = true;
        try {
            const response = await API_GetListAgentByCompanyId(company_id);
            if (response.success) {
                agents.value = response.result || [];
            } else {
                ElMessage.error(response.message || "Lấy danh sách đại lý thất bại.");
            }
        } catch (error) {
            console.error(error);
            ElMessage.error("Lỗi khi tải danh sách đại lý.");
        } finally {
            loadingData.value = false;
        }
    }
    const handleDelete = async (index: number, row: Agent) => {
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
            const response = await API_DeleteAgent(row.id!);
            if (response.success) {
                notifySuccess('Xóa đại lý thành công!');
                agents.value = agents.value.filter(agent => agent.id !== row.id);
            } else {
                notifyError(response.message || 'Xóa đại lý thất bại!');
                return;
            }
        } catch (error) {
            if (error !== 'cancel' && error !== 'close') {
                notifyError('Xóa đại lý thất bại!');
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
                    const response = await API_UpdateAgentAccount(
                        currentEditId.value,
                        ruleForm.value as Agent
                    );
                    if (response.success) {
                        notifySuccess('Cập nhật đại lý thành công!');
                        const index = agents.value.findIndex(item => item.id === currentEditId.value);
                        if (index !== -1) {
                            agents.value[ index ] = response.result!;
                        }
                        //  Đợi animation nút loading hoàn tất rồi mới đóng
                        await nextTick();
                        drawer.value = false;
                    } else {
                        notifyError(response.message || 'Cập nhật đại lý thất bại!');
                    }
                } else {
                    const response = await API_CreateAgentAccount(
                        useUserStore.company_id ?? '',
                        ruleForm.value as Agent
                    );
                    if (response.success) {
                        notifySuccess('Tạo đại lý thành công!');
                        agents.value.push(response.result!);
                        //  Đợi animation nút loading hoàn tất rồi mới đóng
                        await nextTick();
                        drawer.value = false;
                    } else {
                        notifyError(response.message || 'Tạo đại lý thất bại!');
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
        agents,
        loadingData,
        loadingSubmit,
        ruleFormRef,
        ruleForm,
        handleAdd,
        handleEdit,
        handleDelete,
        fetchListAgents,
        submitForm,
        cancelClick,
        resetForm,
    };
}