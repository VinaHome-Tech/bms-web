<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import type { DTO_RQ_SeatChart, SeatChartType, SeatType } from '~/types/seatType';
import { createSeatChart, deleteSeatChart, getSeatChartByCompany, updateSeatChart } from '~/api/seatAPI';
import type { UserActionType } from '~/types/userType';
definePageMeta({
    layout: 'default',
})

const useUserStore = userStore();
const isEditMode = ref(false)
const currentEditId = ref<number | null>(null);
const loading = ref(false);
const isSubmitting = ref(false);
const seatChart = ref<SeatChartType[]>([]);

const ruleFormRef = ref<FormInstance>()
const rules = {
    seat_chart_name: [
        { required: true, message: 'Vui lòng nhập tên sơ đồ', trigger: 'blur' }
    ],
    total_floor: [
        { required: true, message: 'Vui lòng chọn số tầng', trigger: 'change' }
    ],
    total_row: [
        { required: true, message: 'Vui lòng chọn số hàng', trigger: 'change' }
    ],
    total_column: [
        { required: true, message: 'Vui lòng chọn số cột', trigger: 'change' }
    ],
    seat_chart_type: [
        { required: true, message: 'Vui lòng chọn loại sơ đồ ghế', trigger: 'change' }
    ],
}

const optionsFloor = Array.from({ length: 3 }, (_, i) => ({
    label: `${i + 1} tầng`,
    value: i + 1,
}))

const optionsColumn = Array.from({ length: 10 }, (_, i) => ({
    label: `${i + 1} cột`,
    value: i + 1,
}))

const optionsRow = Array.from({ length: 10 }, (_, i) => ({
    label: `${i + 1} hàng`,
    value: i + 1,
}))
const fetchSeatCharts = async () => {
    loading.value = true;
    try {
        const response = await getSeatChartByCompany(useUserStore.company_id ?? '');
        if (response.result) {
            seatChart.value = response.result;
            console.log('Danh sách sơ đồ ghế:', seatChart.value);
        } else {
            ElNotification({
                message: h('p', { style: 'color: red' }, response.message || 'Không có dữ liệu sơ đồ ghế!'),
                type: 'error',
            });
        }
    } catch (error) {
        ElNotification({
            message: h('p', { style: 'color: red' }, 'Đã xảy ra lỗi khi tải danh sơ đồ!'),
            type: 'error',
        });
        console.error(error);
    } finally {
        loading.value = false;
    }
}



const ruleForm = reactive<DTO_RQ_SeatChart>({
    id: null,
    seat_chart_name: null,
    seat_chart_type: 1,
    total_floor: 1,
    total_row: 1,
    total_column: 1,
    seats: [],
});



const showSeatChart = computed(() => {
    return ruleForm.total_floor && ruleForm.total_row && ruleForm.total_column
})

const getGridStyle = (_floor: number) => {
    return {
        gridTemplateColumns: `repeat(${ruleForm.total_column}, minmax(100px, 1fr))`,
        gridTemplateRows: `repeat(${ruleForm.total_row}, minmax(80px, 1fr))`,
        gap: '10px'
    }
}

const getSeatsForFloor = (floor: number) => {
    if (!ruleForm.seats) return []

    // Lọc ghế theo tầng
    const floorSeats = ruleForm.seats.filter(seat => seat.floor === floor)

    // Sắp xếp ghế theo hàng (row) và cột (column)
    const sortedSeats = floorSeats.sort((a, b) => {
        // Ưu tiên sắp xếp theo hàng trước
        if ((a.row ?? 0) !== (b.row ?? 0)) {
            return (a.row ?? 0) - (b.row ?? 0)
        }
        // Nếu cùng hàng thì sắp xếp theo cột
        return (a.column ?? 0) - (b.column ?? 0)
    })

    console.log(`Tầng ${floor}: ${sortedSeats.length} ghế`, sortedSeats)
    return sortedSeats
}


