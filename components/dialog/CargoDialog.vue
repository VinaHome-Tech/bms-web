<script setup lang="ts">
import { Checked, StarFilled } from '@element-plus/icons-vue'
import type { CargoType } from '~/types/cargoType';
const props = defineProps<{
    modelValue: boolean
    isEdit?: boolean
}>()
const visible = ref(props.modelValue)
watch(
    () => props.modelValue,
    (val) => {
        visible.value = val
    }
)
const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'closed'): void
    (e: 'save', data: CargoType): void
}>()
watch(visible, (val) => {
    emit('update:modelValue', val)
})
function handleClose() {
    visible.value = false
    formData.value = {
        id: null,
        sender_phone: null,
        sender_name: null,
        sender_cccd: null,
        sender_shipping_method: 'VP',
        pickup_point: null,
        receiver_phone: null,
        receiver_name: null,
        receiver_cccd: null,
        receiver_delivery_method: 'VP',
        dropoff_point: null,
        cargo_name: null,
        cargo_note: null,
        cargo_quantity: 1,
        shipping_fee: 0,
        amount_paid: 0,
        total_amount: 0,
        remaining_amount: 0,
    }
    emit('closed')
}
const formData = ref<CargoType>({
    id: null,
    sender_phone: null,
    sender_name: null,
    sender_cccd: null,
    sender_shipping_method: 'VP',
    pickup_point: null,
    receiver_phone: null,
    receiver_name: null,
    receiver_cccd: null,
    receiver_delivery_method: 'VP',
    dropoff_point: null,
    cargo_name: null,
    cargo_note: null,
    cargo_quantity: 1,
    shipping_fee: 0,
    amount_paid: 0,
    total_amount: 0,
    remaining_amount: 0,
})
const handleSave = () => {
    emit('save', formData.value)
}
watch(
    () => formData.value.shipping_fee,
    (newShippingFee) => {
        const shippingFee = Number(newShippingFee) || 0
        formData.value.total_amount = shippingFee


        const amountPaid = Number(formData.value.amount_paid) || 0
        formData.value.remaining_amount = shippingFee - amountPaid
    }
)

