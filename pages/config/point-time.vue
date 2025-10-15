<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { API_GetListPointToConfigTimeByRoute, API_UpdatePointConfigTime } from '~/api/pointAPI';
import { getListRouteNameByCompany } from '~/api/routeAPI';
import type { DTO_RP_ItemPointConfigTime } from '~/types/pointType';
import type { DTO_RP_ListRouteName } from '~/types/routeType';
const useUserStore = userStore()
const listRoute = ref<DTO_RP_ListRouteName[]>([])
const loadingListRoute = ref(false)
const fetchListRoute = async () => {
    try {
        loadingListRoute.value = true
        const response = await getListRouteNameByCompany(useUserStore.company_id || '')
        if (response.success) {
            listRoute.value = response.result || []
        } else {
            notifyError('Lỗi khi tải danh sách tuyến đường')
        }
    } catch (error) {
        console.error('Error fetching routes:', error)
        notifyError('Lỗi khi tải danh sách tuyến đường')
    } finally {
        loadingListRoute.value = false
    }
}
const dialogConfigVisible = ref(false)
const listPointConfigTime = ref<DTO_RP_ItemPointConfigTime[]>([])
const loadingListPointConfigTime = ref(false)
const fetchListPointToConfigTime = async (route_id: number) => {
    try {
        loadingListPointConfigTime.value = true
        const response = await API_GetListPointToConfigTimeByRoute(route_id);
        if (response.success) {
            listPointConfigTime.value = response.result || [];
        } else {
            notifyError('Lỗi khi tải danh sách điểm');
        }
    } catch (error) {
        console.error('Error fetching point config times:', error)
        notifyError('Lỗi khi tải danh sách điểm')
    } finally {
        loadingListPointConfigTime.value = false
    }
}

const currentRoute = ref<DTO_RP_ListRouteName | null>(null)

// Drag and drop state
const draggedItem = ref<number | null>(null)
const draggedOverIndex = ref<number | null>(null)
// Drag and drop handlers
const handleDragStart = (index: number) => {
    draggedItem.value = index
}

const handleDragOver = (event: DragEvent, index: number) => {
    event.preventDefault()
    draggedOverIndex.value = index
}

const handleDragLeave = () => {
    draggedOverIndex.value = null
}

const handleDrop = (event: DragEvent, dropIndex: number) => {
    event.preventDefault()

    if (draggedItem.value === null || draggedItem.value === dropIndex) {
        draggedItem.value = null
        draggedOverIndex.value = null
        return
    }

    const newList = [...listPointConfigTime.value]
    const draggedItemContent = newList[draggedItem.value]

    newList.splice(draggedItem.value, 1)
    newList.splice(dropIndex, 0, draggedItemContent)

    // Update display_order
    listPointConfigTime.value = newList.map((item, index) => ({
        ...item,
        display_order: index + 1
    }))

    draggedItem.value = null
    draggedOverIndex.value = null
}

const handleTimeChange = (id: number, value: string) => {
    const index = listPointConfigTime.value.findIndex(item => item.id === id)
    if (index !== -1) {
        listPointConfigTime.value[index].time_gap = value ? value : ''
    }
}

const handleOpenDialogConfig = async (index: number, row: any) => {
    currentRoute.value = row
    dialogConfigVisible.value = true
    await fetchListPointToConfigTime(row.id)
}

const handleClose = () => {
    dialogConfigVisible.value = false
    currentRoute.value = null
    listPointConfigTime.value = []
}

