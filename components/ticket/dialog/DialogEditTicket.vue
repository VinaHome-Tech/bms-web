<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Checked, Printer, Delete } from '@element-plus/icons-vue'
import type { DTO_RQ_Ticket, Ticket } from '~/types/ticket/ticket.interface'

const props = defineProps<{
    modelValue: boolean
    tickets?: Ticket[]
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'save', data: DTO_RQ_Ticket): void
    (e: 'close'): void
}>()

const visible = ref(props.modelValue)
const activeName = ref('1')
const showCustomerExtra = ref(false)
const showPaymentExtra = ref(false)

// Hàm tạo dữ liệu mặc định
const createEmptyFormData = (): DTO_RQ_Ticket => ({
    customer: { name: undefined, email: undefined, phone: undefined, date_of_birth: undefined, gender: undefined, note: undefined },
    point: { point_up: undefined, time_up: undefined, point_down: undefined, time_down: undefined, transit_up: false, transit_down: false },
    user_created: { id: undefined, name: undefined },
    office_created: { id: undefined, name: undefined },
    price: { total_price: undefined, surcharge: undefined, money_paid: undefined, payment_method: undefined },
    contact_status: undefined,
    ticket_note: undefined,
})

// Hàm chuyển đổi Ticket thành DTO_RQ_Ticket
const convertTicketToFormData = (ticket: Ticket): DTO_RQ_Ticket => ({
    customer: {
        name: ticket.customer?.name,
        phone: ticket.customer?.phone,
        email: ticket.customer?.email,
        gender: ticket.customer?.gender,
        date_of_birth: ticket.customer?.date_of_birth,
        note: ticket.customer?.note,
    },
    point: {
        point_up: ticket.point?.point_up,
        point_down: ticket.point?.point_down,
        time_up: ticket.point?.time_up,
        time_down: ticket.point?.time_down,
        transit_up: ticket.point?.transit_up ?? false,
        transit_down: ticket.point?.transit_down ?? false,
    },
    user_created: {
        id: ticket.user_created?.id,
        name: ticket.user_created?.name,
    },
    office_created: {
        id: ticket.office_created?.id,
        name: ticket.office_created?.name,
    },
    price: {
        total_price: Number(ticket.price?.total_price) || 0,
        surcharge: Number(ticket.price?.surcharge) || 0,
        money_paid: Number(ticket.price?.money_paid) || 0,
        payment_method: ticket.price?.payment_method || 'TTTX',
    },
    contact_status: ticket.contact_status,
    ticket_note: ticket.ticket_note,
})

const formData = ref<DTO_RQ_Ticket>(createEmptyFormData())
const originalData = ref<DTO_RQ_Ticket>(createEmptyFormData())

