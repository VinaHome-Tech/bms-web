<script setup lang="ts">
import type { CancelTicketType, TicketPayloadUpdate, TicketType } from '~/types/ticketType'
import { Checked, Printer, Delete } from '@element-plus/icons-vue'

const props = defineProps<{
    modelValue: boolean
    selectedTickets?: TicketType[]
    userName?: string
    officeName?: string
}>()

const localTickets = ref<TicketType[]>([])

watch(
    () => props.selectedTickets,
    (val) => {
        localTickets.value = val ? val.map(ticket => ({ ...ticket })) : []
    },
    { immediate: true, deep: true }
)

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'closed'): void
    (e: 'updateTickets', tickets: TicketPayloadUpdate): void
    (e: 'cancelTickets', tickets: CancelTicketType): void
}>()

const visible = ref(props.modelValue)

watch(
    () => props.modelValue,
    (val) => {
        visible.value = val
    }
)

watch(visible, (val) => {
    emit('update:modelValue', val)
})

function handleClose() {
    visible.value = false
    emit('closed')
}
function handleUpdateDataTicket() {
    if (localTickets.value.length === 0) return
    const ids = localTickets.value.map(ticket => ticket.id)
    const base = localTickets.value[0]
    const updatePayload: TicketPayloadUpdate = {
        id: ids,
        ticket_phone: base.ticket_phone ,
        ticket_email: base.ticket_email,
        ticket_customer_name: base.ticket_customer_name,
        ticket_point_up: base.ticket_point_up,
        ticket_point_down: base.ticket_point_down,
        ticket_note: base.ticket_note,
        ticket_display_price: Number(base.ticket_display_price),
        payment_method: base.payment_method,
        booked_status: base.booked_status,
        user_created: props.userName || '',
        office_created: props.officeName || '',
    }
    emit('updateTickets', updatePayload)
    visible.value = false;
}
function handleCancelTicket() {
    visible.value = false
    const ids = localTickets.value.map(ticket => ticket.id)
    emit('cancelTickets', { id: ids })
}
</script>
<template>
    <el-dialog v-model="visible" width="700" @close="handleClose" style="padding: 0px;">
        <template #title>
            <div class="pt-[10px] pl-2">
                <span class="text-[16px] font-semibold text-white">Cập nhật thông tin vé</span>
            </div>

        </template>



        <!-- Nội dung form chỉnh sửa thông tin vé ở đây -->
        <div class="">
            <div v-if="props.selectedTickets && props.selectedTickets.length > 0">
                <h3 class="text-base font-medium pb-1 px-2 pt-2">Đang chọn ({{ props.selectedTickets.length }} vé):</h3>
                <div class="mb-2 px-2">
                    <el-tag v-for="ticket in localTickets" :key="ticket.id" class="m-1" type="primary">{{
                        ticket.seat_name }}</el-tag>
                </div>
                <el-tabs type="border-card">
                    <el-tab-pane label="Thông tin chung">

                        <el-form :model="localTickets[0]">
                            <el-row>
                                <el-col :span="12" class="pr-2">
                                    <el-form-item label-position="top">
                                        <template #label>
                                            <span class="text-sm font-semibold">Điện thoại</span>
                                        </template>
                                        <el-input v-model="localTickets[0].ticket_phone" width="100%" />
                                    </el-form-item>
                                    <el-form-item label-position="top">
                                        <template #label>
                                            <span class="text-sm font-semibold">Điểm đón</span>
                                        </template>
                                        <el-input v-model="localTickets[0].ticket_point_up" />
                                    </el-form-item>
                                    <el-form-item label-position="top">
                                        <template #label>
                                            <span class="text-sm font-semibold">Điểm trả</span>
                                        </template>
                                        <el-input v-model="localTickets[0].ticket_point_down" />
                                    </el-form-item>
                                    <el-form-item label-position="top">
                                        <template #label>
                                            <span class="text-sm font-semibold">Giá vé</span>
                                        </template>
                                        <el-input v-model="localTickets[0].ticket_display_price" type="number" />
                                    </el-form-item>
                                    <el-form-item label-position="top">
                                        <template #label>
                                            <span class="text-sm font-semibold">Ghi chú</span>
                                        </template>
                                        <el-input v-model="localTickets[0].ticket_note" type="textarea"
                                            :autosize="{ minRows: 2, maxRows: 4 }" />
                                    </el-form-item>

                                </el-col>
                                <el-col :span="12" class="pl-2">
                                    <el-form-item label-position="top">
                                        <template #label>
                                            <span class="text-sm font-semibold">Họ tên</span>
                                        </template>
                                        <el-input v-model="localTickets[0].ticket_customer_name" width="100%" />
                                    </el-form-item>
                                    <el-form-item label-position="top">
                                        <template #label>
                                            <span class="text-sm font-semibold">Email</span>
                                        </template>
                                        <el-input v-model="localTickets[0].ticket_email" width="100%" />
                                    </el-form-item>
                                    <el-form-item label-position="top">
                                        <template #label>
                                            <span class="text-sm font-semibold">Hình thức thanh toán</span>
                                        </template>
                                        <el-select v-model="localTickets[0].payment_method"
                                            placeholder="Chọn hình thức thanh toán">
                                            <el-option label="Thanh toán trên xe" value="TTTX" />
                                            <el-option label="Thanh toán tại quầy" value="TTTQ" />
                                            <el-option label="Thanh toán trực tuyến (Online)" value="ONLINE" />
                                            <el-option label="Chuyển khoản" value="CK" />
                                            <el-option label="Đại lý thu" value="DLT" />
                                            <el-option label="Không thu tiền" value="KTT" />
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label-position="top">
                                        <template #label>
                                            <span class="text-sm font-semibold">Đại lý</span>
                                        </template>
                                        <el-select placeholder="Chọn đại lý">
                                            <el-option label="Thanh toán trên xe" value="TTTX" />
                                            <el-option label="Thanh toán tại quầy" value="TTTQ" />
                                            <el-option label="Thanh toán trực tuyến (Online)" value="ONLINE" />
                                            <el-option label="Chuyển khoản" value="CK" />
                                            <el-option label="Đại lý thu" value="DLT" />
                                            <el-option label="Không thu tiền" value="KTT" />
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </el-form>


                    </el-tab-pane>
                    <el-tab-pane label="Lộ trình">Config</el-tab-pane>
                    <el-tab-pane label="Lịch sử">Config</el-tab-pane>

                </el-tabs>


            </div>
        </div>

        <template #footer>
            <div class="flex justify-end p-2">
                <el-button color="#0072bc" :icon="Checked"
                    :disabled="!props.selectedTickets || props.selectedTickets.length === 0"
                    @click="handleUpdateDataTicket">
                    Cập nhật
                </el-button>
                <el-button type="warning" :icon="Printer">In vé</el-button>
                <el-button type="danger" :icon="Delete" @click="handleCancelTicket">Hủy vé</el-button>
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