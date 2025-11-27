<script setup lang="ts">
import {
    Checked,
} from '@element-plus/icons-vue';
import { useSeatManagement } from '~/composables/seat/useSeatManagement';
import type { Seat } from '~/types/seat/seat.interface';
definePageMeta({
    layout: 'default',
})
const {
    loadingData,
    loadingSubmit,
    seatCharts,
    isEditMode,
    loadingDelete,
    ruleFormRef,
    fetchListSeatCharts,
    submitForm,
    ruleForm,
    handleDelete,
    handleExit,
    handleRowClick,
} = useSeatManagement();
const useUserStore = userStore();

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



const showSeatChart = computed(() => {
    return ruleForm.value.total_floor && ruleForm.value.total_row && ruleForm.value.total_column
})

const getGridStyle = (_floor: number) => {
    return {
        gridTemplateColumns: `repeat(${ruleForm.value.total_column}, minmax(80px, 1fr))`,
        gridTemplateRows: `repeat(${ruleForm.value.total_row}, minmax(70px, 1fr))`,
        gap: '8px'
    }
}

const getSeatsForFloor = (floor: number) => {
    if (!ruleForm.value.seats) return []

    const floorSeats = ruleForm.value.seats.filter(seat => seat.floor === floor)

    const sortedSeats = floorSeats.sort((a, b) => {
        if ((a.row ?? 0) !== (b.row ?? 0)) {
            return (a.row ?? 0) - (b.row ?? 0)
        }
        return (a.column ?? 0) - (b.column ?? 0)
    })
    return sortedSeats
}

const getSeatClass = (seat: Seat) => {
    const baseClasses = 'px-2 py-1 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 border-2 font-bold text-white text-xs';

    if (seat.status) {
        return `${baseClasses} bg-gradient-to-br from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 shadow-md hover:shadow-lg`;
    } else {
        return `${baseClasses} bg-gradient-to-br from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 shadow-sm`;
    }
};

const generateSeats = () => {
    if (!showSeatChart.value) return

    const currentSeats = ruleForm.value.seats || []
    const newSeats = []

    const seatMap = new Map()
    currentSeats.forEach(seat => {
        if (seat.code) {
            seatMap.set(seat.code, seat)
        }
    })

    for (let floor = 1; floor <= (ruleForm.value.total_floor ?? 0); floor++) {
        for (let row = 1; row <= (ruleForm.value.total_row ?? 0); row++) {
            for (let col = 1; col <= (ruleForm.value.total_column ?? 0); col++) {
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
                    })
                }
            }
        }
    }

    ruleForm.value.seats = newSeats;
}


const optionsCategorySeatChart = [
    { label: 'Ghế ngồi', value: 1 },
    { label: 'Ghế ngồi limousine', value: 2 },
    { label: 'Giường nằm', value: 3 },
    { label: 'Giường nằm limousine', value: 4 },
    { label: 'Phòng VIP (Cabin đơn)', value: 5 },
    { label: 'Phòng VIP (Cabin đôi)', value: 6 },
]

onMounted(async () => {
    await useUserStore.loadUserInfo();
    await fetchListSeatCharts(useUserStore.company_id ?? '');
});
</script>

