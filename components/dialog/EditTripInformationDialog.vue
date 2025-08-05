<script setup lang="ts">
import type { DTO_RQ_UpdateTrip, TripType } from '~/types/tripType';
import { Checked } from '@element-plus/icons-vue';
import type { LicensePlateType } from '~/types/vehicleType';
import { getLicensePlateByCompany } from '~/api/vehicleAPI';
import type { AssistantType, DriverType } from '~/types/employeeType';
import { getListAssistantByCompany, getListDriverByCompany } from '~/api/employeeAPI';
import { userStore } from '~/stores/useUserStore';

const props = defineProps<{
    modelValue: boolean
    trip?: TripType | null
    isUpdating?: boolean
}>()

const useUserStore = userStore();

const tripModel = ref<DTO_RQ_UpdateTrip>({
    trip_id: props.trip?.trip_id || 0,
    departure_time: props.trip?.departure_time || '',
    seat_chart_id: props.trip?.seat_chart_id || 0,

    vehicle_id: props.trip?.vehicle_id || undefined,
    driver: Array.isArray(props.trip?.driver) ? props.trip.driver : [],
    assistant: Array.isArray(props.trip?.assistant) ? props.trip.assistant : [],
    note: props.trip?.note || '',
    trip_type: props.trip?.trip_type || 0,
});

const handleUpdateTrip = () => {
    if (props.isUpdating) return;
    console.log('Updating trip with model:', tripModel.value);
    emit('updated', tripModel.value);
}


watch(
    () => props.trip,
    (newTrip) => {
        if (newTrip) {
            tripModel.value.trip_id = newTrip.trip_id || 0;
            tripModel.value.departure_time = newTrip.departure_time || '';
            tripModel.value.seat_chart_id = newTrip.seat_chart_id || 0;
            tripModel.value.vehicle_id = typeof newTrip.vehicle_id === 'number' ? newTrip.vehicle_id : undefined;
            tripModel.value.driver = Array.isArray(newTrip.driver) ? newTrip.driver : [];
            tripModel.value.assistant = Array.isArray(newTrip.assistant) ? newTrip.assistant : [];
            tripModel.value.note = newTrip.note ?? '';
            tripModel.value.trip_type = newTrip.trip_type || 0;
        }
    },
    { immediate: true }
);



const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'closed'): void
    (e: 'updated', trip: DTO_RQ_UpdateTrip): void
}>()

const visible = ref(props.modelValue)
watch(
    () => props.modelValue,
    (newValue) => {
        visible.value = newValue;
        
    }
)

watch(visible, (newValue) => {
    emit('update:modelValue', newValue)

})

function handleClose() {
    visible.value = false
    emit('closed')
}


const licensePlate = ref<LicensePlateType[]>([]);
const loadingVehicle = ref(false);
const fetchListVehicle = async () => {
    loadingVehicle.value = true;
    try {
        const response = await getLicensePlateByCompany(useUserStore.company_id ?? '');
        if (response.success) {
            licensePlate.value = response.result ?? [];
            console.log('Danh sách biển số xe:', licensePlate.value);
        } else {
            ElNotification({
                message: h('p', { style: 'color: red' }, response.message || 'Lỗi khi lấy danh sách xe'),
                type: 'error',
            });
        }
    } catch (error) {
        ElNotification({
            message: h('p', { style: 'color: red' }, 'Lỗi khi lấy danh sách xe'),
            type: 'error',
        });
        console.error('Error fetching vehicle list:', error);
    } finally {
        loadingVehicle.value = false;
    }
};
const loadingDriver = ref(false);
const driverList = ref<DriverType[]>([]);
const fetchListDriver = async () => {
    loadingDriver.value = true;
    try {
        const response = await getListDriverByCompany(useUserStore.company_id ?? '');
        if (response.success) {
            driverList.value = response.result ?? [];
            console.log('Danh sách tài xế:', driverList.value);
        } else {
            ElNotification({
                message: h('p', { style: 'color: red' }, response.message || 'Lỗi khi lấy danh sách tài xế'),
                type: 'error',
            });
        }
    } catch (error) {
        ElNotification({
            message: h('p', { style: 'color: red' }, 'Lỗi khi lấy danh sách tài xế'),
            type: 'error',
        });
        console.error('Error fetching driver list:', error);
    } finally {
        loadingDriver.value = false;
    }
};
const loadingAssistant = ref(false);
const assistantList = ref<AssistantType[]>([]);
const fetchListAssistant = async () => {
    loadingAssistant.value = true;
    try {
        const response = await getListAssistantByCompany(useUserStore.company_id ?? '');
        if (response.success) {
            assistantList.value = response.result ?? [];
            console.log('Danh sách phụ xe:', assistantList.value);
        } else {
            ElNotification({
                message: h('p', { style: 'color: red' }, response.message || 'Lỗi khi lấy danh sách phụ xe'),
                type: 'error',
            });
        }
    } catch (error) {
        ElNotification({
            message: h('p', { style: 'color: red' }, 'Lỗi khi lấy danh sách phụ xe'),
            type: 'error',
        });
        console.error('Error fetching assistant list:', error);
    } finally {
        loadingAssistant.value = false;
    }
};

