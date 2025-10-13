<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus'
import { API_GetListPointNameByRoute } from '~/api/pointAPI';
import { API_GetListRouteNameToConfigByCompany } from '~/api/routeAPI';
import { getSeatChartNameByCompany } from '~/api/seatAPI';
import type { ConfigPointInRoute, DTO_RP_GroupPointName } from '~/types/pointType';
import type { DTO_RP_ListRouteNameToConfig } from '~/types/routeType';
import type { SeatChartNameType } from '~/types/seatType';

const ruleFormRef = ref<FormInstance>()
const useUserStore = userStore()
const dialogVisible = ref(false)
const handleOpenDialog = async () => {
    dialogVisible.value = true
    await fetchListRoute();
    await fetchListSeatChart();
}
const handleClose = () => {
    ruleFormRef.value?.resetFields()
    clearFareConfigs()
    dialogVisible.value = false
}

const ruleForm = ref<ConfigPointInRoute>({
    id: undefined,
    route_id: undefined,
    config_name: undefined,
    trip_type: 1,
    seat_chart_id: [],
    priority: false,
    double_room: false,
    same_price: false,
    date_range: undefined as [ Date, Date ] | undefined,
    fare_configs: []
})

const addFareConfigRow = () => {
    if (!ruleForm.value.fare_configs) {
        ruleForm.value.fare_configs = []
    }
    ruleForm.value.fare_configs.push({
        id: Date.now(), // temporary ID
        departure_point_id: undefined,
        arrival_point_id: undefined,
        single_room_price: 0,
        double_room_price: 0,

    })
}

const removeFareConfigRow = (index: number) => {
    if (ruleForm.value.fare_configs) {
        ruleForm.value.fare_configs.splice(index, 1)
    }
}

const clearFareConfigs = () => {
    ruleForm.value.fare_configs = []
}
const listPoint = ref<DTO_RP_GroupPointName[]>([])
const loadingListPoint = ref(false)
const fetchListPoint = async () => {
    if (!ruleForm.value.route_id) return
    loadingListPoint.value = true
    try {
        const res = await API_GetListPointNameByRoute(ruleForm.value.route_id || 0)
        if (res.success && res.result) {
            listPoint.value = res.result
        } else {
            notifyError(res.message || 'Lấy danh sách điểm thất bại')
        }
    } catch (error) {
        console.log(error)
        notifyError('Lấy danh sách điểm thất bại')
    } finally {
        loadingListPoint.value = false
    }
}
watch(
    () => ruleForm.value.route_id,
    async (newRouteId) => {
        if (newRouteId) {
            await fetchListPoint()
        } else {
            listPoint.value = [] // reset nếu chưa chọn tuyến
            clearFareConfigs() // clear fare configs when route changes
        }
    }
)
const opinionsTripType = [
    { value: 1, label: 'Tất cả các chuyến' },
    { value: 2, label: 'Chuyến chở khách cố định' },
    { value: 3, label: 'Chuyến hợp đồng' },
]
const listRoute = ref<DTO_RP_ListRouteNameToConfig[]>([])
const loadingListRoute = ref(false)
const fetchListRoute = async () => {
    loadingListRoute.value = true
    try {
        const res = await API_GetListRouteNameToConfigByCompany(useUserStore.company_id || '')
        if (res.success && res.result) {
            listRoute.value = res.result
        } else {
            notifyError(res.message || 'Lấy danh sách tuyến thất bại')
        }
    } catch (error) {
        console.log(error)
        notifyError('Lấy danh sách tuyến thất bại')
    } finally {
        loadingListRoute.value = false
    }
}
const listSeatChart = ref<SeatChartNameType[]>([])
const loadingListSeatChart = ref(false)
const fetchListSeatChart = async () => {
    loadingListSeatChart.value = true
    try {
        const res = await getSeatChartNameByCompany(useUserStore.company_id || '')
        if (res.success && res.result) {
            listSeatChart.value = res.result
        } else {
            notifyError(res.message || 'Lấy danh sách sơ đồ ghế thất bại')
        }
    } catch (error) {
        console.log(error)
        notifyError('Lấy danh sách sơ đồ ghế thất bại')
    } finally {
        loadingListSeatChart.value = false
    }
}