watch(
    () => formData.value.amount_paid,
    (newAmountPaid) => {
        const amountPaid = Number(newAmountPaid) || 0
        const totalAmount = Number(formData.value.total_amount) || 0


        formData.value.remaining_amount = totalAmount - amountPaid
    }
)
</script>
<template>
    <el-dialog v-model="visible" width="1000" @close="handleClose" style="padding: 0px;">
        <template #header>
            <div class="pt-[10px] pl-2">
                <span class="text-[16px] font-semibold text-white">
                    {{ isEdit ? 'Chỉnh sửa đơn hàng' : 'Thêm đơn hàng' }}
                </span>
            </div>
        </template>

        <div class="px-2 pt-3">
            <el-row>
                <el-col :span="12">
                    <div class="">
                        <h3 class="text-base text-black font-semibold mb-4">Khách gửi</h3>
                        <el-row>
                            <el-col :span="12" class="pr-1">
                                <el-form-item label-position="top">
                                    <template #label>
                                        <span class="text-sm font-semibold">Số điện thoại gửi</span>
                                    </template>
                                    <el-input v-model="formData.sender_phone" />
                                </el-form-item>
                                <el-form-item label-position="top">
                                    <template #label>
                                        <span class="text-sm font-semibold">Tên người gửi</span>
                                    </template>
                                    <el-input v-model="formData.sender_name" />
                                </el-form-item>


                            </el-col>
                            <el-col :span="12" class="pl-1 pr-1">
                                <el-form-item label-position="top">
                                    <template #label>
                                        <span class="text-sm font-semibold">CCCD</span>
                                    </template>
                                    <el-input v-model="formData.sender_cccd" />
                                </el-form-item>
                                <el-form-item label-position="top">
                                    <template #label>
                                        <span class="text-sm font-semibold">Hình thức gửi hàng</span>
                                    </template>
                                    <el-select v-model="formData.sender_shipping_method">
                                        <el-option label="Tại văn phòng" value="VP" />
                                        <el-option label="Tại bến" value="TB" />
                                        <el-option label="Dọc đường" value="DĐ" />
                                        <el-option label="Trung chuyển" value="TC" />
                                        <el-option label="Tại nhà" value="TN" />
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-form-item label-position="top" class="pr-1">
                            <template #label>
                                <span class="text-sm font-semibold">Điểm lên</span>
                            </template>
                            <el-input v-model="formData.pickup_point" />
                        </el-form-item>



                    </div>
                </el-col>
                <el-col :span="12">
                    <div>
                        <h3 class="text-base text-black font-semibold mb-4">Khách nhận</h3>
                        <el-row>
                            <el-col :span="12" class="pl-1">
                                <el-form-item label-position="top">
                                    <template #label>
                                        <span class="text-sm font-semibold">Số điện thoại nhận</span>
                                    </template>
                                    <el-input v-model="formData.receiver_phone" />
                                </el-form-item>
                                <el-form-item label-position="top">
                                    <template #label>
                                        <span class="text-sm font-semibold">Tên người nhận</span>
                                    </template>
                                    <el-input v-model="formData.receiver_name" />
                                </el-form-item>


                            </el-col>
                            <el-col :span="12" class="pl-2">
                                <el-form-item label-position="top">
                                    <template #label>
                                        <span class="text-sm font-semibold">CCCD</span>
                                    </template>
                                    <el-input v-model="formData.receiver_cccd" />
                                </el-form-item>
                                <el-form-item label-position="top">
                                    <template #label>
                                        <span class="text-sm font-semibold">Hình thức gửi hàng</span>
                                    </template>
                                    <el-select v-model="formData.receiver_delivery_method">
                                        <el-option label="Tại văn phòng" value="VP" />
                                        <el-option label="Tại bến" value="TB" />
                                        <el-option label="Dọc đường" value="DĐ" />
                                        <el-option label="Trung chuyển" value="TC" />
                                        <el-option label="Tại nhà" value="TN" />
                                    </el-select>
                                </el-form-item>
                            </el-col>

                        </el-row>
                        <el-form-item label-position="top" width="100%" class="pl-1">
                            <template #label>
                                <span class="text-sm font-semibold">Điểm trả</span>
                            </template>
                            <el-input v-model="formData.dropoff_point" />
                        </el-form-item>
                    </div>
                </el-col>
            </el-row>
            <el-divider>
                <el-icon>
                    <StarFilled />
                </el-icon>
                <el-icon>
                    <StarFilled />
                </el-icon>
                <el-icon>
                    <StarFilled />
                </el-icon>
            </el-divider>
            <el-row :gutter="10">
                <el-col :span="9">
                    <el-form-item label-position="top" width="100%">
                        <template #label>
                            <span class="text-sm font-semibold">Tên hàng</span>
                        </template>
                        <el-input v-model="formData.cargo_name" />
                    </el-form-item>
                    <el-form-item label-position="top" width="100%">
                        <template #label>
                            <span class="text-sm font-semibold">Ghi chú</span>
                        </template>
                        <el-input v-model="formData.cargo_note" />
                    </el-form-item>
                </el-col>
                <el-col :span="3">
                    <el-form-item label-position="top" width="100%">
                        <template #label>
                            <span class="text-sm font-semibold">Số lượng</span>
                        </template>
                        <el-input v-model="formData.cargo_quantity" type="number" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label-position="top" width="100%">
                        <template #label>
                            <span class="text-sm font-semibold text-[#DD0000]">Cước phí</span>
                        </template>
                        <el-input v-model="formData.shipping_fee" 
                            :formatter="(value: any) => value ? `${Number(value).toLocaleString('vi-VN')}` : ''"
                            :parser="(value: string) => value.replace(/\D/g, '')" />
                    </el-form-item>
                    <el-form-item label-position="top" width="100%">
                        <template #label>
                            <span class="text-sm font-semibold text-[#009900]">Đã trả</span>
                        </template>
                        <el-input v-model="formData.amount_paid" 
                            :formatter="(value: any) => value ? `${Number(value).toLocaleString('vi-VN')}` : ''"
                            :parser="(value: string) => value.replace(/\D/g, '')" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label-position="top" width="100%">
                        <template #label>
                            <span class="text-sm font-semibold text-[#DD0000]">Tổng tiền</span>
                        </template>
                        <el-input v-model="formData.total_amount" disabled
                            :formatter="(value: any) => value ? `${Number(value).toLocaleString('vi-VN')}` : ''"
                            :parser="(value: string) => value.replace(/\D/g, '')" />
                    </el-form-item>

                    <el-form-item label-position="top" width="100%">
                        <template #label>
                            <span class="text-sm font-semibold ">Còn lại</span>
                        </template>
                        <el-input v-model="formData.remaining_amount" disabled
                            :formatter="(value: any) => value ? `${Number(value).toLocaleString('vi-VN')}` : ''"
                            :parser="(value: string) => value.replace(/\D/g, '')" />
                    </el-form-item>
                </el-col>
            </el-row>
        </div>
        <template #footer>
            <div class="flex justify-end p-2">

                <el-button @click="handleSave" type="primary" :icon="Checked" plain>Lưu đơn hàng</el-button>
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

.demo-border .text {
    width: 15%;
}

.demo-border .line {
    width: 70%;
}

.demo-border .line div {
    width: 100%;
    height: 0;
    border-top: 1px solid var(--el-border-color);
}

.demo-border .line .dashed {
    border-top: 2px dashed var(--el-border-color);
}
</style>
<style scoped>
.el-form-item {
    margin-bottom: 10px !important;
}

.el-form-item--label-top .el-form-item__label {
    margin-bottom: 0px !important;
}
</style>