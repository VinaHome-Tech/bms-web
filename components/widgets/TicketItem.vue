<script setup lang="ts">
import { ArrowDown, Location, Unlock } from '@element-plus/icons-vue';
import { formatCurrencyWithoutSymbol } from '~/lib/formatCurrency';
import type { TicketItem } from '~/types/ticket/ticket.interface';
import { userStore } from '~/stores/useUserStore';

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

const { ticket, onClick, isSelected = false, isLoading = false, isMoveTicket = false } = defineProps<{
    ticket: TicketItem;
    onClick: () => void;
    isSelected?: boolean;
    // selectedBy: string | null;
    isLoading?: boolean;
    isMoveTicket?: boolean;
}>();

function getSeatClass(ticket: TicketItem) {
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
    // Nếu đang loading thì không làm gì
    if (isLoading) return;

    // Nếu vé đang được người khác chọn thì không cho click vào tile
    if (isSelectedByOther.value) return;

    onClick();
}

const emit = defineEmits<{
    updateContactStatus: [status: number]
    requestUnlock: [ticketId?: number]
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

// current user store
const store = userStore();

// Kiểm tra vé đang được người khác chọn
const isSelectedByOther = computed(() => {
    if (!ticket.selected_by_id) return false;
    return String(ticket.selected_by_id) !== String(store.id);
});

// Kiểm tra vé đang được chính tôi chọn
const isSelectedByMe = computed(() => {
    if (!ticket.selected_by_id) return false;
    return String(ticket.selected_by_id) === String(store.id);
});

// Countdown (5 phút) khi chính tôi chọn vé
const COUNTDOWN_SECONDS = 5 * 60;
const countdownSeconds = ref<number>(COUNTDOWN_SECONDS);
let countdownTimer: number | null = null;

function startCountdown() {
    stopCountdown();
    countdownSeconds.value = COUNTDOWN_SECONDS;
    countdownTimer = window.setInterval(() => {
        if (countdownSeconds.value > 0) {
            countdownSeconds.value -= 1;
        } else {
            stopCountdown();
            // Hết giờ -> tự động gọi unlock
            handleRequestUnlock();
        }
    }, 1000) as unknown as number;
}

function stopCountdown() {
    if (countdownTimer !== null) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
}

const formattedCountdown = computed(() => {
    const s = Math.max(0, countdownSeconds.value);
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = Math.floor(s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
});

// Computed flag for overlay visibility (make the condition explicit & reactive)
const isOverlayVisible = computed(() => {
    return !!ticket.selected_by_name && !isLoading;
});

// Khởi động/tắt countdown khi selected_by_id/name thay đổi
watch([
    () => ticket.selected_by_id,
    () => ticket.selected_by_name,
], () => {
    // Debug: log changes so we can see updates from parent/store/firebase
    // Remove or guard this in prod if noisy
    try {
        console.debug('Ticket selected change:', { id: ticket.id, selected_by_id: ticket.selected_by_id, selected_by_name: ticket.selected_by_name, isLoading });
    } catch {
        // ignore
    }

    if (isSelectedByMe.value && ticket.selected_by_name && !isLoading) {
        startCountdown();
    } else {
        stopCountdown();
    }
});

// Nếu component unmount thì dọn
onBeforeUnmount(() => {
    stopCountdown();
});

function handleRequestUnlock() {
    // Emit sự kiện để parent xử lý unlock (ví dụ gọi API / cập nhật Firebase)
    emit('requestUnlock', ticket.id);
}
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

        <div v-loading="isLoading"
            element-loading-text="Đang cập nhật vé..."
            :class="[
                'w-full h-full min-h-[100px] border-2 rounded-md font-semibold transition-all select-none flex flex-col relative',
                getSeatClass(ticket),
                isMoveTicket && isSelected ? 'border-transparent' :
                isSelected ? 'border-[#0072bc]' : 'border-gray-300',
                isSelectedByOther ? 'cursor-not-allowed' : 'cursor-pointer'
            ]"
            @click="handleClick">

            <!-- Header: Seat name + Phone -->
            <div class="flex justify-between">
                <div class="mt-[3px]">
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
                            <span class="font-medium text-black">{{ ticket.phone }}</span>
                        </div>
                    </el-tooltip>
                </div>
            </div>

            <!-- Content area -->
            <div class="flex-1 relative flex flex-col">
                <!-- ✅ Overlay khi có selected_by_name -->
                <div v-if="isOverlayVisible"
                    class="absolute inset-0 bg-gray-200 bg-opacity-50 rounded flex flex-col items-center justify-center z-10">
                    
                    <!-- Tên người đang chọn vé -->
                    <div class="bg-white p-1 rounded shadow-lg">
                        <span class="text-sm font-semibold text-gray-800">{{ ticket.selected_by_name }}</span>
                        <div v-if="isMoveTicket" class="text-xs text-gray-600 text-center">
                            (di chuyển)
                        </div>
                        <div v-else class="text-xs text-gray-600 text-center">
                            <template v-if="isSelectedByOther">
                                <div class="flex flex-col items-center gap-1 text-center">
                                    <el-button size="small" type="warning" :icon="Unlock" @click.stop="handleRequestUnlock"/>
                                </div>
                            </template>
                            <template v-else>
                                <div class="text-xs text-gray-500">{{ formattedCountdown }}</div>
                            </template>
                        </div>
                    </div>

                    <!-- Status dropdown (nếu là booked) -->
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
                                    <el-dropdown-item 
                                        v-for="status in CONTACT_STATUSES" 
                                        :key="status.value"
                                        :command="status.value" 
                                        :class="[status.color, 'hover:opacity-80']"
                                    >
                                        <span class="text-black">{{ status.label }}</span>
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                </div>

                <!-- Customer name (nếu booked) -->
                <div v-if="ticket.booked_status" class="px-1">
                    <span class="text-base font-medium text-[15px]">{{ ticket.name }}</span>
                </div>

                <!-- Pickup/Dropoff locations -->
                <div v-if="ticket.booked_status" class="px-1">
                    <div class="flex items-center gap-1 text-gray-600">
                        <el-icon color="#CC0000">
                            <Location />
                        </el-icon>
                        <span class="text-[14px] font-medium">{{ ticket.point_up }}</span>
                    </div>
                    <div class="flex items-center gap-1 text-gray-600">
                        <el-icon color="#0033FF">
                            <Location />
                        </el-icon>
                        <span class="text-[14px] font-medium">{{ ticket.point_down }}</span>
                    </div>
                </div>

                <!-- Ticket ID -->
                <div v-if="ticket.booked_status" class="flex">
                    <span class="ml-auto pr-1 text-[12px] font-medium text-gray-600">({{ ticket.id }})</span>
                </div>

                <!-- Customer note -->
                <div v-if="ticket.booked_status" class="px-1">
                    <span class="text-[14px] font-medium text-[#0072bc]">* {{ ticket.note }}</span>
                </div>

                <!-- Footer: Payment info -->
                <div class="mt-auto">
                    <div v-if="ticket.booked_status" class="px-1">
                        <div class="flex justify-between items-center text-[14px] font-medium text-gray-600">
                            <span>0/{{ formatCurrencyWithoutSymbol(ticket.total_price || 0) }}</span>
                            <span>{{ ticket.payment_method }}</span>
                        </div>
                        <div class="h-[5px] bg-[#0072bc] rounded-lg" />
                    </div>
                    <div v-if="ticket.booked_status" class="px-1">
                        <span class="text-[12px] font-medium text-gray-600">P: {{ ticket.user_name }} /{{
                            ticket.office_name
                        }}</span>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>