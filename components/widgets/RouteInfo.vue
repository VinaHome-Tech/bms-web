<template>
    <div v-if="show" class="bg-white px-2 rounded-lg shadow-md mt-1">
        <div class="py-3">
            <div class="flex items-center justify-between mb-2">
                <h3 class="text-[16px] font-semibold">Lộ trình</h3>
                <el-button size="small" type="primary" plain @click="$emit('close')">
                    <el-icon>
                        <CloseBold />
                    </el-icon>
                    Đóng
                </el-button>
            </div>

            <!-- Route content -->
            <div v-loading="loading" element-loading-text="Đang tải lộ trình...">
                <div v-if="sortedRouteData.length > 0 && !loading" class="flex gap-1">
                    <div v-for="(point, index) in sortedRouteData" :key="point.id">
                        <el-tag 
                        size="large"
                            :type="getTagType(index)" 
                        >
                            <span class="font-medium">
                                <span class="text-[13px] text-gray-700">{{ formatTimeWithGap(props.tripTime, point.time_gap) }}</span> • 
                                <span class="text-[13px]">{{ point.point_name }}</span>
                                <span class="text-gray-500"> ({{ point.address }})</span>
                            </span>
                        </el-tag>
                    </div>
                </div>
                <div v-else-if="!loading && sortedRouteData.length === 0" class="text-center text-gray-500 py-4">
                    Không có dữ liệu lộ trình
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { CloseBold } from '@element-plus/icons-vue'
import { ref, watch, computed } from 'vue'
import { API_GetListRoutePointNameByRoute } from '~/services/pointAPI'
import type { DTO_RP_RoutePointName } from '~/types/pointType'

interface Props {
    show: boolean
    routeId?: number | null
    tripTime?: string
}

interface Emits {
    (e: 'close'): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

// Reactive data
const loading = ref(false)
const routeData = ref<DTO_RP_RoutePointName[]>([])

// Computed: Sắp xếp route theo display_order từ nhỏ đến lớn
const sortedRouteData = computed(() => {
    return [...routeData.value].sort((a, b) => a.display_order - b.display_order)
})

// Function để tính thời gian đến từng điểm
const formatTimeWithGap = (tripTime: string | undefined, timeGap: string): string => {
    if (!tripTime) return '--:--'
    
    try {
        // Parse thời gian khởi hành
        const [startHour, startMinute] = tripTime.split(':').map(Number)
        
        // Parse time_gap (format: HH:MM:SS)
        const [gapHour, gapMinute] = timeGap.split(':').map(Number)
        
        // Tính tổng số phút
        const totalMinutes = startHour * 60 + startMinute + gapHour * 60 + gapMinute
        
        // Chuyển về giờ và phút
        const hours = Math.floor(totalMinutes / 60) % 24
        const minutes = totalMinutes % 60
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    } catch (error) {
        console.error('Error formatting time:', error)
        return '--:--'
    }
}

// Lấy type cho el-tag dựa trên vị trí
const getTagType = (index: number): 'success' | 'info' | 'warning' | 'primary' | 'danger' => {
    const total = sortedRouteData.value.length
    if (index === 0) {
        return 'success' // Điểm đầu - xanh lá
    } else if (index === total - 1) {
        return 'danger' // Điểm cuối - đỏ
    } else {
        return 'primary' // Điểm giữa - xanh dương
    }
}

// Function to call API
const fetchRouteInfo = async () => {
    if (!props.show) return

    loading.value = true
    try {
        const response = await API_GetListRoutePointNameByRoute(props.routeId || 0)
        if (response && response.result) {
            routeData.value = response.result
        } else {
            notifyError(response.message || 'Không thể tải lộ trình')
            routeData.value = []
        }
    } catch (error) {
        console.error('Error fetching route info:', error)
        notifyError('Đã xảy ra lỗi khi tải lộ trình')
        routeData.value = []
    } finally {
        loading.value = false
    }
}

// Watch for show prop changes to trigger API call
watch(() => props.show, (newValue) => {
    if (newValue) {
        fetchRouteInfo()
    } else {
        routeData.value = []
    }
}, { immediate: true })
</script>
