<script setup lang="ts">
import {
    Plus, Delete, Edit
} from '@element-plus/icons-vue'
import type { DrawerProps, FormInstance, FormRules } from 'element-plus'
import type { DTO_RQ_Schedule, ScheduleType } from '~/types/scheduleType';
import Select from '~/components/inputs/select.vue'
import type { DTO_RP_ListRouteName } from '~/types/routeType';
import { getListRouteNameByCompany } from '~/api/routeAPI';
import type { SeatChartNameType } from '~/types/seatType';
import { getSeatChartNameByCompany } from '~/api/seatAPI';
import InputDate from '~/components/inputs/inputDate.vue';
import { createSchedule, deleteSchedule, getListSchedulesByCompany, updateSchedule } from '~/api/scheduleAPI';
import { format } from 'date-fns'
import type { UserActionType } from '~/types/userType';
definePageMeta({
    layout: 'default',
})
const useUserStore = userStore();
const drawer = ref(false)
const direction = ref<DrawerProps['direction']>('rtl')
const isEditMode = ref(false)
const currentEditId = ref<number | null>(null);
const loading = ref(false);
const schedules = ref<ScheduleType[]>([]);
const routeNames = ref<DTO_RP_ListRouteName[]>([]);
const seatChartNames = ref<SeatChartNameType[]>([]);

