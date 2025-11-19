<script setup lang="ts">
import { Checked } from '@element-plus/icons-vue';
import { userStore } from '~/stores/useUserStore';
import { useVehicleList } from '~/composables/vehicle/useVehicleList';
import type { TripItem } from '~/types/trip/trip.interface';
import { useEmployeeList } from '~/composables/account/useEmployeeList';
import { useTripActions } from '~/composables/trip/useTripActions';

const props = defineProps<{
    modelValue: boolean
    trip?: TripItem | null
}>()
const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'closed'): void
}>()

const {
    licensePlate,
    loadingLicensePlate,
    fetchLicensePlateVehicle
} = useVehicleList();
const {
    loadingUpdateTrip,
    handleUpdateTripInformation
} = useTripActions();
const {
    loadingDriver,
    loadingAssistant,
    driverList,
    assistantList,
    fetchDriverListByCompanyId,
    fetchAssistantListByCompanyId
} = useEmployeeList();

const useUserStoreInstance = userStore();
const visible = computed({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val),
})

const ruleForm = ref<Partial<TripItem>>(props.trip || {
    id: undefined,
    start_time: undefined,
    driver: [],
    assistant: [],
    vehicle_id: undefined,
    license_plate: undefined,
    vehicle_phone: undefined,
    note: undefined,
})

// Watch để cập nhật form khi trip thay đổi
watch(() => props.trip, (newTrip) => {
    if (newTrip) {
        ruleForm.value = ({
            id: newTrip.id,
            start_time: newTrip.start_time?.slice(0, 5),
            driver: Array.isArray(newTrip.driver) ? [...newTrip.driver] : [],
            assistant: Array.isArray(newTrip.assistant) ? [...newTrip.assistant] : [],
            vehicle_id: newTrip.vehicle_id,
            license_plate: newTrip.license_plate || undefined,
            vehicle_phone: newTrip.vehicle_phone || undefined,
            note: newTrip.note || undefined,
        })
    }
}, { deep: true })

function handleClose() {
    visible.value = false
    ruleForm.value = {
        id: props.trip?.id,
        start_time: props.trip?.start_time?.slice(0, 5),
        driver: props.trip?.driver || [],
        assistant: props.trip?.assistant || [],
        vehicle_id: props.trip?.vehicle_id,
        license_plate: props.trip?.license_plate,
        vehicle_phone: props.trip?.vehicle_phone,
        note: props.trip?.note,
    }
    emit('closed')
}
function handleVehicleChange(vehicleId: number) {
    const selectedVehicle = licensePlate.value.find(v => v.id === vehicleId)
    if (selectedVehicle) {
        ruleForm.value.license_plate = selectedVehicle.license_plate
        ruleForm.value.vehicle_phone = selectedVehicle.phone
    }
}
async function handleUpdate() {
    await handleUpdateTripInformation(ruleForm.value)
    visible.value = false
}
// Gọi API chỉ khi dialog mở
watch(() => props.modelValue, async (isOpen) => {
    if (isOpen) {
        await Promise.all([
            fetchLicensePlateVehicle(useUserStoreInstance.company_id ?? ''),
            fetchDriverListByCompanyId(useUserStoreInstance.company_id ?? ''),
            fetchAssistantListByCompanyId(useUserStoreInstance.company_id ?? '')
        ]);
    }
});
</script>

<template>
    <el-dialog v-model="visible" width="600" @close="handleClose" style="padding: 0px;">
        <template #header>
            <div class="pt-[10px] pl-2">
                <span class="text-[16px] font-semibold text-white">Cập nhật thông tin chuyến</span>
            </div>
        </template>
        <div class="px-2 pt-2">
            <el-form :model="ruleForm">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label-position="top">
                            <template #label>
                                <label class="text-sm font-medium text-gray-700">Giờ khởi hành</label>
                            </template>
                            <el-time-select 
                                v-model="ruleForm.start_time" 
                                style="width: 240px" 
                                start="00:05"
                                step="00:05" 
                                end="23:55" 
                                placeholder="Chọn thời gian" 
                                format="HH:mm" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label-position="top">
                            <template #label>
                                <label class="text-sm font-medium text-gray-700">Xe</label>
                            </template>
                            <el-select 
                                v-model="ruleForm.vehicle_id" 
                                filterable 
                                clearable
                                placeholder="Chọn xe"
                                :loading="loadingLicensePlate" 
                                loading-text="Đang tải danh sách xe..."
                                no-data-text="Không có dữ liệu xe"
                                @change="handleVehicleChange"
                                >
                                <el-option 
                                    v-for="item in licensePlate" 
                                    :key="item.id" 
                                    :label="item.license_plate"
                                    :value="item.id" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item label-position="top">
                    <template #label>
                        <label class="text-sm font-medium text-gray-700">Tài xế</label>
                    </template>
                    <el-select 
                        v-model="ruleForm.driver" 
                        filterable 
                        multiple 
                        placeholder="Chọn tài xế"
                        :loading="loadingDriver" 
                        loading-text="Đang tải danh sách tài xế..."
                        no-data-text="Không có dữ liệu tài xế" 
                        :disabled="loadingDriver" 
                        value-key="id">
                        <el-option 
                            v-for="item in driverList" 
                            :key="item.id" 
                            :label="item.name"
                            :value="{ id: item.id, name: item.name, phone: item.phone }" />
                    </el-select>
                </el-form-item>

                <el-form-item label-position="top">
                    <template #label>
                        <label class="text-sm font-medium text-gray-700">Phụ xe</label>
                    </template>
                    <el-select 
                        v-model="ruleForm.assistant" 
                        filterable 
                        multiple 
                        placeholder="Chọn phụ xe"
                        :loading="loadingAssistant" 
                        loading-text="Đang tải danh sách phụ xe..."
                        no-data-text="Không có dữ liệu phụ xe" 
                        :disabled="loadingAssistant" 
                        value-key="id">
                        <el-option 
                            v-for="item in assistantList" 
                            :key="item.id" 
                            :label="item.name"
                            :value="{ id: item.id, name: item.name, phone: item.phone }" />
                    </el-select>
                </el-form-item>

                <el-form-item label-position="top">
                    <template #label>
                        <label class="text-sm font-medium text-gray-700">Ghi chú</label>
                    </template>
                    <el-input v-model="ruleForm.note" />
                </el-form-item>
            </el-form>
        </div>

        <template #footer>
            <div class="flex justify-end p-2">
                <el-button 
                    color="#0072bc" 
                    :icon="Checked" 
                    :loading="loadingUpdateTrip" 
                    @click="handleUpdate">
                    {{ loadingUpdateTrip ? 'Đang cập nhật...' : 'Cập nhật' }}
                </el-button>
                <el-button @click="handleClose">Đóng</el-button>
            </div>
        </template>
    </el-dialog>
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