const handleSubmit = () => {
    console.log('Form Data:', ruleForm.value)
}
const formatCurrency = (value: number): string => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// Parse tiền tệ thành số (VD: 1.000.000 => 1000000)
const parseCurrency = (value: string): number => {
    return parseInt(value.replace(/\./g, '')) || 0
}
// Hàm xử lý input giá phòng đơn
const onSingleRoomPriceInput = (val: string, row: any) => {
    const numericValue = parseCurrency(val)
    row.single_room_price = numericValue
    row.singleRoomPriceDisplay = formatCurrency(numericValue)
}

// Hàm xử lý input giá phòng đôi
const onDoubleRoomPriceInput = (val: string, row: any) => {
    const numericValue = parseCurrency(val)
    row.double_room_price = numericValue
    row.doubleRoomPriceDisplay = formatCurrency(numericValue)
}
const currentRoute = computed(() => {
    return listRoute.value.find(r => r.id === ruleForm.value.route_id)
})

// Hàm áp dụng giá đồng giá cho tất cả các dòng
const applyUniformPrice = () => {
    if (!currentRoute.value) return
    
    const displayPrice = currentRoute.value.display_price
    
    ruleForm.value.fare_configs?.forEach(config => {
        config.single_room_price = displayPrice
        config.singleRoomPriceDisplay = formatCurrency(displayPrice)
        
        if (ruleForm.value.double_room) {
            config.double_room_price = displayPrice
            config.doubleRoomPriceDisplay = formatCurrency(displayPrice)
        }
    })
}