const onDriverChange = (selectedDrivers: DriverType[]) => {
    console.log('Driver selection changed:', selectedDrivers);
    tripModel.value.driver = selectedDrivers.map(driver => ({
        id: driver.id,
        name: driver.name,
        phone: driver.phone
    }));
};

const onAssistantChange = (selectedAssistants: AssistantType[]) => {
    console.log('Assistant selection changed:', selectedAssistants);
    tripModel.value.assistant = selectedAssistants.map(assistant => ({
        id: assistant.id,
        name: assistant.name,
        phone: assistant.phone
    }));
};

onMounted(async () => {
    await useUserStore.loadUserInfo();
    fetchListVehicle();
    fetchListDriver();
    fetchListAssistant();
});
</script>
<template>
    <el-dialog v-model="visible" width="600" @close="handleClose" style="padding: 0px;">
        <template #title>
            <div class="pt-[10px] pl-2">
                <span class="text-[16px] font-semibold text-white">Cập nhật thông tin chuyến</span>
            </div>
        </template>
        <div class="px-2 pt-2">
            <el-form :model="tripModel">


                <!-- {{ trip }} -->
                <el-row>
                    <el-col :span="12">
                        <el-form-item label-position="top">
                            <template #label>
                                <label class="text-sm font-medium text-gray-700">Giờ khởi hành</label>
                            </template>
                            <el-time-select v-model="tripModel.departure_time" style="width: 240px" start="00:05"
                                step="00:05" end="23:55" placeholder="Chọn thời gian" format="hh:mm"/>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label-position="top">
                            <template #label>
                                <label class="text-sm font-medium text-gray-700">Xe</label>
                            </template>
                            <el-select v-model="tripModel.vehicle_id" filterable placeholder="Chọn xe"
                                :loading="loadingVehicle" loading-text="Đang tải danh sách xe..."
                                no-data-text="Không có dữ liệu xe">
                                <el-option v-for="item in licensePlate" :key="item.id" :label="item.license_plate"
                                    :value="item.id" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label-position="top">
                    <template #label>
                        <label class="text-sm font-medium text-gray-700">Tài xế</label>
                    </template>
                    <el-select v-model="tripModel.driver" filterable multiple placeholder="Chọn tài xế"
                        :loading="loadingDriver" loading-text="Đang tải danh sách tài xế..."
                        no-data-text="Không có dữ liệu tài xế" :disabled="loadingDriver" value-key="id"
                        @change="onDriverChange">
                        <el-option v-for="item in driverList" :key="item.id" :label="item.name"
                            :value="{ id: item.id, name: item.name, phone: item.phone }" />
                    </el-select>
                </el-form-item>

                <el-form-item label-position="top">
                    <template #label>
                        <label class="text-sm font-medium text-gray-700">Phụ xe</label>
                    </template>
                    <el-select v-model="tripModel.assistant" filterable multiple placeholder="Chọn phụ xe"
                        :loading="loadingAssistant" loading-text="Đang tải danh sách phụ xe..."
                        no-data-text="Không có dữ liệu phụ xe" :disabled="loadingAssistant" value-key="id"
                        @change="onAssistantChange">
                        <el-option v-for="item in assistantList" :key="item.id" :label="item.name"
                            :value="{ id: item.id, name: item.name, phone: item.phone }" />
                    </el-select>
                </el-form-item>
                <el-form-item label-position="top">
                    <template #label>
                        <label class="text-sm font-medium text-gray-700">Ghi chú</label>
                    </template>
                    <el-input v-model="tripModel.note" />
                </el-form-item>
            </el-form>
        </div>
        <template #footer>
            <div class="flex justify-end p-2">
                <el-button color="#0072bc" :icon="Checked" :loading="isUpdating" @click="handleUpdateTrip">
                    {{ isUpdating ? 'Đang cập nhật...' : 'Cập nhật' }}
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