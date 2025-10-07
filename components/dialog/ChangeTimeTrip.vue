<script setup lang="ts">
import { format } from 'date-fns';
import type { FormInstance, FormRules } from 'element-plus'
import type { DTO_RQ_ChangeTimeTrip, TripType } from '~/types/tripType';
import { Checked } from '@element-plus/icons-vue'
const props = defineProps<{
    modelValue: boolean
    trip: TripType | null
    isUpdating?: boolean
}>()
const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'closed'): void
    (e: 'updated', data: DTO_RQ_ChangeTimeTrip): void
}>()
const visible = ref(props.modelValue)
watch(
    () => props.modelValue,
    (val) => {
        visible.value = val
    }
)
const ruleFormRef = ref<FormInstance>()
const ruleForm = ref<DTO_RQ_ChangeTimeTrip>({
    trip_id: props.trip?.trip_id ?? 0,
    departure_time: '',
})

const rules = reactive<FormRules>({
    departure_time: [
        { required: true, message: 'Vui lòng chọn giờ khởi hành', trigger: 'blur' },
    ],
})

function handleClose() {
    visible.value = false
    resetForm(ruleFormRef.value)
    emit('closed')
}

watch(visible, (val) => {
    emit('update:modelValue', val)
})
watch(
    () => props.trip,
    (newTrip) => {
        if (newTrip) {
            ruleForm.value.trip_id = newTrip.trip_id
        }
    },
    { immediate: true }
)

const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            console.log('submit!', ruleForm.value)
            emit('updated', ruleForm.value)
        } else {
            console.log('error submit!', fields)
        }
    })
}
const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
    ruleForm.value = {
        trip_id: props.trip?.trip_id ?? 0,
        departure_time: '',
    }
}
</script>
<template>
    <el-dialog v-model="visible" width="350" @close="handleClose" style="padding: 0px;">
        <template #header>
            <div class="pt-[10px] pl-2">
                <span class="text-[16px] font-semibold text-white">
                    Thay đổi giờ khởi hành
                </span>
            </div>
        </template>
        <div class="px-2 pt-3">
            <div class="mt-2">
                <h3 class="text-[14px] font-semibold">Chuyến: {{ trip?.route_name }} | {{ format(trip?.departure_date as
                    Date ??
                    '', 'dd/MM/yyyy') }} | {{ trip?.departure_time }}</h3>
            </div>
            <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" :rules="rules" label-width="auto">
                <div class="mt-5">
                    <el-form-item>
                        <template #label>
                            <span class="text-[14px] font-medium">Chọn giờ mới:</span>
                        </template>
                        <el-time-picker
                            v-model="ruleForm.departure_time"
                            format="HH:mm"
                            value-format="HH:mm"
                            style="width: 120px;"
                            />

                    </el-form-item>
                </div>
            </el-form>

        </div>
        <template #footer>
            <div class="flex justify-end p-2">

                <el-button @click="submitForm(ruleFormRef)" type="primary" :icon="Checked" :loading="isUpdating"
                    :disabled="isUpdating" plain>
                    {{ isUpdating ? 'Đang lưu...' : 'Lưu giờ mới' }}
                </el-button>
                <el-button @click="handleClose">Đóng</el-button>

            </div>
        </template>
    </el-dialog>
</template>