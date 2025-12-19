import type { FormInstance } from "element-plus";
import { API_CreateSchedule, API_DeleteSchedule, API_GetListScheduleByCompanyId, API_UpdateSchedule } from "~/services/resource-service/schedule/bms_schedule.api";
import type { Schedule } from "~/types/schedule/schedule.interface";

export const useScheduleManagement = () => {
    const useUserStore = userStore();
    const drawer = ref(false);
    const isEditMode = ref(false);
    const currentEditId = ref<number | null>(null);
    const schedules = ref<Schedule[]>([]);
    const loadingData = ref(false);
    const loadingSubmit = ref(false);
    const ruleFormRef = ref<FormInstance>();
    const ruleForm = ref<Schedule>({
        id: undefined,
        start_date: undefined,
        end_date: undefined,
        route_id: undefined,
        seat_chart_id: undefined,
        start_time: undefined,
        trip_type: undefined,
        repeat_type: undefined,
        weekdays: [],
        odd_even_type: undefined,
        is_known_end_date: false,
    });
    const resetForm = (formEl: FormInstance | undefined) => {
        if (!formEl) return
        formEl.resetFields()
        drawer.value = false
    }
    const cancelClick = () => {
        drawer.value = false;
        ruleFormRef.value?.resetFields();
    }
    const handleAdd = () => {
        isEditMode.value = false;
        currentEditId.value = null;
        ruleForm.value = {
            route_id: undefined,
            seat_chart_id: undefined,
            start_time: undefined,
            repeat_type: 'weekday',
            weekdays: [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday' ],
            odd_even_type: '',
            start_date: undefined,
            end_date: undefined,
            is_known_end_date: false,
        };
        drawer.value = true;
    };
    const handleEdit = (index: number, row: Schedule) => {
        isEditMode.value = true;
        currentEditId.value = row.id ?? null;
        const startTimeFormatted = row.start_time?.slice(0, 5) || '';

        ruleForm.value = {
            ...row,
            start_time: startTimeFormatted,
        };

        drawer.value = true;
    };
    const fetchListSchedules = async (company_id: string) => {
        loadingData.value = true;
        try {
            const response = await API_GetListScheduleByCompanyId(company_id);
            if (response.result) {
                schedules.value = response.result;
            } else {
                notifyError(response.message || 'Không có dữ liệu lịch chạy!');
            }
        } catch (error) {
            console.error(error);
            notifyError('Đã xảy ra lỗi khi tải danh sách lịch chạy!');
        } finally {
            loadingData.value = false;
        }
    };
    const handleDelete = async (index: number, row: Schedule) => {
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
            loadingData.value = true;
            const response = await API_DeleteSchedule(row.id!);
            if (response.success) {
                notifySuccess('Xóa lịch chạy thành công!');
                schedules.value = schedules.value.filter(schedule => schedule.id !== row.id);
            } else {
                notifyError(response.message || 'Xóa lịch chạy thất bại!');
                return;
            }
        } catch (error) {
            if (error !== 'cancel' && error !== 'close') {
                notifyError('Xóa lịch chạy thất bại!');
                console.error(error);
            }
        } finally {
            loadingData.value = false;
        }
    };
    const submitForm = async (formEl: FormInstance | undefined) => {
        if (!formEl) return;
        await formEl.validate(async (valid) => {
            if (!valid) return console.log('error submit!');
            loadingSubmit.value = true;
            try {
                if (isEditMode.value && currentEditId.value !== null) {
                    const response = await API_UpdateSchedule(
                        currentEditId.value,
                        ruleForm.value as Schedule
                    );
                    if (response.success) {
                        notifySuccess('Cập nhật lịch chạy thành công!');
                        const index = schedules.value.findIndex(item => item.id === currentEditId.value);
                        if (index !== -1) {
                            schedules.value[ index ] = response.result!;
                        }
                        //  Đợi animation nút loading hoàn tất rồi mới đóng
                        await nextTick();
                        drawer.value = false;
                    } else {
                        notifyError(response.message || 'Cập nhật phương tiện thất bại!');
                    }
                } else {
                    const response = await API_CreateSchedule(
                        useUserStore.company_id ?? '',
                        ruleForm.value as Schedule
                    );
                    if (response.success) {
                        notifySuccess('Tạo lịch chạy thành công!');
                        schedules.value.push(response.result!);
                        //  Đợi animation nút loading hoàn tất rồi mới đóng
                        await nextTick();
                        drawer.value = false;
                    } else {
                        notifyError(response.message || 'Tạo lịch chạy thất bại!');
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
        schedules,
        loadingData,
        loadingSubmit,
        ruleFormRef,
        ruleForm,
        fetchListSchedules,
        handleDelete,
        submitForm,
        handleAdd,
        handleEdit,
        cancelClick,
        resetForm,
    };
}