import type { FormInstance } from "element-plus";
import type { DTO_RQ_Schedule, Schedule } from "~/types/schedule/schedule.interface";
import { scheduleList } from "./useScheduleGlobal";
import { API_CreateSchedule, API_DeleteSchedule, API_UpdateSchedule } from "~/services/resource-service/schedule/bms-schedule.api";

export const useScheduleActions = () => {
    const useUserStore = userStore();
    const isEditMode = ref(false);
    const currentEditId = ref<string | null>(null);
    const ruleFormRef = ref<FormInstance>()
    const loadingSubmit = ref(false);
    const drawer = ref(false);
    const ruleForm = ref<DTO_RQ_Schedule>({
        route_id: undefined,
        trip_type: undefined,
        seat_chart_id: undefined,
        start_time: undefined,
        repeat_type: false, // Lặp theo thứ / Lặp theo ngày chẵn, lẻ
        weekdays: [], // Nếu repeat_type = false -> Các thứ trong tuần được chọn
        odd_even_type: false, // Nếu repeat_type = true -> Ngày chẵn / Ngày lẻ
        is_known_end_date: false, // Đã biết ngày dừng
        start_date: undefined,
        end_date: undefined,
    });
    const handleAdd = () => {
        isEditMode.value = false;
        currentEditId.value = null;
        ruleForm.value = {
            route_id: undefined,
            trip_type: undefined,
            seat_chart_id: undefined,
            start_time: undefined,
            repeat_type: false,
            weekdays: [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday' ],
            odd_even_type: false,
            is_known_end_date: false,
            start_date: undefined,
            end_date: undefined,
        };
        drawer.value = true;
    };

    const handleEdit = (index: string, row: Schedule) => {
        isEditMode.value = true;
        currentEditId.value = row.id ?? null;
        ruleForm.value = ({
            route_id: row.route.id?.toString(),
            trip_type: row.trip_type,
            seat_chart_id: row.seat_chart.id?.toString(),
            start_time: row.start_time,
            repeat_type: row.repeat_type ? true : false,
            weekdays: row.weekdays || [],
            odd_even_type: row.odd_even_type ? true : false,
            is_known_end_date: row.is_known_end_date || false,
            start_date: row.start_date,
            end_date: row.end_date,
        });
        drawer.value = true;
        console.log('Edit schedule:', row);
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
    const handleDelete = async (index: number, row: DTO_RQ_Schedule) => {
        try {
            await ElMessageBox.confirm(
                'Bạn có chắc chắn muốn xóa lịch chạy này?',
                'Xác nhận xoá',
                {
                    confirmButtonText: 'Xoá',
                    cancelButtonText: 'Huỷ',
                    type: 'warning',
                }
            );

            const response = await API_DeleteSchedule(row.id!);
            if (response.success) {
                notifySuccess('Xóa lịch chạy thành công!');
                scheduleList.value.splice(index, 1);
            } else {
                notifyWarning(response.message || 'Xóa lịch chạy thất bại!');
            }
        } catch (error) {
            if (error !== 'cancel' && error !== 'close') {
                notifyError('Xóa lịch chạy thất bại!');
                console.error(error);
            }
        }
    };

    const handleSubmitSchedule = async (formEl?: FormInstance) => {
        if (!formEl) return;
        const valid = await formEl.validate();
        if (!valid) return;
        loadingSubmit.value = true;
        try {
            if (isEditMode.value && currentEditId.value !== null) {
                const response = await API_UpdateSchedule(
                    currentEditId.value,
                    ruleForm.value as DTO_RQ_Schedule
                );

                if (response.success) {
                    notifySuccess('Cập nhật lịch chạy thành công!');
                    const index = scheduleList.value.findIndex(
                        item => item.id === currentEditId.value
                    );
                    if (index !== -1) {
                        scheduleList.value[ index ] = {
                            ...response.result!,
                        };
                    }
                    await nextTick();
                    drawer.value = false;
                } else {
                    notifyWarning(response.message || 'Cập nhật lịch chạy thất bại!');
                }
            } else {
                const response = await API_CreateSchedule(
                    useUserStore.company_id ?? '',
                    ruleForm.value as DTO_RQ_Schedule
                );
                if (response.success) {
                    notifySuccess('Tạo lịch chạy thành công!');
                    scheduleList.value.push(response.result!);
                    await nextTick();
                    drawer.value = false;
                } else {
                    notifyWarning(response.message || 'Tạo lịch chạy thất bại!');
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
        loadingSubmit,
        drawer,
        ruleForm,
        handleAdd,
        handleEdit,
        resetForm,
        cancelClick,
        handleDelete,
        handleSubmitSchedule,

    }
}