const handleSave = async () => {
    try {
        // Call your API to save the configuration
        if (currentRoute.value && typeof currentRoute.value.id === 'number') {
            const response = await API_UpdatePointConfigTime(currentRoute.value.id, listPointConfigTime.value)
            if (response.success) {
                console.log('Saved data:', listPointConfigTime.value)
                notifySuccess('Lưu cấu hình thành công')
                // handleClose()
            }
            console.log('Saved data:', listPointConfigTime.value)
            notifySuccess('Lưu cấu hình thành công')
        } else {
            notifyError('Không xác định được tuyến đường để lưu cấu hình')
        }
    } catch (error) {
        console.error('Error saving config:', error)
        notifyError('Lỗi khi lưu cấu hình')
    }
}
onMounted(async () => {
    await useUserStore.loadUserInfo()
    await fetchListRoute()
})
</script>
<template>
    <section>
        <div class="flex justify-between items-center mb-2">
            <h3 class="text-xl font-semibold">Cấu hình thời gian</h3>
            <el-button type="primary" :icon="Plus">Thêm cấu hình</el-button>
        </div>

        <el-table :data="listRoute" style="width: 100%">
            <el-table-column type="index" label="STT" width="60" />
            <el-table-column prop="route_name" label="Tên tuyến" />
            <el-table-column>
                <template #default="scope">
                    <el-button type="primary" plain @click="handleOpenDialogConfig(scope.$index, scope.row)">Xem cấu
                        hình</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-dialog v-model="dialogConfigVisible" width="800px" :before-close="handleClose" :close-on-click-modal="false"
            style="padding: 0px;">
            <template #header>
                <div class="pt-[10px] pl-2">
                    <span class="text-[16px] font-semibold text-white">
                        Cấu hình: {{ currentRoute?.route_name }}
                    </span>
                </div>
            </template>

            <div v-loading="loadingListPointConfigTime" class="px-4 py-2">
                <!-- Instructions -->
                <div class="flex items-center gap-3 p-3 mb-4 bg-blue-50 rounded-lg border border-blue-200">
                    <el-icon class="text-blue-600" :size="20">
                        <InfoFilled />
                    </el-icon>
                    <span class="text-sm text-blue-800">
                        <strong>Hướng dẫn:</strong> Kéo thả các hàng để sắp xếp thứ tự điểm, nhập thời gian di chuyển
                        giữa các
                        điểm (phút)
                    </span>
                </div>

                <!-- Point List -->
                <div v-if="listPointConfigTime.length > 0" class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    <div v-for="(point, index) in listPointConfigTime" :key="point.id" draggable="true"
                        @dragstart="handleDragStart(index)" @dragover="handleDragOver($event, index)"
                        @dragleave="handleDragLeave" @drop="handleDrop($event, index)" :class="[
                            'bg-white rounded-lg border transition-all duration-200 cursor-move',
                            draggedItem === index ? 'opacity-50 scale-95' : 'opacity-100',
                            draggedOverIndex === index && draggedItem !== index
                                ? 'border-2 border-blue-400 shadow-lg'
                                : 'border-gray-200 hover:shadow-md'
                        ]">
                        <div class="p-2">
                            <div class="flex items-center gap-4">
                                <!-- Drag Handle -->
                                <el-icon class="text-gray-400 hover:text-gray-600 cursor-move flex-shrink-0" :size="24">
                                    <DCaret />
                                </el-icon>

                                <!-- Order Number -->
                                <div
                                    class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span class="text-blue-700 font-bold text-sm">{{ index + 1 }}</span>
                                </div>

                                <!-- Point Info -->
                                <div class="flex-grow min-w-0">
                                    <h4 class="font-semibold text-gray-800 mb-1">
                                        {{ point.point_name }}
                                    </h4>
                                    <div v-if="point.address" class="flex items-center gap-2 text-sm text-gray-600">
                                        <el-icon :size="14">
                                            <Location />
                                        </el-icon>
                                        <span class="truncate">{{ point.address }}</span>
                                    </div>
                                </div>

                                <!-- Time Input -->
                                <div class="flex-shrink-0" style="width: 150px;">
                                    <div class="text-xs text-gray-600 mb-1 flex items-center gap-1">
                                        Thời gian (phút)
                                    </div>
                                    <!-- <el-input :model-value="point.time_gap"
                                        @change="(val) => handleTimeChange(point.id, val?.toString() || '')" :min="0"
                                        :precision="0" controls-position="right" placeholder="0" size="default"
                                        style="width: 100%;" /> -->
                                    <el-time-picker v-model="point.time_gap" format="HH:mm" value-format="HH:mm"
                                        style="width: 100%;" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <el-empty v-else description="Không có điểm nào để cấu hình" :image-size="120" />
            </div>

            <template #footer>
                <div class="flex justify-end gap-2 p-2">
                    <el-button @click="handleClose">Thoát</el-button>
                    <el-button type="primary" @click="handleSave" :disabled="listPointConfigTime.length === 0">
                        Lưu cấu hình
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </section>
</template>
<style scoped>
.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>