<template>
    <section>
        <div class=" mx-auto">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold">DANH SÁCH SƠ ĐỒ GHẾ</h3>

            </div>

            <el-row :gutter="24" class="mb-6">
                <el-col :xs="24" :sm="24" :md="8" :lg="8">
                    <div class="bg-white rounded-xl shadow-lg overflow-hidden">

                        <el-table v-loading="loadingData" :data="seatCharts" element-loading-text="Đang tải dữ liệu..."
                            style="width: 100%" @row-click="handleRowClick"
                            :default-sort="{ prop: 'id', order: 'descending' }" class="seat-chart-table">
                            <el-table-column type="index" label="STT" width="50" align="center" />
                            <el-table-column label="Tên sơ đồ" show-overflow-tooltip>
                                <template #default="scope">
                                    <div class="cursor-pointer hover:text-blue-600 transition">
                                        <div class="font-semibold text-gray-800">{{ scope.row.seat_chart_name }}</div>
                                        
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="Loại sơ đồ" >
                                <template #default="scope">
                                    <div>{{optionsCategorySeatChart.find(item => item.value ===
                                                scope.row.seat_chart_type)?.label}}</div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </el-col>

                <!-- Form tạo/chỉnh sửa -->
                <el-col :xs="24" :sm="24" :md="16" :lg="16">
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="auto"
                            class="space-y-6">
                            <!-- Row 1: Tên và loại sơ đồ -->
                            <el-row :gutter="16">
                                <el-col :xs="24" :sm="12" :md="10">
                                    <el-form-item label="Tên sơ đồ" prop="seat_chart_name">
                                        <el-input v-model="ruleForm.seat_chart_name" placeholder="" clearable />
                                    </el-form-item>
                                </el-col>
                                <el-col :xs="24" :sm="12" :md="14">
                                    <el-form-item label="Loại sơ đồ" prop="seat_chart_type">
                                        <el-select v-model="ruleForm.seat_chart_type" placeholder="Chọn loại sơ đồ"
                                            @change="generateSeats" clearable>
                                            <el-option v-for="item in optionsCategorySeatChart" :key="item.value"
                                                :label="item.label" :value="item.value" />
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <!-- Row 2: Số tầng, hàng, cột -->
                            <el-row :gutter="16">
                                <el-col :xs="24" :sm="8" :md="8">
                                    <el-form-item label="Số tầng" prop="total_floor">
                                        <el-select v-model="ruleForm.total_floor" placeholder="Chọn số tầng"
                                            @change="generateSeats" clearable>
                                            <el-option v-for="item in optionsFloor" :key="item.value"
                                                :label="item.label" :value="item.value" />
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                                <el-col :xs="24" :sm="8" :md="8">
                                    <el-form-item label="Số hàng" prop="total_row">
                                        <el-select v-model="ruleForm.total_row" placeholder="Chọn số hàng"
                                            @change="generateSeats" clearable>
                                            <el-option v-for="item in optionsRow" :key="item.value" :label="item.label"
                                                :value="item.value" />
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                                <el-col :xs="24" :sm="8" :md="8">
                                    <el-form-item label="Số cột" prop="total_column">
                                        <el-select v-model="ruleForm.total_column" placeholder="Chọn số cột"
                                            @change="generateSeats" clearable>
                                            <el-option v-for="item in optionsColumn" :key="item.value"
                                                :label="item.label" :value="item.value" />
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </el-form>

                        <!-- Seat Chart Display -->
                        <div v-if="showSeatChart" class="mt-8 space-y-8">
                            <div v-for="floor in ruleForm.total_floor" :key="floor"
                                class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">

                                <h4 v-if="ruleForm.total_floor > 1"
                                    class="text-center mb-6 text-blue-700 font-bold text-lg bg-blue-100 px-4 py-2 rounded-lg inline-block w-full">
                                    🏢 Tầng {{ floor }}
                                </h4>

                                <div class="flex justify-center overflow-x-auto pb-4">
                                    <div class="grid gap-2 p-4 bg-white rounded-lg shadow-md"
                                        :style="getGridStyle(floor)">
                                        <div v-for="seat in getSeatsForFloor(floor)"
                                            :key="seat.id ?? `seat-${seat.code}`"
                                            class="flex flex-col items-center gap-3 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3 hover:shadow-md transition">

                                            <div :class="getSeatClass(seat)"
                                                :title="`${seat.name} - Tầng: ${seat.floor}, Hàng: ${seat.row}, Cột: ${seat.column}`"
                                                class="w-full justify-center">
                                                {{ seat.code }}
                                            </div>

                                            <el-input v-model="seat.name" size="small"
                                                class="w-full text-center font-semibold" placeholder="Tên ghế" />

                                            <div class="flex items-center gap-2 w-full justify-between text-sm">
                                                <span class="text-gray-600">Sẵn có:</span>
                                                <el-switch v-model="seat.status" size="small" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                            <el-button v-if="isEditMode" type="warning" @click="handleExit(ruleFormRef)" size="large">
                                ← Huỷ
                            </el-button>
                            <el-button v-if="isEditMode" :loading="loadingDelete" type="danger"
                                @click="handleDelete(ruleForm.id ?? 0)" size="large">
                                {{ loadingDelete ? 'Đang xoá ...' : 'Xoá sơ đồ' }}
                            </el-button>
                            <el-button :loading="loadingSubmit" :icon="Checked"
                                :type="isEditMode ? 'success' : 'primary'" @click="submitForm(ruleFormRef)"
                                size="large">
                                <template v-if="loadingSubmit">
                                    {{ isEditMode ? 'Đang lưu...' : 'Đang thêm...' }}
                                </template>
                                <template v-else>
                                    {{ isEditMode ? 'Lưu sơ đồ' : 'Thêm sơ đồ' }}
                                </template>
                            </el-button>

                        </div>
                    </div>
                </el-col>
            </el-row>
        </div>
    </section>
</template>

<style scoped>
:deep(.seat-chart-table .el-table__row) {
    cursor: pointer;
    transition: all 0.3s ease;
}

:deep(.seat-chart-table .el-table__row:hover) {
    background-color: #f0f7ff !important;
}

:deep(.el-input__inner),
:deep(.el-select__input) {
    border-color: #e5e7eb;
}

:deep(.el-form-item) {
    margin-bottom: 16px;
}

:deep(.el-form-item__label) {
    color: #4b5563;
    font-weight: 500;
}

:deep(.el-select .el-input__wrapper) {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
    :deep(.el-table) {
        font-size: 12px;
    }

    .grid {
        gap: 4px;
        padding: 8px;
    }

    :deep(.el-input--small .el-input__inner) {
        font-size: 11px;
        height: 24px;
    }
}
</style>