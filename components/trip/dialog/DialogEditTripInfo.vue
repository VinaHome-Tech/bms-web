<script setup lang="ts">
import { Checked } from '@element-plus/icons-vue'
import type { Assistant, Driver } from '~/types/account/account.interface';
import type { Trip } from '~/types/trip/trip.interface'
import type { LicensePlateVehicle } from '~/types/vehicle/vehicle.interface';

/* ================== props ================== */
const props = defineProps<{
  modelValue: boolean
  trip?: Trip | null
  loading?: boolean

  vehicles: LicensePlateVehicle[]
  loadingVehicles?: boolean

  drivers: Driver[]
  loadingDrivers?: boolean

  assistants: Assistant[]
  loadingAssistants?: boolean
}>()

/* ================== emits ================== */
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', payload: Partial<Trip>): void
  (e: 'closed'): void
}>()

/* ================== dialog visible ================== */
const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

/* ================== form ================== */
const ruleForm = ref<Partial<Trip>>({})

watch(
  () => props.trip,
  (newTrip) => {
    if (!newTrip) return
    ruleForm.value = {
      id: newTrip.id,
      start_time: newTrip.start_time?.slice(0, 5),
      driver: Array.isArray(newTrip.driver) ? [...newTrip.driver] : [],
      assistant: Array.isArray(newTrip.assistant) ? [...newTrip.assistant] : [],
      vehicle: newTrip.vehicle ? { ...newTrip.vehicle } : undefined,
      note: newTrip.note,
    }
  },
  { immediate: true },
)


function handleClose() {
  visible.value = false
  emit('closed')
}

function handleSubmit() {
  emit('save', ruleForm.value)
}
</script>


<template>
  <el-dialog v-model="visible" width="600" @close="handleClose" style="padding: 0px;">
    <template #header>
      <div class="pt-[10px] pl-2">
        <span class="text-[16px] font-semibold text-white">
          Cập nhật thông tin chuyến
        </span>
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
                format="HH:mm"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label-position="top">
              <template #label>
                <label class="text-sm font-medium text-gray-700">Xe</label>
              </template>
              <el-select
                v-model="ruleForm.vehicle"
                filterable
                clearable
                placeholder="Chọn xe"
                :loading="props.loadingVehicles"
                value-key="id"
              >
                <el-option
                  v-for="item in props.vehicles"
                  :key="item.id"
                  :label="item.license_plate"
                  :value="{ id: item.id, license_plate: item.license_plate, phone: item.phone }"
                />
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
            :loading="props.loadingDrivers"
            value-key="id"
          >
            <el-option
              v-for="item in props.drivers"
              :key="item.id"
              :label="item.name"
              :value="{ id: item.id, name: item.name, phone: item.phone }"
            />
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
            :loading="props.loadingAssistants"
            value-key="id"
          >
            <el-option
              v-for="item in props.assistants"
              :key="item.id"
              :label="item.name"
              :value="{ id: item.id, name: item.name, phone: item.phone }"
            />
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
          :loading="props.loading"
          @click="handleSubmit"
        >
          {{ props.loading ? 'Đang cập nhật...' : 'Cập nhật' }}
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