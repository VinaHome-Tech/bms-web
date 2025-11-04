<script setup lang="ts">
import { ref, watch } from 'vue';
import type { DTO_RP_HistoryTicket } from '~/types/historyTicketType';
import { format } from 'date-fns';
import { formatCurrency } from '~/lib/formatCurrency';
import { mockTicketContactStatusList } from '~/shared/mocks/ticket.mock';
// 👇 Đúng cú pháp của v-model
const props = defineProps<{
    modelValue: boolean; // phải là modelValue
    data: DTO_RP_HistoryTicket[];
    loading: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'closed'): void;
}>();

const visible = ref(props.modelValue);

function handleClose() {
    visible.value = false;
    emit('update:modelValue', false);
    emit('closed');
}
const getActLabel = (act: string): string => {
    switch (act) {
        case 'UPDATE':
            return 'Cập nhật';
        case 'COPY':
            return 'Sao chép';
        case 'MOVE':
            return 'Di chuyển';
        case 'UPDATE_CONTACT':
            return 'Liên hệ';
        case 'CANCEL':
            return 'Huỷ vé';
        default:
            return act;
    }
}
const getContactStatusLabel = (status: number): string => {
  const found = mockTicketContactStatusList.find(item => item.id === status);
  return found ? found.label : '-';
}
// Helper function để tìm giá trị trước đó của một trường
const getPreviousValue = (currentIndex: number, fieldName: string) => {
    for (let i = currentIndex + 1; i < props.data.length; i++) {
        const item = props.data[i];
        const value = (item as unknown as Record<string, unknown>)[fieldName];
        if (value !== null && value !== undefined && value !== '') {
            return value;
        }
    }
    return null;
}

// Helper function để kiểm tra có thay đổi không
const hasFieldChanged = (currentIndex: number, fieldName: string, currentValue: unknown) => {
    if (!currentValue && currentValue !== false && currentValue !== 0) return false;
    
    const previousValue = getPreviousValue(currentIndex, fieldName);
    return currentValue !== previousValue;
}
// Khi visible thay đổi → cập nhật lại v-model ở parent
watch(visible, (val) => {
    emit('update:modelValue', val);
});

// Khi prop modelValue từ parent thay đổi → đồng bộ lại
watch(
    () => props.modelValue,
    (val) => {
        visible.value = val;
    }
);
</script>

