<script setup lang="ts">
import type { DTO_RP_CancelTicket } from '~/types/ticketType';
import { Location } from '@element-plus/icons-vue';
import { formatCurrencyWithoutSymbol } from '~/lib/formatCurrency';

defineProps<{
    tickets: DTO_RP_CancelTicket[];
    loading: boolean;
}>();

const emit = defineEmits<{
    showHistory: [ ticket: DTO_RP_CancelTicket ]
    copyTicket: [ ticket: DTO_RP_CancelTicket ]
}>();
const CONTACT_STATUSES = [
    { value: 1, label: 'Chưa gọi', color: 'bg-white' },
    { value: 2, label: 'Phòng vé đã gọi', color: 'bg-blue-500' },
    { value: 3, label: 'Phòng vé gọi không nghe', color: 'bg-[#FFFF66]' },
    { value: 4, label: 'Tài xế đã gọi', color: 'bg-green-500' },
    { value: 5, label: 'Tài xế gọi không nghe', color: 'bg-[#8B6969]' },
    { value: 6, label: 'Số điện thoại không đúng', color: 'bg-pink-500' },
    { value: 7, label: 'Đã gọi cho tài xế', color: 'bg-[#00FFFF]' },
    { value: 8, label: 'Thuê bao không gọi được', color: 'bg-[#CC66FF]' },
    { value: 9, label: 'Tài xế báo hủy', color: 'bg-red-500' },
    { value: 10, label: 'Đã nhận tin', color: 'bg-[#FFFFCC]' },
    { value: 11, label: 'Đã nhận tin trung chuyển', color: 'bg-emerald-200' },
    { value: 12, label: 'Sai địa chỉ đón', color: 'bg-[#CC3300]' },
    { value: 13, label: 'Chuyển chuyến khác', color: 'bg-[#336666]' }
] as const;

function getContactStatusColor(status?: number) {
    const st = CONTACT_STATUSES.find(s => s.value === status);
    return st ? st.color : 'bg-white';
}
function getCurrentStatus(status?: number) {
    return CONTACT_STATUSES.find(s => s.value === status) || CONTACT_STATUSES[ 0 ];
}
</script>
<template>
    <div class="pb-2">
        <!-- Khi đang tải -->
        <div v-if="loading" class="flex justify-center items-center h-40">
            <el-empty description="Đang tải danh sách vé..." />
        </div>

        <!-- Khi không có dữ liệu -->
        <div v-else-if="!tickets || tickets.length === 0" class="flex justify-center items-center h-40">
            <el-empty description="Không có vé hủy nào" />
        </div>

        <!-- Khi có dữ liệu -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
            <div
                v-for="ticket in tickets"
                :key="ticket.id"
                class="rounded-md border-2 border-gray-200 relative group cursor-pointer flex flex-col h-full">

                <!-- Overlay hiện khi hover -->
                <div
                    class="absolute bottom-0 left-0 right-0 h-[40%] bg-gray-200 bg-opacity-30 backdrop-blur-sm rounded-b-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center z-10">
                    <div class="flex gap-3">
                        <el-button type="primary" @click.stop="emit('showHistory', ticket)">
                            Lịch sử
                        </el-button>
                        <el-button type="success" @click.stop="emit('copyTicket', ticket)">
                            Sao chép
                        </el-button>
                    </div>
                </div>

                <!-- Main content wrapper với flex-grow -->
                <div class="flex flex-col h-full">
                    <!-- Content chính -->
                    <div class="flex-grow">
                        <!-- Header: Mã vé và SĐT -->
                        <div class="flex justify-between items-start">
                            <div class=" ml-1 mt-1 font-semibold text-red-600 text-base">{{ ticket.seat_name }}</div>
                            <el-tooltip :content="getCurrentStatus(ticket.contact_status).label" placement="top" effect="dark">
                                <div
                                    :class="[
                                        'border-1 rounded px-1 mt-1 border-gray-300  mr-1 transition-colors cursor-help',
                                        getContactStatusColor(ticket.contact_status)
                                    ]">
                                    <span class="font-medium text-black">{{ ticket.ticket_phone }}</span>
                                </div>
                            </el-tooltip>
                        </div>

                        <!-- Tên khách hàng -->
                        <div class="px-1">
                            <span class="text-base font-medium text-[15px]">{{ ticket.ticket_customer_name }}</span>
                        </div>

                        <!-- Điểm đón và điểm trả -->
                        <div class="space-y-2">
                            <div class="px-1">
                                <div v-if="ticket.ticket_point_up" class="flex items-center gap-1 text-gray-600">
                                    <el-icon color="#CC0000">
                                        <Location />
                                    </el-icon>
                                    <span class="text-[14px] font-medium">{{ ticket.ticket_point_up }}</span>
                                </div>
                                <div v-if="ticket.ticket_point_down" class="flex items-center gap-1 text-gray-600">
                                    <el-icon color="#0033FF">
                                        <Location />
                                    </el-icon>
                                    <span class="text-[14px] font-medium">{{ ticket.ticket_point_down }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Số ghế -->
                        <div class="px-1">
                            <span class="text-[14px] font-medium text-[#0072bc]">* {{ ticket.ticket_note }}</span>
                        </div>
                    </div>

                    <!-- Footer section - luôn ở dưới cùng -->
                    <div class="mt-auto">
                        <div class="px-1">
                            <div class="flex justify-between items-center text-[14px] font-medium text-gray-600">
                                <span>0/{{ formatCurrencyWithoutSymbol(ticket.ticket_display_price) }}</span>
                                <span>{{ ticket.payment_method }}</span>
                            </div>
                            <div class="h-[5px] bg-[#0072bc] rounded-lg" />
                        </div>
                        <div class="px-1">
                            <span class="text-[12px] font-medium text-gray-600">P: {{ ticket.user_created }} /{{
                                ticket.office_created
                            }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>



<style scoped>
.el-card {
    transition: all 0.2s ease;
}

.el-card:hover {
    transform: translateY(-3px);
}
</style>
