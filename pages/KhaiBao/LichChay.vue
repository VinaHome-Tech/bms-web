<script setup lang="ts">
import {
    Plus, Delete, Edit, Checked
} from '@element-plus/icons-vue'
import type { DrawerProps, FormRules } from 'element-plus'
import Select from '~/components/inputs/select.vue'
import InputDate from '~/components/inputs/inputDate.vue';
import { format } from 'date-fns'
import { useRouteManagement } from '~/composables/route/useRouteManagement';
import { useSeatManagement } from '~/composables/seat/useSeatManagement';
import { useRouteList } from '~/composables/route/useRouteList';
import { useScheduleList } from '~/composables/schedule/useScheduleList';
import { useScheduleActions } from '~/composables/schedule/useScheduleActions';
import { routeNameList } from '~/composables/route/useRouteGlobal';
import { useSeatList } from '~/composables/seat/useSeatList';
import { seatChartNameList } from '~/composables/seat/useSeatGlobal';
definePageMeta({
    layout: 'default',
})
const {
    routesName,
    fetchListRoutesName,
} = useRouteManagement();
const {
    // seatChartsName,
    fetchListSeatChartsName,
} = useSeatManagement();

const {
    fetchListRouteName,
} = useRouteList();
const {
    fetchListSeatChartName,
} = useSeatList();
const {
} = useScheduleList();

const {
    isEditMode,
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
} = useScheduleActions();
const useUserStore = userStore();

const direction = ref<DrawerProps[ 'direction' ]>('rtl')

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


const routeNameOptions = computed(() =>
    routeNameList.value.map(r => ({
        label: r.route_name,
        value: r.id
    }))
);
const seatChartNameOptions = computed(() =>
    seatChartNameList.value.map(s => ({
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
            ruleForm.value.seat_chart_id = undefined;
        }
    }
)
watch(
  () => ruleForm.value.repeat_type,
  (newType) => {
    // normalize: chỉ true | false
    const value = newType === true;
    ruleForm.value.repeat_type = value;

    // reset luôn mỗi lần đổi
    ruleForm.value.weekdays = [];
    ruleForm.value.odd_even_type = false;
  },
  { immediate: true }
);


watch(() => ruleForm.value.is_known_end_date, (val) => {
    if (!val) {
        ruleForm.value.end_date = undefined;
    }
})

onMounted(async () => {
    await useUserStore.loadUserInfo();
    // await fetchListSchedules(useUserStore.company_id ?? '');
    await fetchListRoutesName(useUserStore.company_id ?? '');
    // await fetchListSeatChartsName(useUserStore.company_id ?? '');

    await fetchListRouteName(useUserStore.company_id ?? '');
    await fetchListSeatChartName(useUserStore.company_id ?? '');
}); 
</script>
<template>
    <section>
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">DANH SÁCH LỊCH CHẠY</h3>
            <el-button :icon="Plus" type="primary" @click="handleAdd">Thêm lịch chạy</el-button>
        </div>
        <el-table v-loading="loadingData" element-loading-text="Đang tải dữ liệu..." :data="schedules"
            style="width: 100%">
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
                                placeholder="Chọn thời gian" style="width: 180px" format="HH:mm" />
                        </el-form-item>
                        <div class="mb-4">
                            <span class="text-sm font-medium text-gray-700 block mb-3">Lặp lại lịch</span>
                            <el-radio-group v-model="ruleForm.repeat_type">
                                <el-radio :value="false">Lặp theo thứ</el-radio>
                                <el-radio :value="true">Lặp theo ngày chẵn, lẻ</el-radio>
                            </el-radio-group>

                        </div>


                        <div v-if="ruleForm.repeat_type === false" class="mb-4">
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


                        <div v-if="ruleForm.repeat_type === true" class="mb-4">
                            <span class="text-sm font-medium text-gray-700 block mb-3">Chọn loại ngày</span>
                            <el-radio-group v-model="ruleForm.odd_even_type">
                                <el-radio :value="false">Ngày lẻ</el-radio>
                                <el-radio :value="true">Ngày chẵn</el-radio>
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
                    <el-button type="primary" :icon="Checked" :loading="loadingSubmit"
                        @click="handleSubmitSchedule(ruleFormRef)">
                        {{ loadingSubmit ? 'Đang lưu...' : 'Lưu thông tin' }}
                    </el-button>
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