const getSeatClass = (seat: SeatType) => {
    const baseClasses = 'py-1 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 border-2 relative text-white';

    if (seat.status) {
        return `${baseClasses} bg-green-500 hover:bg-green-600`;
    } else {
        return `${baseClasses} bg-gray-300 hover:bg-gray-400`;
    }
};




const generateSeats = () => {
    if (!showSeatChart.value) return

    const currentSeats = ruleForm.seats || []
    const newSeats = []

    const seatMap = new Map()
    currentSeats.forEach(seat => {
        if (seat.code) {
            seatMap.set(seat.code, seat)
        }
    })

    for (let floor = 1; floor <= (ruleForm.total_floor ?? 0); floor++) {
        for (let row = 1; row <= (ruleForm.total_row ?? 0); row++) {
            for (let col = 1; col <= (ruleForm.total_column ?? 0); col++) {
                const seatCode = `F${floor}-C${col}-R${row}`

                if (seatMap.has(seatCode)) {
                    const existingSeat = seatMap.get(seatCode)
                    newSeats.push({
                        ...existingSeat,
                        floor,
                        row,
                        column: col
                    })
                } else {
                    newSeats.push({
                        id: null,
                        name: null,
                        code: seatCode,
                        status: false,
                        floor,
                        row,
                        column: col,
                        type: 1,
                    })
                }
            }
        }
    }

    ruleForm.seats = newSeats
    console.log('Ghế mới:', newSeats)
}


const handleRowClick = (row: SeatChartType) => {
    isEditMode.value = true;
    currentEditId.value = row.id;

    ruleForm.id = row.id;
    ruleForm.seat_chart_name = row.seat_chart_name;
    ruleForm.seat_chart_type = row.seat_chart_type;
    ruleForm.total_floor = row.total_floor;
    ruleForm.total_row = row.total_row;
    ruleForm.total_column = row.total_column;
    ruleForm.seats = row.seats || [];

    console.log('Đã chọn sơ đồ:', row);
};
const handleExit = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
    isEditMode.value = false;
    currentEditId.value = null;
    ruleForm.seat_chart_name = null;
    ruleForm.seat_chart_type = 1;
    ruleForm.total_floor = 1;
    ruleForm.total_row = 1;
    ruleForm.total_column = 1;
    ruleForm.seats = [];
};
const handleDelete = async () => {
    if (!currentEditId.value) return;
    isSubmitting.value = true;
    try {
        await ElMessageBox.confirm(
            'Bạn có chắc chắn muốn xóa sơ đồ này?',
            'Xác nhận xoá',
            {
                confirmButtonText: 'Xoá',
                cancelButtonText: 'Huỷ',
                type: 'warning',
            }
        );

        const response = await deleteSeatChart(currentEditId.value, {
            id: useUserStore.id,
            username: useUserStore.username,
            full_name: useUserStore.full_name,
            company_id: useUserStore.company_id,
        } as UserActionType);
        if (response.success) {
            ElNotification({
                message: h('p', { style: 'color: green' }, 'Xoá sơ đồ thành công!'),
                type: 'success',
            });
            seatChart.value = seatChart.value.filter(item => item.id !== currentEditId.value);
            handleExit(ruleFormRef.value);
        } else {
            ElNotification({
                message: h('p', { style: 'color: red' }, response.message || 'Xoá sơ đồ thất bại!'),
                type: 'error',
            });
            return;
        }


    } catch (error) {
        if (error !== 'cancel') {
            ElNotification({
                message: h('p', { style: 'color: red' }, 'Đã xảy ra lỗi khi xoá sơ đồ!'),
                type: 'error',
            });
            console.error(error);
        }
    } finally {
        isSubmitting.value = false;
    }
};
const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    isSubmitting.value = true;
    await formEl.validate(async (valid) => {
        if (valid) {
            try {
                if (isEditMode.value && currentEditId.value !== null) {

                    console.log(ruleForm);
                    const response = await updateSeatChart(
                        {
                            id: useUserStore.id,
                            username: useUserStore.username,
                            full_name: useUserStore.full_name,
                            company_id: useUserStore.company_id,
                        } as UserActionType,
                        ruleForm as DTO_RQ_SeatChart,
                        currentEditId.value,
                    );
                    if (response.success) {
                        ElNotification({
                            message: h('p', { style: 'color: teal' }, 'Cập nhật sơ đồ thành công!'),
                            type: 'success',
                        })
                        const index = seatChart.value.findIndex(seat_chart => seat_chart.id === currentEditId.value);
                        if (index !== -1) {
                            seatChart.value[index] = {
                                ...seatChart.value[index],
                                ...ruleForm,
                            };

                        }
                        handleExit(formEl);
                    }
                } else {
                    console.log('Thêm mới sơ đồ ghế:', ruleForm);
                    const response = await createSeatChart(
                        {
                            id: useUserStore.id,
                            username: useUserStore.username,
                            full_name: useUserStore.full_name,
                            company_id: useUserStore.company_id,
                        } as UserActionType,
                        ruleForm as DTO_RQ_SeatChart
                    );
                    if (response.success) {
                        ElNotification({
                            message: h('p', { style: 'color: green' }, 'Thêm sơ đồ ghế mới thành công!'),
                            type: 'success',
                        });
                        if (response.result) {
                            seatChart.value.push(response.result);
                            handleExit(formEl);
                        }
                    } else {
                        ElNotification({
                            message: h('p', { style: 'color: red' }, response.message || 'Thêm sơ đồ ghế mới thất bại!'),
                            type: 'error',
                        });
                    }
                }
            } catch (error) {
                ElNotification({
                    message: h('p', { style: 'color: red' }, 'Đã xảy ra lỗi. Vui lòng thử lại!'),
                    type: 'error',
                });
                console.error(error);
            } finally {
                isSubmitting.value = false;
            }
        } else {
            console.log('error submit!');
            ElNotification({
                message: h('p', { style: 'color: red' }, 'Vui lòng kiểm tra lại thông tin!'),
                type: 'error',
            });
            isSubmitting.value = false;
        }
    });
}


