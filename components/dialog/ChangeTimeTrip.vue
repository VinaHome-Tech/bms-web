<script setup lang="ts">
import { ref, watch, reactive } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { Checked } from '@element-plus/icons-vue';
import type { DTO_RQ_ChangeTimeTrip, TripItem } from '~/types/trip/trip.interface';
import { format } from 'date-fns';

const props = defineProps<{
  modelValue: boolean
  trip: TripItem | null
  loading?: boolean
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'closed'): void
  (e: 'updated', data: DTO_RQ_ChangeTimeTrip): void
}>();

const visible = ref(props.modelValue);

watch(() => props.modelValue, val => visible.value = val);
watch(visible, val => emit('update:modelValue', val));

const ruleFormRef = ref<FormInstance>();
const ruleForm = ref<DTO_RQ_ChangeTimeTrip>({
  id: props.trip?.id ?? 0,
  start_time: props.trip?.start_time ?? '',
});

watch(() => props.trip, trip => {
  if (trip) {
    ruleForm.value.id = trip.id ?? 0;
    ruleForm.value.start_time = trip.start_time ?? '';
  }
}, { immediate: true });

const rules = reactive<FormRules>({
  start_time: [{ required: true, message: 'Vui lòng chọn giờ khởi hành', trigger: 'blur' }]
});

function handleClose() {
  visible.value = false;
  resetForm();
  emit('closed');
}

const submitForm = async (formEl?: FormInstance) => {
  if (!formEl) return;
  await formEl.validate((valid) => {
    if (valid) {
      emit('updated', ruleForm.value); // truyền dữ liệu về trang cha
    //   handleClose();
    }
  });
}

const resetForm = () => {
  ruleForm.value = {
    id: props.trip?.id ?? 0,
    start_time: props.trip?.start_time ?? ''
  };
}
</script>

<template>
  <el-dialog v-model="visible" width="350" @close="handleClose" style="padding: 0px;">
    <template #header>
      <div class="pt-2 pl-2">
        <span class="text-[16px] font-semibold text-white">Thay đổi giờ khởi hành</span>
      </div>
    </template>
    <div class="px-2 pt-3">
      <div class="my-2">
        <h3 class="text-[14px] font-semibold">
          Chuyến: {{ props.trip?.route_name }} | 
          {{ props.trip?.start_date ? format(props.trip.start_date, 'dd/MM/yyyy') : '' }} | 
          {{ props.trip?.start_time }}
        </h3>
      </div>
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="auto">
        <el-form-item label="Chọn giờ mới:">
          <el-time-picker
            v-model="ruleForm.start_time"
            format="HH:mm"
            value-format="HH:mm"
            style="width: 120px;"
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="flex justify-end p-2">
        <el-button @click="submitForm(ruleFormRef)" type="primary" :icon="Checked" :loading="props.loading" :disabled="props.loading">
          {{ props.loading ? 'Đang lưu...' : 'Lưu giờ mới' }}
        </el-button>
        <el-button @click="handleClose">Đóng</el-button>
      </div>
    </template>
  </el-dialog>
</template>
