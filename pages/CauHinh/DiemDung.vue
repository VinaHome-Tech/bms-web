<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- <script setup lang="ts">
import { Plus, More, Calendar } from '@element-plus/icons-vue';
import type { FormInstance, CheckboxValueType, FormRules } from 'element-plus'
import { API_GetListRouteNameToConfigByCompanyId } from '~/api/bms-service/route/bms_route.api';
import { API_GetListSeatChartNameByCompanyId } from '~/api/bms-service/seat/bms_seat.api';

import { API_CreateFareConfig, API_DeleteFareConfig, API_GetListConfigFareByCompany, API_UpdateFareConfig } from '~/api/configFareAPI';
import { API_GetListPointNameByRoute } from '~/api/pointAPI';
// import { API_GetListRouteNameToConfigByCompany } from '~/api/routeAPI';
import { getSeatChartNameByCompany } from '~/api/seatAPI';
import { formatCurrency_2, parseCurrency } from '~/lib/formatCurrency';
import { formatDate2 } from '~/lib/formatDate';
import type { DTO_RouteNameToConfig } from '~/types/config/config_point.interface';
import type { ConfigPointInRoute, DTO_RP_ConfigFare_3 } from '~/types/configFareType';
import type { DTO_RP_GroupPointName } from '~/types/pointType';
import type { RouteName } from '~/types/route/route.interface';
import type { DTO_RP_ListRouteNameToConfig } from '~/types/routeType';
import type { SeatChartNameType } from '~/types/seatType';
const ruleFormRef = ref<FormInstance>()
const useUserStore = userStore()
const dialogVisible = ref(false)
const modelEdit = ref(false)
const handleOpenDialog = async () => {
    modelEdit.value = false
    dialogVisible.value = true
    await fetchListRoute(useUserStore.company_id || '');
    await fetchListSeatChart(useUserStore.company_id || '');
}
const handleClose = () => {
    ruleFormRef.value?.resetFields()
    clearFareConfigs()
    dialogVisible.value = false
    ruleForm.value = {
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
    }
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

const handleEditConfig = async (config: any) => {
    modelEdit.value = true
    // Đổ dữ liệu config vào ruleForm
    ruleForm.value = {
        id: config.id,
        route_id: config.route_id,
        config_name: config.config_name,
        trip_type: config.trip_type,
        seat_chart_id: config.seat_chart.map((s: any) => s.seat_chart_id),
        priority: config.priority,
        double_room: config.double_room,
        same_price: config.same_price,
        date_range: config.date_range,
        fare_configs: (config.fare_configs || []).map((row: any) => ({
            ...row,
            singleRoomPriceDisplay: formatCurrency_2(row.single_room_price),
            doubleRoomPriceDisplay: formatCurrency_2(row.double_room_price),
        }))
    }
    dialogVisible.value = true
    await fetchListRoute(useUserStore.company_id || '');
    await fetchListSeatChart(useUserStore.company_id || '');
    await fetchListPoint();
}

const addFareConfigRow = () => {
    if (!ruleForm.value.fare_configs) {
        ruleForm.value.fare_configs = []
    }

    const newRow = {
        id: undefined,
        departure_point_id: [],
        arrival_point_id: [],
        single_room_price: 0,
        double_room_price: 0,
        singleRoomPriceDisplay: '',
        doubleRoomPriceDisplay: ''
    }

    // 🔹 Nếu đang áp dụng đồng giá, tự động gán giá của tuyến
    if (currentRoute.value && currentRoute.value.display_price) {
        const displayPrice = currentRoute.value.display_price

        newRow.single_room_price = displayPrice
        newRow.singleRoomPriceDisplay = formatCurrency_2(displayPrice)

        if (ruleForm.value.double_room) {
            newRow.double_room_price = displayPrice
            newRow.doubleRoomPriceDisplay = formatCurrency_2(displayPrice)
        }
    }

    ruleForm.value.fare_configs.push(newRow)
}


const removeFareConfigRow = (index: number) => {
    if (ruleForm.value.fare_configs) {
        ruleForm.value.fare_configs.splice(index, 1)
    }
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
        config.singleRoomPriceDisplay = formatCurrency_2(displayPrice)

        if (ruleForm.value.double_room) {
            config.double_room_price = displayPrice
            config.doubleRoomPriceDisplay = formatCurrency_2(displayPrice)
        }
    })
}

