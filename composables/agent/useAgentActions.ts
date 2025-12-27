import type { DTO_RQ_Agent } from "~/types/agent/agent.interface";
import type { FormInstance } from "element-plus";
import { agentList } from "./useAgentGlobal";
import { API_CreateAgent, API_DeleteAgent, API_UpdateAgent } from "~/services/identity-service/agent/bms-agent.api";
export const useAgentActions = () => {
    const useUserStore = userStore();
    const isEditMode = ref(false);
    const currentEditId = ref<string | null>(null);
    const ruleFormRef = ref<FormInstance>()
    const drawer = ref(false);
    const loadingSubmit = ref(false);
    const ruleForm = ref<DTO_RQ_Agent>({
        id: undefined,
        username: undefined,
        password: undefined,
        phone: undefined,
        email: undefined,
        name: undefined,
        address: undefined,
        status: false,
        ticket_type: false,
        ticket_value: 0,
        goods_type: false,
        goods_value: 0,
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
            status: false,
            ticket_type: false,
            ticket_value: 0,
            goods_type: false,
            goods_value: 0,
        };
        drawer.value = true;
    };
    const handleEdit = (index: string, row: DTO_RQ_Agent) => {
        console.log('row edit:', row);
        isEditMode.value = true;
        currentEditId.value = row.id ?? null;
        ruleForm.value = ({
            username: row.username,
            phone: row.phone,
            email: row.email,
            name: row.name,
            address: row.address,
            status: row.status,
            ticket_type: row.ticket_type,
            ticket_value: row.ticket_value,
            goods_type: row.goods_type,
            goods_value: row.goods_value,
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
    const handleDelete = async (index: number, row: DTO_RQ_Agent) => {
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
                agentList.value.splice(index, 1);
            } else {
                notifyWarning(response.message || 'Xóa đại lý thất bại!');
            }
        } catch (error) {
            if (error !== 'cancel' && error !== 'close') {
                notifyError('Xóa đại lý thất bại!');
                console.error(error);
            }
        }
    };

    const handleSubmitAgent = async (formEl?: FormInstance) => {
        if (!formEl) return;

        const valid = await formEl.validate();
        if (!valid) return;

        loadingSubmit.value = true;

        try {
            if (isEditMode.value && currentEditId.value !== null) {
                const response = await API_UpdateAgent(
                    currentEditId.value,
                    ruleForm.value as DTO_RQ_Agent
                );

                if (response.success) {
                    notifySuccess('Cập nhật đại lý thành công!');

                    const index = agentList.value.findIndex(
                        item => item.id === currentEditId.value
                    );

                    if (index !== -1) {
                        agentList.value[ index ] = {
                            ...response.result!,
                        };
                    }
                    await nextTick();
                    drawer.value = false;
                } else {
                    notifyWarning(response.message || 'Cập nhật đại lý thất bại!');
                }
            } else {
                const response = await API_CreateAgent(
                    useUserStore.company_id ?? '',
                    ruleForm.value as DTO_RQ_Agent
                );

                if (response.success) {
                    notifySuccess('Tạo đại lý thành công!');
                    agentList.value.push(response.result!);

                    await nextTick();
                    drawer.value = false;
                } else {
                    notifyWarning(response.message || 'Tạo đại lý thất bại!');
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
        isEditMode,
        currentEditId,
        ruleFormRef,
        drawer,
        loadingSubmit,
        ruleForm,
        handleAdd,
        handleEdit,
        resetForm,
        cancelClick,
        handleDelete,
        handleSubmitAgent,
    };
};