const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules>({
    route_id: [
        { required: true, message: 'Vui lòng chọn tuyến', trigger: 'blur' },
    ],
    start_time: [
        { required: true, message: 'Vui lòng chọn thời gian khởi hành', trigger: 'blur' },
    ],
    trip_type: [
        { required: true, message: 'Vui lòng chọn loại chuyến', trigger: 'blur' },
    ],
    start_date: [
        { required: true, message: 'Vui lòng chọn ngày bắt đầu', trigger: 'blur' },
    ],
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
const ruleForm = ref<DTO_RQ_Schedule>({
    route_id: null,
    seat_chart_id: null,
    start_time: '',
    repeat_type: 'weekday',
    weekdays: [],
    odd_even_type: '',
    start_date: null,
    end_date: null,
    trip_type: null,
    is_known_end_date: false,
});
const handleAdd = () => {
    isEditMode.value = false;
    currentEditId.value = null;
    Object.assign(ruleForm, {
        route_id: null,
        seat_chart_id: null,
        start_time: '',
        repeat_type: 'weekday',
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        odd_even_type: '',
        start_date: null,
        end_date: null,
        is_known_end_date: false,
    });
    drawer.value = true;
};
const handleEdit = (index: number, row: ScheduleType) => {
    isEditMode.value = true;
    currentEditId.value = row.id;
    Object.assign(ruleForm, { ...row });
    drawer.value = true;
};

const fetchListRouteName = async () => {
    loading.value = true;
    try {
        const response = await getListRouteNameByCompany(useUserStore.company_id ?? '');
        if (response.result) {
            routeNames.value = response.result;
            console.log(routeNames.value);
        } else {
            ElNotification({
                message: h('p', { style: 'color: red' }, 'Không tìm thấy tuyến nào!'),
                type: 'warning',
            });
        }
    } catch (error) {
        ElNotification({
            message: h('p', { style: 'color: red' }, 'Đã xảy ra lỗi khi tải danh sách tuyến!'),
            type: 'error',
        });
        console.error('Error fetching route names:', error);
    } finally {
        loading.value = false;
    }
};
const fetchListSeatChartName = async () => {
    loading.value = true;
    try {
        const response = await getSeatChartNameByCompany(useUserStore.company_id ?? '');
        if (response.result) {
            seatChartNames.value = response.result;
            console.log(seatChartNames.value);
        } else {
            ElNotification({
                message: h('p', { style: 'color: red' }, 'Không tìm thấy sơ đồ ghế nào!'),
                type: 'warning',
            });
        }
    } catch (error) {
        ElNotification({
            message: h('p', { style: 'color: red' }, 'Đã xảy ra lỗi khi tải danh sách sơ đồ ghế!'),
            type: 'error',
        });
        console.error('Error fetching seat chart names:', error);
    } finally {
        loading.value = false;
    }
};
const fetchListSchedules = async () => {
    loading.value = true;
    try {
        const response = await getListSchedulesByCompany(useUserStore.company_id ?? '');
        if (response.result) {
            schedules.value = response.result;
            console.log("Danh sách lịch chạy:", schedules.value);
        } else {
            ElNotification({
                message: h('p', { style: 'color: red' }, 'Không tìm thấy lịch chạy nào!'),
                type: 'warning',
            });
        }
    } catch (error) {
        ElNotification({
            message: h('p', { style: 'color: red' }, 'Đã xảy ra lỗi khi tải danh sách lịch chạy!'),
            type: 'error',
        });
        console.error('Error fetching schedules:', error);
    } finally {
        loading.value = false;
    }
};



const handleDelete = async (index: number, row: ScheduleType) => {
    loading.value = true;
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

        await deleteSchedule(
            {
                id: useUserStore.id,
                username: useUserStore.username,
                full_name: useUserStore.full_name,
                company_id: useUserStore.company_id,
            } as UserActionType,
            row.id!
        );
        schedules.value = schedules.value.filter(schedule => schedule.id !== row.id);
        ElNotification({
            message: h('p', { style: 'color: teal' }, 'Xóa lịch chạy thành công!'),
            type: 'success',
        });
    } catch (error) {
        if (error !== 'cancel' && error !== 'close') {
            ElNotification({
                message: h('p', { style: 'color: red' }, 'Xóa lịch chạy thất bại!'),
                type: 'error',
            });
            console.error(error);
        }
    } finally {
        loading.value = false;
    }
};
const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    await formEl.validate(async (valid) => {
        if (valid) {
            try {
                if (isEditMode.value && currentEditId.value !== null) {

                    console.log(ruleForm);
                    const response = await updateSchedule(
                        {
                            id: useUserStore.id,
                            username: useUserStore.username,
                            full_name: useUserStore.full_name,
                            company_id: useUserStore.company_id,
                        } as UserActionType,
                        ruleForm.value as DTO_RQ_Schedule,
                        currentEditId.value
                    );
                    if (response.success) {
                        ElNotification({
                            message: h('p', { style: 'color: teal' }, 'Cập nhật lịch chạy thành công!'),
                            type: 'success',
                        })
                        const index = schedules.value.findIndex(schedule => schedule.id === currentEditId.value);
                        if (index !== -1) {
                            schedules.value[index] = {
                                ...schedules.value[index],
                                ...ruleForm
                            };
                        }
                    } else {
                        ElNotification({
                            message: h('p', { style: 'color: red' }, response.message || 'Cập nhật lịch chạy thất bại!'),
                            type: 'error',
                        });
                    }
                } else {
                    console.log('Thêm lịch chạy mới:', ruleForm);
                    const response = await createSchedule(
                        {
                            id: useUserStore.id,
                            username: useUserStore.username,
                            full_name: useUserStore.full_name,
                            company_id: useUserStore.company_id,
                        } as UserActionType,
                        ruleForm.value as DTO_RQ_Schedule
                    );
                    if (response.success) {
                        ElNotification({
                            message: h('p', { style: 'color: green' }, 'Thêm lịch chạy thành công!'),
                            type: 'success',
                        });
                        if (response.result) {
                            schedules.value.push(response.result);
                        }
                    } else {
                        ElNotification({
                            message: h('p', { style: 'color: red' }, response.message || 'Thêm lịch chạy thất bại!'),
                            type: 'error',
                        });
                    }
                }
                drawer.value = false;
            } catch (error) {
                ElNotification({
                    message: h('p', { style: 'color: red' }, 'Đã xảy ra lỗi. Vui lòng thử lại!'),
                    type: 'error',
                });
                console.error(error);
            }
        } else {
            console.log('error submit!');
        }
    });

}
const routeNameOptions = computed(() =>
    routeNames.value.map(r => ({
        label: r.route_name,
        value: r.id
    }))
);
const seatChartNameOptions = computed(() =>
    seatChartNames.value.map(s => ({
        label: s.seat_chart_name,
        value: s.id
    }))
);
const optionsTypeTrip = [
    { label: 'Chuyến cố định chở khách', value: 1 },
    { label: 'Chuyến cố định chở hàng', value: 2 },
    { label: 'Xe hợp đồng', value: 3 },
]
const showSeatChart = computed(() => ruleForm.value.trip_type === 1 || ruleForm.value.trip_type === 3)
watch(
    () => ruleForm.value.trip_type,
    (newVal) => {
        if (newVal === 2) {
            ruleForm.value.seat_chart_id = null
        }
    }
)
watch(() => ruleForm.value.repeat_type, (newType, oldType) => {
    if (newType !== oldType) {
        if (newType === 'weekday') {
            ruleForm.value.odd_even_type = ''
            // ruleForm.value.weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
        } else if (newType === 'odd_even') {
            // ruleForm.value.weekdays = []
            ruleForm.value.odd_even_type = 'odd'
        }
    }
})
watch(() => ruleForm.value.is_known_end_date, (val) => {
    if (!val) {
        ruleForm.value.end_date = null;
    }
})