<template>
    <el-dialog v-model="visible" width="800" style="padding: 0px;" @close="handleClose">
        <template #header>
            <div class="pt-[10px] pl-2">
                <span class="text-[16px] font-semibold text-white">Lịch sử vé</span>
            </div>
        </template>

        <div class="px-2 pt-3">
            <el-table v-loading="loading" :data="data" style="width: 100%">
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
                            <br>
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
                            <!-- Hiển thị đầy đủ cho dòng cuối cùng (dòng đầu tiên theo thời gian) -->
                            <template v-if="scope.$index === data.length - 1">
                                <div v-if="scope.row.ticket_customer_name">Họ tên: <span
                                        class="text-black font-semibold">{{ scope.row.ticket_customer_name }}</span>
                                </div>
                                <div v-if="scope.row.ticket_phone">Điện thoại: <span class="text-black font-semibold">{{
                                        scope.row.ticket_phone }}</span></div>
                                <div v-if="scope.row.contact_status">Trạng thái: <span
                                        class="text-black font-semibold">{{
                                        getContactStatusLabel(scope.row.contact_status) }}</span></div>
                                <div v-if="scope.row.seat_name">Mã ghế: <span class="text-black font-semibold">{{
                                        scope.row.seat_name }}</span></div>
                                <div v-if="scope.row.ticket_email">Email: <span class="text-black font-semibold">{{
                                        scope.row.ticket_email }}</span></div>
                                <div v-if="scope.row.ticket_point_up">Điểm đón: <span
                                        class="text-black font-semibold">{{ scope.row.ticket_point_up }}</span></div>
                                <div v-if="scope.row.ticket_point_down">Điểm trả: <span
                                        class="text-black font-semibold">{{ scope.row.ticket_point_down }}</span></div>
                                <div v-if="scope.row.ticket_note">Ghi chú: <span class="text-black font-semibold">{{
                                        scope.row.ticket_note }}</span></div>
                                <div v-if="scope.row.payment_method">HTTT: <span class="text-black font-semibold">{{
                                        scope.row.payment_method }}</span></div>
                                <div v-if="scope.row.ticket_display_price">Giá vé: <span
                                        class="text-black font-semibold">{{
                                        formatCurrency(scope.row.ticket_display_price) }}</span></div>
                                <div v-if="scope.row.transit_up || scope.row.transit_down">Trung chuyển: <el-tag
                                        v-if="scope.row.transit_up" type="primary" size="small">Đón</el-tag> <el-tag
                                        v-if="scope.row.transit_down" type="warning" size="small">Trả</el-tag></div>
                            </template>

                            <!-- Chỉ hiển thị thông tin khác biệt so với lần có giá trị trước đó -->
                            <template v-else>
                                <div
                                    v-if="hasFieldChanged(scope.$index, 'ticket_customer_name', scope.row.ticket_customer_name)">
                                    Họ tên: <span class="text-black font-semibold">{{ scope.row.ticket_customer_name
                                        }}</span></div>
                                <div v-if="hasFieldChanged(scope.$index, 'ticket_phone', scope.row.ticket_phone)">Điện
                                    thoại: <span class="text-black font-semibold">{{ scope.row.ticket_phone }}</span>
                                </div>
                                <div v-if="hasFieldChanged(scope.$index, 'contact_status', scope.row.contact_status)">
                                    Trạng thái: <span class="text-black font-semibold">{{
                                        getContactStatusLabel(scope.row.contact_status) }}</span></div>
                                <div v-if="hasFieldChanged(scope.$index, 'seat_name', scope.row.seat_name)">Mã ghế:
                                    <span class="text-black font-semibold">{{ scope.row.seat_name }}</span></div>
                                <div v-if="hasFieldChanged(scope.$index, 'ticket_email', scope.row.ticket_email)">Email:
                                    <span class="text-black font-semibold">{{ scope.row.ticket_email }}</span></div>
                                <div v-if="hasFieldChanged(scope.$index, 'ticket_point_up', scope.row.ticket_point_up)">
                                    Điểm đón: <span class="text-black font-semibold">{{ scope.row.ticket_point_up
                                        }}</span></div>
                                <div
                                    v-if="hasFieldChanged(scope.$index, 'ticket_point_down', scope.row.ticket_point_down)">
                                    Điểm trả: <span class="text-black font-semibold">{{ scope.row.ticket_point_down
                                        }}</span></div>
                                <div v-if="hasFieldChanged(scope.$index, 'ticket_note', scope.row.ticket_note)">Ghi chú:
                                    <span class="text-black font-semibold">{{ scope.row.ticket_note }}</span></div>
                                <div v-if="hasFieldChanged(scope.$index, 'payment_method', scope.row.payment_method)">
                                    HTTT: <span class="text-black font-semibold">{{ scope.row.payment_method }}</span>
                                </div>
                                <div
                                    v-if="hasFieldChanged(scope.$index, 'ticket_display_price', scope.row.ticket_display_price)">
                                    Giá vé: <span class="text-black font-semibold">{{
                                        formatCurrency(scope.row.ticket_display_price) }}</span></div>
                                <div
                                    v-if="hasFieldChanged(scope.$index, 'transit_up', scope.row.transit_up) || hasFieldChanged(scope.$index, 'transit_down', scope.row.transit_down)">
                                    Trung chuyển:
                                    <el-tag
                                        v-if="scope.row.transit_up"
                                        type="primary"
                                        size="small"
                                        class="mr-1">Đón</el-tag>
                                    <el-tag v-if="scope.row.transit_down" type="warning" size="small">Trả</el-tag>
                                    <span
                                        v-if="!scope.row.transit_up && !scope.row.transit_down"
                                        class="text-gray-500">Không</span>
                                </div>

                                <!-- Hiển thị thông báo nếu không có thay đổi -->
                                <div
                                    v-if="scope.row.ticket_customer_name === props.data[ scope.$index + 1 ]?.ticket_customer_name &&
                                    scope.row.ticket_phone === props.data[ scope.$index + 1 ]?.ticket_phone &&
                                    scope.row.contact_status === props.data[ scope.$index + 1 ]?.contact_status &&
                                    scope.row.seat_name === props.data[ scope.$index + 1 ]?.seat_name &&
                                    scope.row.ticket_email === props.data[ scope.$index + 1 ]?.ticket_email &&
                                    scope.row.ticket_point_up === props.data[ scope.$index + 1 ]?.ticket_point_up &&
                                    scope.row.ticket_point_down === props.data[ scope.$index + 1 ]?.ticket_point_down &&
                                    scope.row.ticket_note === props.data[ scope.$index + 1 ]?.ticket_note &&
                                    scope.row.payment_method === props.data[ scope.$index + 1 ]?.payment_method &&
                                    scope.row.ticket_display_price === props.data[ scope.$index + 1 ]?.ticket_display_price &&
                                    scope.row.transit_up === props.data[ scope.$index + 1 ]?.transit_up &&
                                    scope.row.transit_down === props.data[ scope.$index + 1 ]?.transit_down"
                                    class="text-gray-500 italic">
                                    Không có thay đổi
                                </div>
                            </template>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </el-dialog>
</template>