// Hàm xử lý khi thay đổi checkbox "Đồng giá trong 1 sơ đồ"
const onSamePriceChange = (value: boolean) => {
    if (value) {
        applyUniformPrice()
    }
}
onMounted(async () => {
    await useUserStore.loadUserInfo()

})
</script>
<template>
    <section>
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold">Cấu hình giá vé</h3>
            <el-button type="primary" :icon="Plus" @click="handleOpenDialog">Thêm cấu hình</el-button>
        </div>
        <div>
            {{ listRoute }}
            {{ listSeatChart }}
            {{ listPoint }}
            <el-table style="width: 100%">
                <el-table-column>
                    <template #header>
                        <span>Tên cấu hình</span>
                    </template>
                </el-table-column>
                <el-table-column>
                    <template #header>
                        <span>Thời gian</span>
                    </template>
                </el-table-column>
                <el-table-column>
                    <template #header>
                        <span>Sơ đồ ghế</span>
                    </template>
                </el-table-column>
                <el-table-column>
                    <template #header>
                        <span>Thông tin</span>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <el-dialog v-model="dialogVisible" width="800" :before-close="handleClose" style="padding: 0px;">
            <template #header>
                <div class="pt-[10px] pl-2">
                    <span class="text-[16px] font-semibold text-white">
                        Cấu hình
                    </span>
                </div>
            </template>
            <div class="p-2 pb-4">
                <el-form ref="ruleFormRef" style="max-width: 1000px" :model="ruleForm" status-icon label-width="auto"
                    class="demo-ruleForm">
                    <el-form-item label-position="top">
                        <template #label>
                            <span class="text-sm font-medium">Tên cấu hình</span>
                        </template>
                        <el-input v-model="ruleForm.config_name" placeholder="Nhập tên cấu hình" />
                    </el-form-item>
                    <h3 class="text-base font-medium">PHẠM VI ÁP DỤNG</h3>
                    <el-form-item label-position="top">
                        <template #label>
                            <span class="text-sm font-medium">Tuyến đường</span>
                        </template>
                        <el-select v-model="ruleForm.route_id" placeholder="Chọn tuyến đường">
                            <el-option v-for="item in listRoute" :key="item.id" :label="item.route_name"
                                :value="item.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label-position="top">
                        <template #label>
                            <span class="text-sm font-medium">Chuyến áp dụng</span>
                        </template>
                        <el-select v-model="ruleForm.trip_type" placeholder="Chọn chuyến">
                            <el-option v-for="item in opinionsTripType" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label-position="top">
                        <template #label>
                            <span class="text-sm font-medium">Sơ đồ ghế</span>
                        </template>
                        <el-select v-model="ruleForm.seat_chart_id" placeholder="Chọn sơ đồ" multiple>
                            <el-option v-for="item in listSeatChart" :key="item.id" :label="item.seat_chart_name"
                                :value="item.id" />
                        </el-select>
                    </el-form-item>

                    <h3 class="text-base font-medium my-2">THỜI GIAN ÁP DỤNG</h3>
                    <el-form-item label-position="top">
                        <el-date-picker v-model="ruleForm.date_range" type="daterange" range-separator="Đến"
                            start-placeholder="Bắt đầu" end-placeholder="Kết thúc" format="DD/MM/YYYY"
                            value-format="YYYY-MM-DD" />
                    </el-form-item>
                    <h3 class="text-base font-medium my-2">CẤU HÌNH CHI TIẾT</h3>
                    <el-form-item label-position="top">
                        <el-checkbox v-model="ruleForm.priority" name="type">
                            Cấu hình ưu tiên
                        </el-checkbox>
                        <el-checkbox v-model="ruleForm.same_price" name="type" @change="onSamePriceChange">
                            Đồng giá trong 1 sơ đồ
                        </el-checkbox>
                        <el-checkbox v-model="ruleForm.double_room" name="type">
                            Bán phòng đôi
                        </el-checkbox>
                    </el-form-item>





                    <el-table :data="ruleForm.fare_configs" style="width: 100%" border>
                        <!-- NƠI ĐI -->
                        <el-table-column label="NƠI ĐI" width="250">
                            <template #default="scope">
                                <el-popover placement="bottom" :width="400" trigger="click">
                                    <template #reference>
                                        <div style="min-height: 40px; cursor: pointer; padding: 8px;">
                                            <div
                                                v-if="scope.row.departure_point_id && scope.row.departure_point_id.length > 0">
                                                <div v-for="province in listPoint" :key="province.id">
                                                    <template
                                                        v-if="province.points.some(p => scope.row.departure_point_id.includes(p.id))">
                                                        <el-tag style="font-weight: bold;">
                                                            {{ province.province_name }}
                                                        </el-tag>
                                                        <div style="margin-left: 16px; color: #606266;">
                                                            <div v-for="(point, index) in province.points.filter(p => scope.row.departure_point_id.includes(p.id))"
                                                                :key="point.id">
                                                                <span style="color: #409EFF;">• {{ point.name }}</span>
                                                            </div>
                                                        </div>
                                                    </template>
                                                </div>
                                            </div>
                                            <div v-else style="color: #a8abb2;">
                                                Chọn nơi đi
                                            </div>
                                        </div>
                                    </template>
                                    <div style="max-height: 400px; overflow-y: auto;">
                                        <div v-for="province in listPoint" :key="province.id"
                                            style="margin-bottom: 16px;">
                                            <div
                                                style="font-weight: bold; color: #409EFF; margin-bottom: 8px; font-size: 14px;">
                                                {{ province.province_name }}
                                            </div>
                                            <el-checkbox-group v-model="scope.row.departure_point_id">
                                                <div style="margin-left: 16px;">
                                                    <el-checkbox v-for="point in province.points" :key="point.id"
                                                        :label="point.id" style="display: block; margin-bottom: 8px;">
                                                        {{ point.name }}
                                                    </el-checkbox>
                                                </div>
                                            </el-checkbox-group>
                                        </div>
                                    </div>
                                </el-popover>
                            </template>
                        </el-table-column>

                        <!-- NƠI ĐẾN -->
                        <el-table-column label="NƠI ĐẾN" width="250">
                            <template #default="scope">
                                <el-popover placement="bottom" :width="400" trigger="click">
                                    <template #reference>
                                        <div style="min-height: 40px; cursor: pointer; padding: 8px;">
                                            <div
                                                v-if="scope.row.arrival_point_id && scope.row.arrival_point_id.length > 0">
                                                <div v-for="province in listPoint" :key="province.id">
                                                    <template
                                                        v-if="province.points.some(p => scope.row.arrival_point_id.includes(p.id))">
                                                        <el-tag style="font-weight: bold;">
                                                            {{ province.province_name }}
                                                        </el-tag>
                                                        <div style="margin-left: 16px; color: #606266;">
                                                            <div v-for="(point, index) in province.points.filter(p => scope.row.arrival_point_id.includes(p.id))"
                                                                :key="point.id">
                                                                <span style="color: #409EFF;">• {{ point.name }}</span>
                                                            </div>
                                                        </div>
                                                    </template>
                                                </div>
                                            </div>
                                            <div v-else style="color: #a8abb2;">
                                                Chọn nơi đến
                                            </div>
                                        </div>
                                    </template>
                                    <div style="max-height: 400px; overflow-y: auto;">
                                        <div v-for="province in listPoint" :key="province.id"
                                            style="margin-bottom: 16px;">
                                            <div
                                                style="font-weight: bold; color: #409EFF; margin-bottom: 8px; font-size: 14px;">
                                                {{ province.province_name }}
                                            </div>
                                            <el-checkbox-group v-model="scope.row.arrival_point_id">
                                                <div style="margin-left: 16px;">
                                                    <el-checkbox v-for="point in province.points" :key="point.id"
                                                        :label="point.id" style="display: block; margin-bottom: 8px;">
                                                        {{ point.name }}
                                                    </el-checkbox>
                                                </div>
                                            </el-checkbox-group>
                                        </div>
                                    </div>
                                </el-popover>
                            </template>
                        </el-table-column>

                        <!-- GIÁ PHÒNG ĐƠN -->
                        <el-table-column :label="ruleForm.double_room ? 'GIÁ PHÒNG ĐƠN' : 'GIÁ CHẶNG'">
                            <template #default="scope">
                                <el-input v-model="scope.row.singleRoomPriceDisplay"
                                    :placeholder="ruleForm.double_room ? 'Giá phòng đơn' : 'Giá'"
                                    :disabled="ruleForm.same_price" class="no-border-input w-full"
                                    @input="val => onSingleRoomPriceInput(val, scope.row)" />
                            </template>
                        </el-table-column>

                        <!-- GIÁ PHÒNG ĐÔI - Chỉ hiển thị khi bán phòng đôi -->
                        <el-table-column v-if="ruleForm.double_room" label="GIÁ PHÒNG ĐÔI">
                            <template #default="scope">
                                <el-input v-model="scope.row.doubleRoomPriceDisplay" placeholder="Giá phòng đôi"
                                    :disabled="ruleForm.same_price" class="no-border-input w-full"
                                    @input="val => onDoubleRoomPriceInput(val, scope.row)" />
                            </template>
                        </el-table-column>

                        <!-- THAO TÁC -->
                        <el-table-column width="70">
                            <template #default="scope">
                                <el-button type="danger" size="small" @click="removeFareConfigRow(scope.$index)">
                                    Xóa
                                </el-button>
                            </template>
                        </el-table-column>

                        <!-- Hàng thêm mới -->
                        <template #append>
                            <div style="text-align: center; padding: 12px; background-color: #fafafa;">
                                <el-button type="primary" size="small" :disabled="!listPoint.length"
                                    @click="addFareConfigRow">
                                    <el-icon style="margin-right: 4px;">
                                        <Plus />
                                    </el-icon>
                                    Thêm dòng
                                </el-button>
                            </div>
                        </template>
                    </el-table>


                </el-form>
            </div>
            <template #footer>
                <div class="flex justify-end p-2">
                    <el-button @click="handleClose">Thoát</el-button>
                    <el-button type="primary" @click="handleSubmit">
                        Xác nhận
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </section>
</template>
<style>
.el-dialog__header {
    background-color: #0072bc;
    padding-bottom: 10px;
}

.el-dialog__headerbtn {
    color: white;
}

.el-dialog__footer {
    padding-top: 0;
}
</style>
<style scoped>
.no-border-input :deep(.el-input__wrapper) {
    @apply border-none shadow-none focus:ring-0 hover:shadow-none;
}
</style>