onMounted(() => {
    useUserStore.loadUserInfo();
    fetchListRouteName();
    fetchListSeatChartName();
    fetchListSchedules();
}); 
</script>
<template>
    <section>
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">DANH SÁCH LỊCH CHẠY</h3>
            <el-button :icon="Plus" type="primary" @click="handleAdd">Thêm lịch chạy</el-button>
        </div>
        <el-table v-loading="loading" element-loading-text="Đang tải dữ liệu..." :data="schedules" style="width: 100%">
            <el-table-column type="index" label="STT" width="50" />
            <el-table-column label="Tuyến" prop="route_name" />
            <el-table-column label="Sơ đồ ghế" prop="seat_chart_name" />
            <el-table-column label="Thời gian khởi hành" prop="start_time">
                <template #default="{ row }">
                    {{ row.start_time?.substring(0, 5) }}
                </template>
            </el-table-column>

            <el-table-column label="Ngày bắt đầu" prop="start_date">
                <template #default="scope">
                    {{ format(new Date(scope.row.start_date), 'dd/MM/yyyy') }}
                </template>
            </el-table-column>
            <el-table-column label="Ngày kết thúc" prop="end_date">
                <template #default="scope">
                    <span v-if="scope.row.end_date">
                        {{ format(new Date(scope.row.end_date), 'dd/MM/yyyy') }}
                    </span>
                </template>
            </el-table-column>

            <el-table-column label="Loại chuyến" prop="trip_type">
                <template #default="{ row }">
                    {{
                        optionsTypeTrip.find(option => option.value === row.trip_type)?.label || 'Không rõ'
                    }}
                </template>
            </el-table-column>
            <el-table-column align="right">
                <template #header>
                    Tùy chọn
                </template>
                <template #default="scope">
                    <el-button type="primary" :icon="Edit" circle @click="handleEdit(scope.$index, scope.row)" />
                    <el-button circle type="danger" :icon="Delete" @click="handleDelete(scope.$index, scope.row)" />

                </template>
            </el-table-column>
        </el-table>

        <el-drawer v-model="drawer" :direction="direction" :before-close="cancelClick">
            <template #header>
                <div class="font-semibold text-lg text-black">{{ isEditMode ? 'Chỉnh sửa lịch chạy' : 'Thêm lịch chạy'
                }}</div>
            </template>
            <template #default>
                <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="auto">
                    <div>
                        <h2 class="text-gray-500 font-medium mb-5">THÔNG TIN LỊCH CHẠY</h2>

                        <Select v-model="ruleForm.route_id" prop="route_id" label="Tuyến" :options="routeNameOptions"
                            clearable />
                        <Select v-model="ruleForm.trip_type" prop="trip_type" label="Loại chuyến"
                            :options="optionsTypeTrip" clearable />
                        <Select v-if="showSeatChart" v-model="ruleForm.seat_chart_id" prop="seat_chart_id"
                            label="Sơ đồ ghế" :options="seatChartNameOptions" clearable />
                        <el-form-item prop="start_time" label-position="top">
                            <template #label>
                                <span class="text-sm font-medium text-gray-700">Thời gian khởi hành</span>
                            </template>
                            <el-time-select v-model="ruleForm.start_time" start="00:05" step="00:05" end="23:55"
                                placeholder="Chọn thời gian" style="width: 180px" />
                        </el-form-item>
                        <div class="mb-4">
                            <span class="text-sm font-medium text-gray-700 block mb-3">Lặp lại lịch</span>
                            <el-radio-group v-model="ruleForm.repeat_type">
                                <el-radio value="weekday">Lặp theo thứ</el-radio>
                                <el-radio value="odd_even">Lặp theo ngày chẵn, lẻ</el-radio>
                            </el-radio-group>
                        </div>


                        <div v-if="ruleForm.repeat_type === 'weekday'" class="mb-4">
                            <span class="text-sm font-medium text-gray-700 block mb-3">Chọn các ngày trong tuần</span>
                            <el-checkbox-group v-model="ruleForm.weekdays">
                                <el-checkbox value="Monday">Thứ 2</el-checkbox>
                                <el-checkbox value="Tuesday">Thứ 3</el-checkbox>
                                <el-checkbox value="Wednesday">Thứ 4</el-checkbox>
                                <el-checkbox value="Thursday">Thứ 5</el-checkbox>
                                <el-checkbox value="Friday">Thứ 6</el-checkbox>
                                <el-checkbox value="Saturday">Thứ 7</el-checkbox>
                                <el-checkbox value="Sunday">Chủ nhật</el-checkbox>
                            </el-checkbox-group>
                        </div>


                        <div v-if="ruleForm.repeat_type === 'odd_even'" class="mb-4">
                            <span class="text-sm font-medium text-gray-700 block mb-3">Chọn loại ngày</span>
                            <el-radio-group v-model="ruleForm.odd_even_type">
                                <el-radio value="odd">Ngày lẻ</el-radio>
                                <el-radio value="even">Ngày chẵn</el-radio>
                            </el-radio-group>
                        </div>
                        <el-checkbox v-model="ruleForm.is_known_end_date" label="Đã biết ngày dừng" />
                        <InputDate v-model="ruleForm.start_date" label="Ngày bắt đầu" prop="start_date"
                            placeholder="Chọn ngày" type="date" format="DD/MM/YYYY" value-format="YYYY-MM-DD"
                            clearable />


                        <InputDate v-if="ruleForm.is_known_end_date" v-model="ruleForm.end_date" label="Ngày kết thúc"
                            prop="end_date" placeholder="Chọn ngày" type="date" format="DD/MM/YYYY"
                            value-format="YYYY-MM-DD" clearable />
                    </div>
                </el-form>

            </template>
            <template #footer>
                <div style="flex: auto">
                    <el-button @click="resetForm(ruleFormRef)">Thoát</el-button>
                    <el-button type="primary" @click="submitForm(ruleFormRef)">Lưu</el-button>
                </div>
            </template>
        </el-drawer>
    </section>
</template>
<style scoped>
:deep(.el-drawer__footer) {
    padding-bottom: 10px !important;
    background-color: whitesmoke !important;
    border-top: 1px solid rgb(240, 240, 240) !important;
}

:deep(.el-drawer__header) {
    background-color: whitesmoke !important;
    border-bottom: 1px solid rgb(240, 240, 240) !important;
    padding-bottom: 20px;
    margin-bottom: 0 !important;
}
</style>