const optionsTypeSeat = [
    { label: 'Ghế đơn', value: 1 },
    { label: 'Ghế đôi', value: 2 },
]
const optionsCategorySeatChart = [
    { label: 'Ghế ngồi', value: 1 },
    { label: 'Ghế ngồi limousine', value: 2 },
    { label: 'Giường nằm', value: 3 },
    { label: 'Giường nằm limousine', value: 4 },
    { label: 'Phòng VIP (Cabin đơn)', value: 5 },
    { label: 'Phòng VIP (Cabin đôi)', value: 6 },
]
onMounted(() => {
    useUserStore.loadUserInfo();
    fetchSeatCharts();
});
</script>

<template>
    <section>
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">DANH SÁCH SƠ ĐỒ GHẾ</h3>

        </div>

        <el-row :gutter="20" class="mb-4">
            <el-col :span="8">
                <el-table v-loading="loading" :data="seatChart" element-loading-text="Đang tải dữ liệu..."
                    style="width: 100%" @row-click="handleRowClick">
                    <el-table-column type="index" label="STT" width="50" />
                    <el-table-column label="Tên sơ đồ">
                        <template #default="scope">
                            <span class="font-semibold">{{ scope.row.seat_chart_name }}</span>
                            <br />
                            <span class="text-gray-500 text-sm">{{optionsCategorySeatChart.find(item => item.value ===
                                scope.row.seat_chart_type)?.label}}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>

            <el-col :span="16">
                <div>
                    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="auto">
                        <el-row :gutter="20">
                            <el-col :span="7">
                                <el-form-item label="Tên sơ đồ ghế" prop="seat_chart_name" label-position="top">
                                    <el-input v-model="ruleForm.seat_chart_name" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="5">
                                <el-form-item label="Loại sơ đồ" prop="seat_chart_type" label-position="top">
                                    <el-select v-model="ruleForm.seat_chart_type" placeholder="Số tầng"
                                        @change="generateSeats">
                                        <el-option v-for="item in optionsCategorySeatChart" :key="item.value"
                                            :label="item.label" :value="item.value" />
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="4">
                                <el-form-item label="Số tầng" prop="total_floor" label-position="top">
                                    <el-select v-model="ruleForm.total_floor" placeholder="Số tầng"
                                        @change="generateSeats">
                                        <el-option v-for="item in optionsFloor" :key="item.value" :label="item.label"
                                            :value="item.value" />
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="4">
                                <el-form-item label="Số cột" prop="total_column" label-position="top">
                                    <el-select v-model="ruleForm.total_column" placeholder="Số cột"
                                        @change="generateSeats">
                                        <el-option v-for="item in optionsColumn" :key="item.value" :label="item.label"
                                            :value="item.value" />
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="4">
                                <el-form-item label="Số hàng" prop="total_row" label-position="top">
                                    <el-select v-model="ruleForm.total_row" placeholder="Số hàng"
                                        @change="generateSeats">
                                        <el-option v-for="item in optionsRow" :key="item.value" :label="item.label"
                                            :value="item.value" />
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <!-- Seat Chart Display -->
                        <div v-if="showSeatChart" class="mt-6">
                            <div v-for="floor in ruleForm.total_floor" :key="floor"
                                class="bg-white rounded-lg p-5 mb-8 border-2 border-gray-200">
                                <h4 v-if="ruleForm.total_floor > 1"
                                    class="text-center mb-5 text-blue-600 font-bold text-lg bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-md border-l-4 border-blue-500">
                                    Tầng {{ floor }}
                                </h4>
                                <div class="flex flex-col items-center gap-5">
                                    <div class="grid gap-3 p-2 max-w-4xl " :style="getGridStyle(floor)">
                                        <div v-for="seat in getSeatsForFloor(floor)"
                                            :key="seat.id ?? `seat-${seat.code}`"
                                            class="flex flex-col items-center gap-2 border border-gray-300 rounded-lg p-2">
                                            <div :class="getSeatClass(seat)" class="px-2"
                                                :title="`${seat.name} - Floor: ${seat.floor}, Row: ${seat.row}, Col: ${seat.column}`">
                                                <span class="text-xs font-bold text-black drop-shadow-sm">{{
                                                    seat.code }}</span>
                                            </div>
                                            <el-input v-model="seat.name" size="small"
                                                class="w-20 text-center font-semibold" placeholder="Tên ghế" />
                                            <el-switch v-model="seat.status" />
                                            <el-select v-model="seat.type" size="small" placeholder="Loại ghế">
                                                <el-option v-for="item in optionsTypeSeat" :key="item.value"
                                                    :label="item.label" :value="item.value" />
                                            </el-select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-end gap-3 mt-6">
                            <el-button type="warning" v-if="isEditMode" @click="handleExit(ruleFormRef)">
                                Thoát
                            </el-button>
                            <el-button type="danger" v-if="isEditMode" @click="handleDelete" :loading="isSubmitting">
                                Xoá sơ đồ
                            </el-button>
                            <el-button :loading="isSubmitting" :type="isEditMode ? 'success' : 'primary'"
                                @click="submitForm(ruleFormRef)">
                                {{ isEditMode ? 'Lưu sơ đồ' : 'Thêm sơ đồ' }}
                            </el-button>
                        </div>
                    </el-form>
                </div>
            </el-col>
        </el-row>
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

@media (max-width: 768px) {
    .grid {
        gap: 0.5rem;
        padding: 0.625rem;
    }

    .w-9 {
        width: 1.75rem;
        height: 1.75rem;
    }

    .text-xs {
        font-size: 0.5rem;
    }

    .flex-wrap {
        flex-direction: column;
        align-items: center;
        gap: 0.625rem;
    }

    .w-20 {
        width: 3rem;
    }

    :deep(.el-input--small .el-input__inner) {
        font-size: 10px;
        height: 24px;
        line-height: 24px;
    }
}
</style>