// Hàm xử lý khi thay đổi checkbox "Đồng giá trong 1 sơ đồ"
const onSamePriceChange = (val: CheckboxValueType) => {
    if (val) {
        applyUniformPrice()
    }
}

// Hàm xử lý khi thay đổi checkbox "Bán phòng đôi"
const onDoubleRoomChange = (val: CheckboxValueType) => {
    if (!val) {
        // Khi bỏ chọn "Bán phòng đôi", reset tất cả double_room_price về 0
        ruleForm.value.fare_configs?.forEach(config => {
            config.double_room_price = 0
            config.doubleRoomPriceDisplay = ''
        })
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
    async (newRouteId, oldRouteId) => {
        // Clear fare configs khi thay đổi tuyến (kể cả khi chọn tuyến mới)
        if (oldRouteId !== undefined) {
            clearFareConfigs()
        }

        if (newRouteId) {
            await fetchListPoint()
        } else {
            listPoint.value = [] // reset nếu chưa chọn tuyến
        }
    }
)
const opinionsTripType = [
    { value: 1, label: 'Tất cả các chuyến' },
    { value: 2, label: 'Chuyến chở khách cố định' },
    { value: 3, label: 'Chuyến hợp đồng' },
]
const listRoute = ref<DTO_RouteNameToConfig[]>([])
const loadingListRoute = ref(false)
const fetchListRoute = async (company_id: string) => {
    loadingListRoute.value = true
    try {
        const res = await API_GetListRouteNameToConfigByCompanyId(company_id)
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
const fetchListSeatChart = async (company_id: string) => {
    loadingListSeatChart.value = true
    try {
        const res = await API_GetListSeatChartNameByCompanyId(company_id)
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
const listConfigFare = ref<DTO_RP_ConfigFare_3[]>([])
const loadingListConfigFare = ref(false)
const fetchListConfigFare = async () => {
    loadingListConfigFare.value = true
    try {
        const res = await API_GetListConfigFareByCompany(useUserStore.company_id || '')
        if (res.success && res.result) {
            listConfigFare.value = res.result
        } else {
            notifyError(res.message || 'Lấy danh sách cấu hình giá vé thất bại')
        }
    } catch (error) {
        console.log(error)
        notifyError('Lấy danh sách cấu hình giá vé thất bại')
    } finally {
        loadingListConfigFare.value = false
    }
}
const rules = ref<FormRules<ConfigPointInRoute>>({
    config_name: [
        { required: true, message: 'Vui lòng nhập tên cấu hình', trigger: 'blur' },
        { min: 3, max: 100, message: 'Tên cấu hình từ 3-100 ký tự', trigger: 'blur' }
    ],
    route_id: [
        { required: true, message: 'Vui lòng chọn tuyến đường', trigger: 'change' }
    ],
    seat_chart_id: [
        { required: true, message: 'Vui lòng chọn sơ đồ ghế', trigger: 'change' }
    ],
    date_range: [
        { type: 'array' as const, required: true, message: 'Vui lòng chọn thời gian áp dụng', trigger: 'change' }
    ],
})
const handleSubmit = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.validate(async (valid) => {
        if (valid) {
            // Kiểm tra fare_configs không được để trống
            if (!ruleForm.value.fare_configs || ruleForm.value.fare_configs.length === 0) {
                notifyError('Vui lòng thêm ít nhất một cấu hình giá vé')
                return
            }
            
            // Kiểm tra từng hàng không được để trống nơi đi và nơi đến
            for (let i = 0; i < ruleForm.value.fare_configs.length; i++) {
                const config = ruleForm.value.fare_configs[i]
                
                if (!config.departure_point_id || config.departure_point_id.length === 0) {
                    notifyError(`Hàng ${i + 1}: Vui lòng chọn nơi đi`)
                    return
                }
                
                if (!config.arrival_point_id || config.arrival_point_id.length === 0) {
                    notifyError(`Hàng ${i + 1}: Vui lòng chọn nơi đến`)
                    return
                }
            }
            
            const submitData = {
                ...ruleForm.value,
                company_id: useUserStore.company_id,
                fare_configs: ruleForm.value.fare_configs?.map(config => ({
                    departure_point_id: (config.departure_point_id || [])
                        .map((p: any) => typeof p === 'object' ? p.id : p),
                    arrival_point_id: (config.arrival_point_id || [])
                        .map((p: any) => typeof p === 'object' ? p.id : p),
                    single_room_price: config.single_room_price || 0,
                    double_room_price: config.double_room_price || 0
                })) || []
            }
            if (modelEdit.value) {
                // console.log('Chỉnh sửa cấu hình:', ruleForm.value)
                try {
                    const response = await API_UpdateFareConfig(submitData)
                    if (response.success) {
                        notifySuccess('Lưu cấu hình thành công')
                        handleClose()
                        listConfigFare.value = listConfigFare.value.map(route => ({
                            ...route,
                            config_fares: route.config_fares.map(cf => cf.id === submitData.id ? {
                                ...cf,
                                ...submitData,
                                seat_chart: listSeatChart.value
                                    .filter(sc => (submitData.seat_chart_id ?? []).includes(sc.id))
                                    .map(sc => ({
                                        seat_chart_id: sc.id,
                                        seat_chart_name: sc.seat_chart_name
                                    })),
                                fare_configs: submitData.fare_configs.map((fc: any, idx: number) => ({
                                    id: fc.id !== undefined ? fc.id : (cf.fare_configs[ idx ]?.id ?? Date.now() + idx),
                                    departure_point_id: fc.departure_point_id,
                                    arrival_point_id: fc.arrival_point_id,
                                    single_room_price: fc.single_room_price,
                                    double_room_price: fc.double_room_price
                                }))
                            } : cf)
                        }))
                    } else {
                        notifyError(response.message || 'Lưu cấu hình thất bại')
                    }
                } catch (error) {
                    console.log('Submit error:', error)
                    notifyError('Lưu cấu hình thất bại')
                }
            } else {
                // console.log('Thêm cấu hình mới:', ruleForm.value)
                try {
                    const response = await API_CreateFareConfig(submitData)
                    if (response.success) {
                        notifySuccess('Thêm cấu hình thành công')
                        await fetchListConfigFare()
                        handleClose()
                    } else {
                        notifyError(response.message || 'Thêm cấu hình thất bại')
                    }
                } catch (error) {
                    console.log('Submit error:', error)
                    notifyError('Thêm cấu hình thất bại')
                }
            }
        } else {
            notifyError('Vui lòng kiểm tra lại thông tin')
        }
    })
}

const handleDeleteConfig = async (configId: number) => {
    // Thêm logic xoá cấu hình ở đây
    console.log('Xoá cấu hình:', configId)
    try {
        const response = await API_DeleteFareConfig(configId)
        if (response.success) {
            notifySuccess('Xoá cấu hình thành công')
            listConfigFare.value = listConfigFare.value.map(route => ({
                ...route,
                config_fares: route.config_fares.filter(cf => cf.id !== configId)
            }))
        } else {
            notifyError(response.message || 'Xoá cấu hình thất bại')
        }
    } catch (error) {
        console.log('Delete error:', error)
        notifyError('Xoá cấu hình thất bại')
    }
}


// Hàm xử lý input giá phòng đơn
const onSingleRoomPriceInput = (val: string, row: any) => {
    const numericValue = parseCurrency(val)
    row.single_room_price = numericValue
    row.singleRoomPriceDisplay = formatCurrency_2(numericValue)
}

// Hàm xử lý input giá phòng đôi
const onDoubleRoomPriceInput = (val: string, row: any) => {
    const numericValue = parseCurrency(val)
    row.double_room_price = numericValue
    row.doubleRoomPriceDisplay = formatCurrency_2(numericValue)
}

// Hàm lấy các điểm đến bị disable dựa trên điểm đi đã chọn ở hàng hiện tại
const getDisabledArrivalPoints = (currentRowIndex: number, currentDeparturePoints: number[]) => {
    const disabledPoints: number[] = []
    
    // Lặp qua tất cả các hàng khác
    ruleForm.value.fare_configs?.forEach((config, index) => {
        if (index !== currentRowIndex) {
            // Nếu hàng khác có điểm đi và điểm đến
            if (config.departure_point_id?.length && config.arrival_point_id?.length) {
                // Kiểm tra xem có điểm đi nào trùng với điểm đi hiện tại không
                const commonDeparturePoints = config.departure_point_id.filter(depId => 
                    currentDeparturePoints.includes(depId)
                )
                
                // Nếu có điểm đi trùng, thì disable tất cả điểm đến của hàng đó
                if (commonDeparturePoints.length > 0) {
                    disabledPoints.push(...config.arrival_point_id)
                }
            }
        }
    })
    
    return [...new Set(disabledPoints)] // Loại bỏ duplicate
}

onMounted(async () => {
    await useUserStore.loadUserInfo()
    await fetchListConfigFare()
})
</script> -->
<!-- <template>
    <section>
        <div class="flex justify-between items-center mb-2">
            <h3 class="text-xl font-semibold">Cấu hình điểm dừng</h3>
            <el-button type="primary" :icon="Plus" @click="handleOpenDialog">Thêm cấu hình</el-button>
        </div>
        <div v-loading="loadingListConfigFare">
            <div class="mx-auto">
                <div class="space-y-1">
                    <div v-for="route in listConfigFare" :key="route.route_id"
                        class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                        <div class="bg-[#0072bc] p-2">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-4">
                                    <div>
                                        <h2 class="text-xl font-bold text-white">
                                            {{ route.route_name }}
                                        </h2>
                                    </div>
                                </div>
                                <div class="bg-white bg-opacity-20 px-4 rounded-full">
                                    <span class="text-black font-semibold">
                                        {{ route.config_fares.length }} cấu hình
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="overflow-x-auto">
                            <el-table :data="route.config_fares" border stripe style="width: 100%"
                                highlight-current-row>
                                <el-table-column label="ID" width="80" align="center">
                                    <template #default="{ row }">
                                        <span
                                            class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm">
                                            {{ row.id }}
                                        </span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="Tên cấu hình" min-width="160">
                                    <template #default="{ row }">
                                        <span class="text-sm font-semibold text-gray-900">
                                            {{ row.config_name }}
                                        </span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="Thời gian áp dụng" width="180">
                                    <template #default="{ row }">
                                        <div class="flex items-center gap-2">
                                            <el-icon>
                                                <Calendar />
                                            </el-icon>
                                            <div class="flex flex-col leading-tight">
                                                <span class="text-xs text-gray-700">
                                                    {{ formatDate2(row.date_range[ 0 ]) }}
                                                </span>
                                                <span class="text-xs text-gray-500 text-center">-</span>
                                                <span class="text-xs text-gray-700">
                                                    {{ formatDate2(row.date_range[ 1 ]) }}
                                                </span>
                                            </div>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="Sơ đồ ghế" min-width="200">
                                    <template #default="{ row }">
                                        <div class="flex gap-1.5 flex-wrap">
                                            <el-tag v-for="seat in row.seat_chart" :key="seat.seat_chart_id"
                                                size="small" type="primary">
                                                {{ seat.seat_chart_name }}
                                            </el-tag>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="Thuộc tính" min-width="180">
                                    <template #default="{ row }">
                                        <div class="flex gap-1.5 flex-wrap">
                                            <el-tag v-if="row.double_room" size="small" type="info" effect="light">
                                                Phòng đôi
                                            </el-tag>
                                            <el-tag v-if="row.same_price" size="small" type="warning" effect="light">
                                                Giá đồng nhất
                                            </el-tag>
                                            <el-tag v-if="row.priority" size="small" type="danger" effect="light">
                                                Ưu tiên
                                            </el-tag>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column align="center" width="80">
                                    <template #default="{ row }">
                                        <el-dropdown trigger="click">
                                            <el-button :icon="More" circle class="el-dropdown-link" />
                                            <template #dropdown>
                                                <el-dropdown-menu>
                                                    <el-dropdown-item @click="handleEditConfig(row)">
                                                        Chỉnh sửa
                                                    </el-dropdown-item>
                                                    <el-dropdown-item @click="handleDeleteConfig(row.id)">
                                                        Xoá
                                                    </el-dropdown-item>
                                                </el-dropdown-menu>
                                            </template>
                                        </el-dropdown>
                                    </template>
                                </el-table-column>
                            </el-table>

                            <div v-if="route.config_fares.length === 0" class="text-center py-12 bg-gray-50">
                                <svg class="mx-auto text-gray-400 mb-4" width="64" height="64" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="1.5">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <p class="text-gray-500 text-sm">Chưa có cấu hình giá vé cho tuyến này</p>
                            </div>
                        </div>
                    </div>
                </div>

 
                <div v-if="listConfigFare.length === 0 && !loadingListConfigFare" class="bg-white rounded-2xl shadow-xl p-12 text-center">
                    <svg class="mx-auto text-gray-400 mb-4" width="80" height="80" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <h3 class="text-xl font-semibold text-gray-700 mb-2">Chưa có tuyến nào</h3>
                    <p class="text-gray-500">Thêm tuyến đường để bắt đầu cấu hình giá vé</p>
                </div>
            </div>

        </div>

        <el-dialog v-model="dialogVisible" width="800" :before-close="handleClose" style="padding: 0px;">
            <template #header>
                <div class="pt-[10px] pl-2">
                    <span class="text-[16px] font-semibold text-white">
                        {{ modelEdit ? 'Chỉnh sửa cấu hình' : 'Thêm cấu hình' }}
                    </span>
                </div>
            </template>
            <div class="p-2 pb-4">
                <el-form ref="ruleFormRef"  :model="ruleForm" status-icon :rules="rules"
                    label-width="auto" class="demo-ruleForm">
                    <el-form-item label-position="top" prop="config_name">
                        <template #label>
                            <span class="text-sm font-medium">Tên cấu hình</span>
                        </template>
                        <el-input v-model="ruleForm.config_name" placeholder="Nhập tên cấu hình" />
                    </el-form-item>
                    <h3 class="text-base font-medium">PHẠM VI ÁP DỤNG</h3>
                    <el-form-item label-position="top" prop="route_id">
                        <template #label>
                            <span class="text-sm font-medium">Tuyến đường</span>
                        </template>
                        <el-select v-model="ruleForm.route_id" placeholder="Chọn tuyến đường">
                            <el-option v-for="item in listRoute" :key="item.id" :label="item.route_name"
                                :value="item.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label-position="top" prop="trip_type">
                        <template #label>
                            <span class="text-sm font-medium">Chuyến áp dụng</span>
                        </template>
                        <el-select v-model="ruleForm.trip_type" placeholder="Chọn chuyến">
                            <el-option v-for="item in opinionsTripType" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label-position="top" prop="seat_chart_id">
                        <template #label>
                            <span class="text-sm font-medium">Sơ đồ ghế</span>
                        </template>
                        <el-select v-model="ruleForm.seat_chart_id" placeholder="Chọn sơ đồ" multiple>
                            <el-option v-for="item in listSeatChart" :key="item.id" :label="item.seat_chart_name"
                                :value="item.id" />
                        </el-select>
                    </el-form-item>

                    <h3 class="text-base font-medium my-2">THỜI GIAN ÁP DỤNG</h3>
                    <el-form-item label-position="top" prop="date_range">
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
                        <el-checkbox v-model="ruleForm.double_room" name="type" @change="onDoubleRoomChange">
                            Bán phòng đôi
                        </el-checkbox>
                    </el-form-item>

                    <el-table :data="ruleForm.fare_configs" style="width: 100%" border>
        
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
                                                        :label="point.id" 
                                                        :disabled="getDisabledArrivalPoints(scope.$index, scope.row.departure_point_id || []).includes(point.id)"
                                                        style="display: block; margin-bottom: 8px;">
                                                        {{ point.name }}
                                                    </el-checkbox>
                                                </div>
                                            </el-checkbox-group>
                                        </div>
                                    </div>
                                </el-popover>
                            </template>
                        </el-table-column>
                        <el-table-column :label="ruleForm.double_room ? 'GIÁ PHÒNG ĐƠN' : 'GIÁ CHẶNG'">
                            <template #default="scope">
                                <el-input v-model="scope.row.singleRoomPriceDisplay"
                                    :placeholder="ruleForm.double_room ? 'Giá phòng đơn' : 'Giá'"
                                    :disabled="ruleForm.same_price" class="no-border-input w-full"
                                    @input="val => onSingleRoomPriceInput(val, scope.row)" />
                            </template>
                        </el-table-column>
                        <el-table-column v-if="ruleForm.double_room" label="GIÁ PHÒNG ĐÔI">
                            <template #default="scope">
                                <el-input v-model="scope.row.doubleRoomPriceDisplay" placeholder="Giá phòng đôi"
                                    :disabled="ruleForm.same_price" class="no-border-input w-full"
                                    @input="val => onDoubleRoomPriceInput(val, scope.row)" />
                            </template>
                        </el-table-column>

                        <el-table-column width="70">
                            <template #default="scope">
                                <el-button type="danger" size="small" @click="removeFareConfigRow(scope.$index)">
                                    Xóa
                                </el-button>
                            </template>
                        </el-table-column>

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
                    <el-button type="primary" @click="handleSubmit(ruleFormRef)">
                        {{ modelEdit ? 'Lưu thay đổi' : 'Lưu cấu hình' }}
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </section>
</template> -->
<!-- <style>
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
</style> -->