// Computed - Format Price
const formatPrice = (price: number | undefined): string => {
    if (!price) return '0'
    return String(price).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const parsePrice = (val: string): number => parseInt(val.replace(/\D/g, ''), 10) || 0

// Computed - Display Total Price
const displayTotalPrice = computed({
    get: () => formatPrice(formData.value.price?.total_price),
    set: (val: string) => {
        if (!formData.value.price) formData.value.price = {}
        formData.value.price.total_price = parsePrice(val)
    },
})

// Computed - Display Surcharge Price
const displaySurchargePrice = computed({
    get: () => formatPrice(formData.value.price?.surcharge),
    set: (val: string) => {
        if (!formData.value.price) formData.value.price = {}
        formData.value.price.surcharge = parsePrice(val)
    },
})

// Computed - Display Money Paid Price
const displayMoneyPaidPrice = computed({
    get: () => formatPrice(formData.value.price?.money_paid),
    set: (val: string) => {
        if (!formData.value.price) formData.value.price = {}
        formData.value.price.money_paid = parsePrice(val)
    },
})

// Computed - Display Final Price
const displayFinalPrice = computed(() => {
    const totalPrice = formData.value.price?.total_price || 0
    const surcharge = formData.value.price?.surcharge || 0
    return formatPrice(totalPrice + surcharge)
})

// Watch modelValue prop - Chỉ thay đổi visible khi prop thay đổi
watch(
    () => props.modelValue,
    (val) => {
        visible.value = val
    }
)

// Watch visible ref - Emit khi visible thay đổi
watch(
    () => visible.value,
    (val) => {
        emit('update:modelValue', val)
    }
)

// Watch tickets - Chỉ load dữ liệu, KHÔNG tự động mở dialog
watch(
    () => props.tickets,
    (newVal) => {
        if (!newVal || newVal.length === 0) {
            return
        }

        const ticketData = convertTicketToFormData(newVal[0])
        originalData.value = ticketData
        formData.value = { ...ticketData }
    },
    { immediate: true, deep: true }
)

// Methods
const resetFormData = () => {
    formData.value = { ...originalData.value }
}

const handleClose = () => {
    resetFormData()
    activeName.value = '1'
    showCustomerExtra.value = false
    showPaymentExtra.value = false
    visible.value = false
    emit('close')
}

const handleSave = () => {
    emit('save', formData.value)
    handleClose()
}

const handlePrint = () => {
    console.log('Print ticket')
}

const handleDeleteTicket = () => {
    console.log('Delete ticket')
}
</script>

<template>
    <el-dialog v-model="visible" align-center width="700" @close="handleClose" style="padding: 0px">
        <template #header>
            <div class="pt-[10px] pl-2">
                <span class="text-[16px] font-semibold text-white">Cập nhật thông tin vé</span>
            </div>
        </template>

        <!-- Form Content -->
        <div>
            <div v-if="props.tickets && props.tickets.length > 0">
                <h3 class="text-[14px] font-medium px-2 pt-1">
                    Đang chọn ({{ props.tickets.length }} vé):
                </h3>
                <div class="mb-1 px-2">
                    <el-tag
                        v-for="ticket in props.tickets"
                        :key="ticket.id"
                        class="m-1"
                        type="primary"
                    >
                        {{ ticket.seat?.name }}
                    </el-tag>
                </div>
                <el-tabs v-model="activeName" type="border-card">
                    <el-tab-pane label="Thông tin chung" name="1">
                        <el-form :model="formData" class="h-full overflow-hidden flex flex-col w-full">
                            <div class="overflow-y-auto flex-1 w-full">
                                <!-- Customer Section -->
                                <div>
                                    <h5 class="text-xs font-bold text-gray-600 uppercase mb-2 pb-1 border-b border-gray-300">
                                        THÔNG TIN HÀNH KHÁCH
                                    </h5>
                                    <el-row :gutter="12" class="w-full">
                                        <el-col :span="12" class="w-1/2">
                                            <el-form-item label-position="top" class="mb-1">
                                                <template #label>
                                                    <span class="text-[14px] font-medium">Điện thoại</span>
                                                </template>
                                                <el-input
                                                    v-model="formData.customer!.phone"
                                                    placeholder="Nhập điện thoại"
                                                    class="w-full"
                                                />
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12" class="w-1/2">
                                            <el-form-item label-position="top" class="mb-1">
                                                <template #label>
                                                    <span class="text-[14px] font-medium">Họ tên</span>
                                                </template>
                                                <el-input
                                                    v-model="formData.customer!.name"
                                                    placeholder="Nhập họ tên"
                                                    class="w-full"
                                                />
                                            </el-form-item>
                                        </el-col>
                                    </el-row>

                                    <!-- Additional Customer Info -->
                                    <el-button
                                        text
                                        type="primary"
                                        size="small"
                                        @click="showCustomerExtra = !showCustomerExtra"
                                        class="px-0 mt-[-18px]"
                                    >
                                        <span v-if="!showCustomerExtra">+ Thêm thông tin</span>
                                        <span v-else>- Ẩn thông tin</span>
                                    </el-button>

                                    <el-collapse-transition>
                                        <div
                                            v-show="showCustomerExtra"
                                            class="space-y-3 pl-2 border-l-2 border-blue-200 w-full"
                                        >
                                            <el-row :gutter="12" class="w-full">
                                                <el-col :span="12" class="w-1/2">
                                                    <el-form-item label-position="top">
                                                        <template #label>
                                                            <span class="text-[14px] font-medium">Email</span>
                                                        </template>
                                                        <el-input
                                                            v-model="formData.customer!.email"
                                                            clearable
                                                            placeholder="Nhập email"
                                                            class="w-full"
                                                        />
                                                    </el-form-item>
                                                    <el-form-item label-position="top" class="mt-[-10px]">
                                                        <template #label>
                                                            <span class="text-[14px] font-medium">Giới tính</span>
                                                        </template>
                                                        <el-select
                                                            v-model="formData.customer!.gender"
                                                            placeholder="Chọn"
                                                            clearable
                                                            class="w-full"
                                                        >
                                                            <el-option label="Nam" :value="1" />
                                                            <el-option label="Nữ" :value="2" />
                                                            <el-option label="Khác" :value="3" />
                                                        </el-select>
                                                    </el-form-item>
                                                </el-col>
                                                <el-col :span="12" class="w-1/2">
                                                    <el-form-item label-position="top">
                                                        <template #label>
                                                            <span class="text-[14px] font-medium">Ngày sinh</span>
                                                        </template>
                                                        <el-date-picker
                                                            v-model="formData.customer!.date_of_birth"
                                                            clearable
                                                            type="date"
                                                            placeholder="Chọn"
                                                            class="w-full"
                                                        />
                                                    </el-form-item>
                                                    <el-form-item label-position="top" class="mt-[-10px]">
                                                        <template #label>
                                                            <span class="text-[14px] font-medium">Đại lý</span>
                                                        </template>
                                                        <el-select
                                                            placeholder="Chọn"
                                                            clearable
                                                            class="w-full"
                                                        >
                                                            <el-option label="Đại lý 1" value="A1" />
                                                            <el-option label="Đại lý 2" value="A2" />
                                                        </el-select>
                                                    </el-form-item>
                                                </el-col>
                                            </el-row>
                                        </div>
                                    </el-collapse-transition>
                                </div>

                                <!-- Route Section -->
                                <div>
                                    <el-row :gutter="12" class="w-full">
                                        <el-col :span="12" class="w-1/2">
                                            <el-form-item label-position="top">
                                                <template #label>
                                                    <span class="text-[14px] font-medium">Điểm đón</span>
                                                </template>
                                                <el-input
                                                    v-model="formData.point!.point_up"
                                                    placeholder="Nhập điểm đón"
                                                    class="w-full"
                                                />
                                            </el-form-item>
                                            <el-checkbox v-model="formData.point!.transit_up" class="mt-[-18px]">
                                                <span class="text-[14px] font-medium">Có trung chuyển đón</span>
                                            </el-checkbox>
                                        </el-col>
                                        <el-col :span="12" class="w-1/2">
                                            <el-form-item label-position="top">
                                                <template #label>
                                                    <span class="text-[14px] font-medium">Điểm trả</span>
                                                </template>
                                                <el-input
                                                    v-model="formData.point!.point_down"
                                                    placeholder="Nhập điểm trả"
                                                    class="w-full"
                                                />
                                            </el-form-item>
                                            <el-checkbox v-model="formData.point!.transit_down" class="mt-[-18px]">
                                                <span class="text-[14px] font-medium">Có trung chuyển trả</span>
                                            </el-checkbox>
                                        </el-col>
                                    </el-row>
                                </div>

                                <!-- Note Section -->
                                <div>
                                    <el-form-item label-position="top">
                                        <template #label>
                                            <span class="text-[14px] font-medium">Ghi chú</span>
                                        </template>
                                        <el-input
                                            v-model="formData.ticket_note"
                                            type="textarea"
                                            placeholder="Nhập ghi chú"
                                            :autosize="{ minRows: 2, maxRows: 2 }"
                                            class="w-full"
                                        />
                                    </el-form-item>
                                </div>

                                <!-- Payment Section -->
                                <div>
                                    <h5 class="text-xs font-bold text-gray-600 uppercase mb-2 pb-1 border-b border-gray-300">
                                        THÔNG TIN THANH TOÁN
                                    </h5>

                                    <el-row :gutter="12" class="w-full">
                                        <el-col :span="12" class="w-1/2">
                                            <el-form-item label-position="top" class="mb-3">
                                                <template #label>
                                                    <span class="text-[14px] font-medium">Giá vé</span>
                                                </template>
                                                <el-input
                                                    v-model="displayTotalPrice"
                                                    placeholder="0"
                                                    class="w-full"
                                                />
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12" class="w-1/2">
                                            <el-form-item label-position="top" class="mb-3">
                                                <template #label>
                                                    <span class="text-[14px] font-medium">Hình thức thanh toán</span>
                                                </template>
                                                <el-select
                                                    v-model="formData.price!.payment_method"
                                                    placeholder="Chọn"
                                                    class="w-full"
                                                >
                                                    <el-option label="Thanh toán trên xe" value="TTTX" />
                                                    <el-option label="Thanh toán tại quầy" value="TTTQ" />
                                                    <el-option label="Thanh toán trực tuyến" value="ONLINE" />
                                                    <el-option label="Chuyển khoản" value="CK" />
                                                    <el-option label="Đại lý thu" value="DLT" />
                                                    <el-option label="Không thu tiền" value="KTT" />
                                                </el-select>
                                            </el-form-item>
                                        </el-col>
                                    </el-row>

                                    <el-button
                                        text
                                        type="primary"
                                        size="small"
                                        @click="showPaymentExtra = !showPaymentExtra"
                                        class="px-0 mt-[-18px]"
                                    >
                                        <span v-if="!showPaymentExtra">+ Thêm thông tin</span>
                                        <span v-else>- Ẩn thông tin</span>
                                    </el-button>

                                    <el-collapse-transition>
                                        <div
                                            v-show="showPaymentExtra"
                                            class="space-y-3 pl-2 border-l-2 border-blue-200 w-full"
                                        >
                                            <el-row :gutter="12" class="w-full">
                                                <el-col :span="12" class="w-1/2">
                                                    <el-form-item label-position="top" class="mb-3">
                                                        <template #label>
                                                            <span class="text-[14px] font-medium">Đã thu</span>
                                                        </template>
                                                        <el-input
                                                            v-model="displayMoneyPaidPrice"
                                                            placeholder="0"
                                                            clearable
                                                            class="w-full"
                                                        />
                                                    </el-form-item>
                                                </el-col>
                                                <el-col :span="12" class="w-1/2">
                                                    <el-form-item label-position="top" class="mb-3">
                                                        <template #label>
                                                            <span class="text-[14px] font-medium">Phụ thu</span>
                                                        </template>
                                                        <el-input
                                                            v-model="displaySurchargePrice"
                                                            placeholder="0"
                                                            clearable
                                                            class="w-full"
                                                        />
                                                    </el-form-item>
                                                </el-col>
                                            </el-row>
                                        </div>
                                    </el-collapse-transition>
                                </div>
                            </div>
                        </el-form>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </div>

        <!-- Footer -->
        <template #footer>
            <div class="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200">
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                        <span class="text-[14px] text-gray-600">Tổng tiền:</span>
                        <span class="text-base font-bold text-red-600">{{ displayFinalPrice }} đ</span>
                    </div>
                </div>

                <div class="flex gap-2">
                    <el-button
                        color="#0072bc"
                        :icon="Checked"
                        :disabled="!props.tickets || props.tickets.length === 0"
                        @click="handleSave"
                    >
                        Cập nhật
                    </el-button>
                    <el-button type="warning" :icon="Printer" @click="handlePrint">
                        In vé
                    </el-button>
                    <el-button type="danger" :icon="Delete" @click="handleDeleteTicket">
                        Hủy vé
                    </el-button>
                    <el-button @click="handleClose">
                        Đóng
                    </el-button>
                </div>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped>
:deep(.el-dialog__header) {
    background-color: #0072bc;
    padding-bottom: 10px;
}

:deep(.el-dialog__headerbtn) {
    color: white;
}

:deep(.el-dialog__footer) {
    padding-top: 0;
}
</style>

<!-- <el-tab-pane label="Lịch sử" name="2">
                        <el-table v-loading="loadingHistory" :data="historyTicket" style="width: 100%">
                            <el-table-column label="Thời gian" width="140">
                                <template #default="scope">
                                    <div class="text-black">
                                        {{ format(new Date(scope.row.created_at), 'HH:mm dd-MM-yyyy') }}
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="Người thực hiện" width="140">
                                <template #default="scope">
                                    <div class="text-black">
                                        {{ scope.row.act_by_full_name }}
                                        <br />
                                        ({{ scope.row.act_by_office_name }})
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="Hành động" width="110">
                                <template #default="scope">
                                    <div class="text-black">
                                        {{ getActLabel(scope.row.act) }}
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="Thông tin">
                                <template #default="scope">
                                    <div>
                                      
                                        <template v-if="scope.$index === historyTicket.length - 1">
                                            <div v-if="scope.row.ticket_customer_name">Họ tên: <span
                                                    class="text-black font-semibold">{{ scope.row.ticket_customer_name
                                                    }}</span></div>
                                            <div v-if="scope.row.ticket_phone">Điện thoại: <span
                                                    class="text-black font-semibold">{{ scope.row.ticket_phone }}</span>
                                            </div>
                                            <div v-if="scope.row.contact_status">Trạng thái: <span
                                                    class="text-black font-semibold">{{
                                                        getContactStatusLabel(scope.row.contact_status) }}</span></div>
                                            <div v-if="scope.row.seat_name">Mã ghế: <span
                                                    class="text-black font-semibold">{{ scope.row.seat_name }}</span>
                                            </div>
                                            <div v-if="scope.row.ticket_email">Email: <span
                                                    class="text-black font-semibold">{{ scope.row.ticket_email }}</span>
                                            </div>
                                            <div v-if="scope.row.ticket_point_up">Điểm đón: <span
                                                    class="text-black font-semibold">{{ scope.row.ticket_point_up
                                                    }}</span></div>
                                            <div v-if="scope.row.ticket_point_down">Điểm trả: <span
                                                    class="text-black font-semibold">{{ scope.row.ticket_point_down
                                                    }}</span></div>
                                            <div v-if="scope.row.ticket_note">Ghi chú: <span
                                                    class="text-black font-semibold">{{ scope.row.ticket_note }}</span>
                                            </div>
                                            <div v-if="scope.row.payment_method">HTTT: <span
                                                    class="text-black font-semibold">{{ scope.row.payment_method
                                                    }}</span></div>
                                            <div v-if="scope.row.ticket_display_price">Giá vé: <span
                                                    class="text-black font-semibold">{{
                                                        formatCurrency(scope.row.ticket_display_price) }}</span></div>
                                            <div v-if="scope.row.transit_up || scope.row.transit_down">Trung chuyển:
                                                <el-tag v-if="scope.row.transit_up" type="primary"
                                                    size="small">Đón</el-tag> <el-tag v-if="scope.row.transit_down"
                                                    type="warning" size="small">Trả</el-tag>
                                            </div>
                                        </template>

                                    
                                        <template v-else>
                                            <div
                                                v-if="hasFieldChanged(scope.$index, 'ticket_customer_name', scope.row.ticket_customer_name)">
                                                Họ tên: <span class="text-black font-semibold">{{
                                                    scope.row.ticket_customer_name }}</span></div>
                                            <div
                                                v-if="hasFieldChanged(scope.$index, 'ticket_phone', scope.row.ticket_phone)">
                                                Điện thoại: <span class="text-black font-semibold">{{
                                                    scope.row.ticket_phone }}</span></div>
                                            <div
                                                v-if="hasFieldChanged(scope.$index, 'contact_status', scope.row.contact_status)">
                                                Trạng thái: <span class="text-black font-semibold">{{
                                                    getContactStatusLabel(scope.row.contact_status) }}</span></div>
                                            <div v-if="hasFieldChanged(scope.$index, 'seat_name', scope.row.seat_name)">
                                                Mã ghế: <span class="text-black font-semibold">{{ scope.row.seat_name
                                                }}</span></div>
                                            <div
                                                v-if="hasFieldChanged(scope.$index, 'ticket_email', scope.row.ticket_email)">
                                                Email: <span class="text-black font-semibold">{{ scope.row.ticket_email
                                                }}</span></div>
                                            <div
                                                v-if="hasFieldChanged(scope.$index, 'ticket_point_up', scope.row.ticket_point_up)">
                                                Điểm đón: <span class="text-black font-semibold">{{
                                                    scope.row.ticket_point_up }}</span></div>
                                            <div
                                                v-if="hasFieldChanged(scope.$index, 'ticket_point_down', scope.row.ticket_point_down)">
                                                Điểm trả: <span class="text-black font-semibold">{{
                                                    scope.row.ticket_point_down }}</span></div>
                                            <div
                                                v-if="hasFieldChanged(scope.$index, 'ticket_note', scope.row.ticket_note)">
                                                Ghi chú: <span class="text-black font-semibold">{{ scope.row.ticket_note
                                                }}</span></div>
                                            <div
                                                v-if="hasFieldChanged(scope.$index, 'payment_method', scope.row.payment_method)">
                                                HTTT: <span class="text-black font-semibold">{{ scope.row.payment_method
                                                }}</span></div>
                                            <div
                                                v-if="hasFieldChanged(scope.$index, 'ticket_display_price', scope.row.ticket_display_price)">
                                                Giá vé: <span class="text-black font-semibold">{{
                                                    formatCurrency(scope.row.ticket_display_price) }}</span></div>
                                            <div
                                                v-if="hasFieldChanged(scope.$index, 'transit_up', scope.row.transit_up) || hasFieldChanged(scope.$index, 'transit_down', scope.row.transit_down)">
                                                Trung chuyển:
                                                <el-tag v-if="scope.row.transit_up" type="primary" size="small"
                                                    class="mr-1">Đón</el-tag>
                                                <el-tag v-if="scope.row.transit_down" type="warning"
                                                    size="small">Trả</el-tag>
                                                <span v-if="!scope.row.transit_up && !scope.row.transit_down"
                                                    class="text-gray-500">Không</span>
                                            </div>


                                            <div v-if="scope.row.ticket_customer_name === historyTicket[ scope.$index + 1 ]?.ticket_customer_name &&
                                                scope.row.ticket_phone === historyTicket[ scope.$index + 1 ]?.ticket_phone &&
                                                scope.row.contact_status === historyTicket[ scope.$index + 1 ]?.contact_status &&
                                                scope.row.seat_name === historyTicket[ scope.$index + 1 ]?.seat_name &&
                                                scope.row.ticket_email === historyTicket[ scope.$index + 1 ]?.ticket_email &&
                                                scope.row.ticket_point_up === historyTicket[ scope.$index + 1 ]?.ticket_point_up &&
                                                scope.row.ticket_point_down === historyTicket[ scope.$index + 1 ]?.ticket_point_down &&
                                                scope.row.ticket_note === historyTicket[ scope.$index + 1 ]?.ticket_note &&
                                                scope.row.payment_method === historyTicket[ scope.$index + 1 ]?.payment_method &&
                                                scope.row.ticket_display_price === historyTicket[ scope.$index + 1 ]?.ticket_display_price &&
                                                scope.row.transit_up === historyTicket[ scope.$index + 1 ]?.transit_up &&
                                                scope.row.transit_down === historyTicket[ scope.$index + 1 ]?.transit_down"
                                                class="text-gray-500 italic">
                                                Không có thay đổi
                                            </div>
                                        </template>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-tab-pane> -->