import type { SeatChart, SeatChartName } from "~/types/seat/seat.interface";
import type { FormInstance } from 'element-plus'
import type { Ref } from 'vue'
import { API_CreateSeatChart, API_DeleteSeatChart, API_GetListSeatChartByCompanyId, API_GetListSeatChartNameByCompanyId, API_UpdateSeatChart } from "~/services/resource-service/seat/bms-seat.api";
export const useSeatManagement = () => {
    const useUserStore = userStore();
    const loadingData = ref(false);
    const loadingSubmit = ref(false);
    const loadingDelete = ref(false);
    const seatCharts = ref<SeatChart[]>([]);
    const seatChartsName = ref<SeatChartName[]>([]);
    const isEditMode = ref(false)
    const currentEditId = ref<number | null>(null);
    const ruleFormRef = ref<FormInstance>();
    const ruleForm = ref<SeatChart>({
        id: undefined,
        seat_chart_name: undefined,
        seat_chart_type: undefined,
        total_floor: undefined,
        total_row: undefined,
        total_column: undefined,
        total_seat: undefined,
        seats: [],
    });
    const handleRowClick = (row: SeatChart) => {
        isEditMode.value = true;
        currentEditId.value = row.id ?? null;

        ruleForm.value.id = row.id;
        ruleForm.value.seat_chart_name = row.seat_chart_name;
        ruleForm.value.seat_chart_type = row.seat_chart_type;
        ruleForm.value.total_floor = row.total_floor;
        ruleForm.value.total_row = row.total_row;
        ruleForm.value.total_column = row.total_column;
        ruleForm.value.seats = row.seats || [];

        console.log('Đã chọn sơ đồ:', row);
    };

    const handleExit = (formEl?: FormInstance | Ref<FormInstance | undefined>) => {
        // support passing the template ref (Ref<FormInstance>) or the raw FormInstance, or undefined
        try {
            const maybeRef = formEl && (('value' in (formEl as Ref<FormInstance | undefined>)) ? (formEl as Ref<FormInstance | undefined>).value : (formEl as FormInstance | undefined));
            if (maybeRef && typeof maybeRef.resetFields === 'function') {
                maybeRef.resetFields();
            }
        } catch (e) {
            // ignore reset errors
            console.warn('handleExit: unable to reset form fields', e);
        }

        // clear edit mode and reset internal form model so UI won't show deleted data
        isEditMode.value = false;
        currentEditId.value = null;
        ruleForm.value.seat_chart_name = undefined;
        ruleForm.value.seat_chart_type = undefined;
        ruleForm.value.total_floor = undefined;
        ruleForm.value.total_row = undefined;
        ruleForm.value.total_column = undefined;
        ruleForm.value.seats = [];
    };
    const fetchListSeatCharts = async (company_id: string) => {
        loadingData.value = true;
        try {
            const response = await API_GetListSeatChartByCompanyId(company_id);
            if (response.success) {
                seatCharts.value = response.result || [];
            } else {
                ElMessage.error(response.message || "Lấy danh sách sơ đồ ghế thất bại.");
            }
        } catch (error) {
            console.error(error);
            ElMessage.error("Lỗi khi tải danh sách sơ đồ ghế.");
        } finally {
            loadingData.value = false;
        }
    }
    const fetchListSeatChartsName = async (company_id: string) => {
        try {
            const response = await API_GetListSeatChartNameByCompanyId(company_id);
            if (response.success) {
                seatChartsName.value = response.result || [];
            } else {
                ElMessage.error(response.message || "Lấy danh sách tên sơ đồ ghế thất bại.");
            }
        } catch (error) {
            console.error(error);
            ElMessage.error("Lỗi khi tải danh sách tên sơ đồ ghế.");
        } 
    }
    const handleDelete = async (id: number) => {
        if (!currentEditId.value) return;
        loadingDelete.value = true;
        try {
            await ElMessageBox.confirm(
                'Bạn có chắc chắn muốn xóa sơ đồ ghế này?',
                'Xác nhận xoá',
                {
                    confirmButtonText: 'Xoá',
                    cancelButtonText: 'Huỷ',
                    type: 'warning',
                }
            );
            const response = await API_DeleteSeatChart(id!);
                    if (response.success) {
                        notifySuccess('Xóa sơ đồ ghế thành công!');
                        seatCharts.value = seatCharts.value.filter(seatChart => seatChart.id !== id);
                        // if the deleted chart is currently being edited/shown, clear the form and exit edit mode
                        if (currentEditId.value === id) {
                            // pass the template ref (ruleFormRef) if available by returning it from the composable consumer
                            // here we simply clear internal state via handleExit
                            handleExit(ruleFormRef);
                        }
                    } else {
                notifyError(response.message || 'Xóa sơ đồ ghế thất bại!');
                return;
            }
        } catch (error) {
            if (error !== 'cancel' && error !== 'close') {
                notifyError('Xóa sơ đồ ghế thất bại!');
                console.error(error);
            }
        } finally {
            loadingDelete.value = false;
        }
    };
    const submitForm = async (formEl: FormInstance | undefined) => {
        if (!formEl) return;
        await formEl.validate(async (valid) => {
            if (!valid) return console.log('error submit!');
            loadingSubmit.value = true;
            try {
                if (isEditMode.value && currentEditId.value !== null) {
                    console.log(ruleForm);
                    const response = await API_UpdateSeatChart(
                        currentEditId.value,
                        ruleForm.value as SeatChart,
                    );
                    if (response.success) {
                        notifySuccess('Cập nhật sơ đồ ghế thành công!');
                        const index = seatCharts.value.findIndex(seat_chart => seat_chart.id === currentEditId.value);
                        if (index !== -1) {
                            seatCharts.value[ index ] = {
                                ...seatCharts.value[ index ],
                                ...ruleForm.value,
                            };
                        }
                        handleExit(formEl);
                    } else {
                        notifyError(response.message || 'Cập nhật sơ đồ ghế thất bại!');
                    }
                } else {
                    console.log('Thêm mới sơ đồ ghế:', ruleForm);
                    const response = await API_CreateSeatChart(
                        useUserStore.company_id ?? '',
                        ruleForm.value as SeatChart
                    );
                    if (response.success) {
                        notifySuccess('Thêm sơ đồ ghế mới thành công!');
                        if (response.result) {
                            seatCharts.value.push(response.result);
                            handleExit(formEl);
                        }
                    } else {
                        notifyError(response.message || 'Thêm sơ đồ ghế mới thất bại!');
                    }
                }
            } catch (error) {
                notifyError('Đã xảy ra lỗi khi gửi biểu mẫu!');
                console.error(error);
            } finally {
                loadingSubmit.value = false;
            }

        });
    }
    return {
        fetchListSeatChartsName,
        seatChartsName,
        loadingData,
        loadingSubmit,
        seatCharts,
        isEditMode,
        currentEditId,
        ruleFormRef,
        fetchListSeatCharts,
        submitForm,
        ruleForm,
        handleDelete,
        handleExit,
        handleRowClick,
        loadingDelete,
    };
}