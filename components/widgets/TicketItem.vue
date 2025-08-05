<script setup lang="ts">
import type { TicketType } from '~/types/ticketType';
import { ArrowDown, Location } from '@element-plus/icons-vue';
import { formatCurrencyWithoutSymbol } from '~/lib/formatCurrency';

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

const { ticket, onClick, isLoading = false } = defineProps<{
    ticket: TicketType;
    onClick: () => void;
    isSelected: boolean;
    selectedBy: string | null;
    isLoading?: boolean;
    isLoadingTicket?: boolean;
    isMoveTicket?: boolean;
    
}>();

function getSeatClass(ticket: TicketType) {
    const baseClass = 'seat-item';
    if (!ticket.seat_status) {
        return `${baseClass} seat-disabled`;
    }
    if (ticket.booked_status) {
        return `${baseClass} seat-booked`;
    }
    return `${baseClass} seat-available`;
}

function handleClick() {
    if (!isLoading) {
        onClick();
    }
}

const emit = defineEmits<{
    updateContactStatus: [status: number]
}>();

// State cho trạng thái liên lạc hiện tại
const currentContactStatus = ref(ticket.contact_status || 1);

// Xử lý cập nhật trạng thái liên lạc
function handleContactStatusChange(status: number) {
    currentContactStatus.value = status;
    emit('updateContactStatus', status);
}

// Lấy thông tin status hiện tại
const getCurrentStatus = computed(() => {
    return CONTACT_STATUSES.find(s => s.value === currentContactStatus.value) || CONTACT_STATUSES[0];
});

const getContactStatusColor = computed(() => {
    const status = CONTACT_STATUSES.find(s => s.value === currentContactStatus.value);
    return status ? status.color : 'bg-white';
});

// Watch để cập nhật khi ticket prop thay đổi
watch(() => ticket.contact_status, (newStatus) => {
    if (newStatus) {
        currentContactStatus.value = newStatus;
    }
});
</script>
<template>
    <div class="relative">
        <svg v-if="isMoveTicket && isSelected"
            class="absolute -top-0.5 -left-0.5 w-[calc(100%+4px)] h-[calc(100%+4px)] pointer-events-none z-10">
            <rect x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)" rx="6" ry="6" fill="none"
                stroke="#0072bc" stroke-width="2" stroke-dasharray="8 4">
                <animate attributeName="stroke-dashoffset" values="0;12" dur="1s" repeatCount="indefinite" />
            </rect>
        </svg>
        <div v-loading="isLoading" element-loading-text="Đang cập nhật vé..." :class="[
            'w-full h-full min-h-[90px] border-2 rounded-md font-semibold cursor-pointer transition-all select-none flex flex-col relative',
            getSeatClass(ticket),
                isMoveTicket && isSelected ? 'border-transparent' :
                isSelected ? 'border-[#0072bc]' : 'border-gray-300'
        ]" @click="handleClick">
            <div class="flex justify-between">
                <div>
                    <span class="mt-2 ml-1 font-semibold text-[#339933] text-base">{{ ticket.seat_name }}</span>
                </div>
                <div v-if="ticket.booked_status">
                    <el-tooltip 
                        :content="getCurrentStatus.label" 
                        placement="top"
                        effect="dark"
                    >
                        <div :class="[
                            'border-1 rounded px-1 border-gray-300 mt-1 mr-1 transition-colors cursor-help',
                            getContactStatusColor
                        ]">
                            <span class="font-medium text-black">{{ ticket.ticket_phone }}</span>
                        </div>
                    </el-tooltip>
                </div>
            </div>

            <div class="flex-1 relative flex flex-col">
                <div v-if="selectedBy && !isLoading"
                    class="absolute inset-0 bg-gray-200 bg-opacity-50 rounded-b flex flex-col items-center justify-center z-10">
                    <!-- Div chứa tên -->
                    <div class="bg-white px-2 py-1 rounded shadow-lg mb-2">
                        <span class="text-sm font-semibold text-gray-800">{{ selectedBy }}</span>
                        <div v-if="isMoveTicket">di chuyển</div>
                    </div>

                    <!-- Dropdown nằm dưới -->
                    <div v-if="ticket.booked_status">
                        <el-dropdown @command="handleContactStatusChange">
                            <span :class="[
                                'el-dropdown-link px-2 py-1 rounded shadow-lg cursor-pointer text-sm flex items-center gap-1 font-medium text-[14px]',
                                getCurrentStatus.color
                            ]">
                                <span class="text-black">{{ getCurrentStatus.label }}</span>
                                <el-icon class="el-icon--right">
                                    <ArrowDown />
                                </el-icon>
                            </span>

                            <template #dropdown>
                                <el-dropdown-menu class="w-64">
                                    <el-dropdown-item v-for="status in CONTACT_STATUSES" :key="status.value"
                                        :command="status.value" :class="[status.color, 'hover:opacity-80']">
                                        <span class="text-black">{{ status.label }}</span>
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                </div>

                <div v-if="ticket.booked_status" class="px-1">
                    <span class="text-base font-medium text-[15px]">{{ ticket.ticket_customer_name }}</span>
                </div>

                <div v-if="ticket.booked_status" class="px-1">
                    <div class="flex items-center gap-1 text-gray-600">
                        <el-icon color="#CC0000">
                            <Location />
                        </el-icon>
                        <span class="text-[14px] font-medium">{{ ticket.ticket_point_up }}</span>
                    </div>
                    <div class="flex items-center gap-1 text-gray-600">
                        <el-icon color="#0033FF">
                            <Location />
                        </el-icon>
                        <span class="text-[14px] font-medium">{{ ticket.ticket_point_down }}</span>
                    </div>
                </div>

                <div v-if="ticket.booked_status" class="flex">
                    <span class="ml-auto pr-1 text-[12px] font-medium text-gray-600">({{ ticket.id }})</span>
                </div>

                <div v-if="ticket.booked_status" class="px-1">
                    <span class="text-[14px] font-medium text-[#0072bc]">* {{ ticket.ticket_note }}</span>
                </div>

                <div class="mt-auto">
                    <div v-if="ticket.booked_status" class="px-1">
                        <div class="flex justify-between items-center text-[14px] font-medium text-gray-600">
                            <span>0/{{ formatCurrencyWithoutSymbol(ticket.ticket_display_price) }}</span>
                            <span>{{ ticket.payment_method }}</span>
                        </div>
                        <div class="h-[5px] bg-[#0072bc] rounded-lg" />
                    </div>
                    <div v-if="ticket.booked_status" class="px-1">
                        <span class="text-[12px] font-medium text-gray-600">P: {{ ticket.user_created }} /{{
                            ticket.office_created
                        }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
