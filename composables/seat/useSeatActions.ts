/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormInstance } from "element-plus";
import type { DTO_RQ_SeatChart, SeatChart } from "~/types/seat/seat.interface";
import { seatChartList } from "./useSeatGlobal";
import { API_CreateSeatChart, API_DeleteSeatChart, API_UpdateSeatChart } from "~/services/resource-service/seat/bms-seat.api";

export const useSeatActions = () => {
    const useUserStore = userStore();
    const isEditMode = ref(false);
    const currentEditId = ref<string | null>(null);
    const ruleFormRef = ref<FormInstance>()
    const loadingSubmit = ref(false);
    const ruleForm = ref<DTO_RQ_SeatChart>({
        id: undefined,
        seat_chart_name: undefined,
        seat_chart_type: undefined,
        total_floor: undefined,
        total_row: undefined,
        total_column: undefined,
        seats: []
    });
    const handleExit = (formEl: FormInstance | undefined) => {
        if (!formEl) return
        formEl.resetFields()
        isEditMode.value = false
        currentEditId.value = null
        ruleForm.value = {
            id: undefined,
            seat_chart_name: undefined,
            seat_chart_type: undefined,
            total_floor: undefined,
            total_row: undefined,
            total_column: undefined,
            seats: []
        }
    }
    const handleSubmitSeatChart = async (formEl?: FormInstance) => {
        if (!formEl) return;
        const valid = await formEl.validate();
        if (!valid) return;
        loadingSubmit.value = true;
        try {
            if (isEditMode.value && currentEditId.value !== null) {
                const response = await API_UpdateSeatChart(
                    currentEditId.value,
                    ruleForm.value as DTO_RQ_SeatChart
                );
                if (response.success) {
                    notifySuccess('Cập nhật sơ đồ thành công!');
                    const index = seatChartList.value.findIndex(
                        item => item.id === currentEditId.value
                    );
                    if (index !== -1) {
                        seatChartList.value[ index ] = {
                            ...response.result!,
                        };
                    }
                    await handleExit(formEl);
                } else {
                    notifyWarning(response.message || 'Cập nhật sơ đồ thất bại!');
                }
            } else {
                const response = await API_CreateSeatChart(
                    useUserStore.company_id ?? '',
                    ruleForm.value as DTO_RQ_SeatChart
                );
                if (response.success) {
                    notifySuccess('Tạo sơ đồ thành công!');
                    seatChartList.value.push(response.result!);
                    await handleExit(formEl);
                } else {
                    notifyWarning(response.message || 'Tạo sơ đồ thất bại!');
                }
            }
        } catch (error: any) {
            const message =
                error?.response?.message ||
                'Đã xảy ra lỗi khi gửi biểu mẫu!';

            notifyError(message);
        }
        finally {
            loadingSubmit.value = false;
        }
    };

    const loadingDelete = ref(false);
    const handleDelete = async (formEl: FormInstance | undefined) => {
        console.log('Xoá sơ đồ ghế với ID:', currentEditId.value);
        if (!currentEditId.value) {
            notifyWarning('ID sơ đồ ghế không hợp lệ!');
            return;
        }
        try {
            loadingDelete.value = true;
            const response = await API_DeleteSeatChart(currentEditId.value);
            if (response.success) {
                notifySuccess('Xoá sơ đồ ghế thành công!');
                const index = seatChartList.value.findIndex(
                    item => item.id === currentEditId.value
                );
                if (index !== -1) {
                    seatChartList.value.splice(index, 1);
                }
                await handleExit(formEl);
            } else {
                notifyWarning(response.message || 'Xoá sơ đồ ghế thất bại!');
            }
        } catch (error: any) {
            const message =
                error?.response?.message ||
                'Đã xảy ra lỗi khi xoá sơ đồ ghế!';

            notifyError(message);
        } finally {
            loadingDelete.value = false;
        }
    };

    const handleClickRowSeatChart = (row: SeatChart) => {
        isEditMode.value = true;
        currentEditId.value = row.id || null;
        ruleForm.value = {
            id: row.id,
            seat_chart_name: row.seat_chart_name,
            seat_chart_type: row.seat_chart_type,
            total_floor: row.total_floor,
            total_row: row.total_row,
            total_column: row.total_column,
            seats: row.seats,
        };
    }



    return {
        handleSubmitSeatChart,
        isEditMode,
        ruleForm,
        ruleFormRef,
        loadingSubmit,
        handleClickRowSeatChart,
        handleExit,
        handleDelete,
        loadingDelete,

    }
}