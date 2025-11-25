<template>
  <div class="bg-white border border-gray-300 shadow-md transition-transform duration-300 rounded-xl">
    <div class="flex items-stretch justify-between gap-4 h-full">
      <!-- Left section - Selected count -->
      <div class="bg-gray-100 px-4 py-2 rounded-l-xl text-sm font-medium text-gray-700 flex items-center justify-center flex-shrink-0">
        <div class="flex items-center gap-x-2">
          <el-icon 
            class="cursor-pointer hover:text-red-500 transition"
            @click="handleClearAll"
          >
            <CloseBold />
          </el-icon>
          <span class="text-[16px]">
            Số vé đang chọn:
            <span class="text-[#FF9900]">{{ selectedTickets.length }}</span>
          </span>
        </div>
      </div>

      <!-- Middle section - Selected tickets -->
      <div class="px-4 py-3 text-sm text-blue-800 flex-1 flex flex-wrap gap-2 items-center rounded-none overflow-hidden">
        <el-tag 
          v-for="ticket in selectedTickets" 
          :key="ticket.id" 
          type="warning" 
          effect="dark"
        >
          <span class="text-[15px]">{{ ticket.seat_name }}</span>
        </el-tag>
      </div>

      <!-- Right section - Action buttons -->
      <div class="bg-purple-50 px-4 py-2 rounded-r-xl flex gap-2 items-center justify-center flex-shrink-0">
        <!-- Paste button -->
        <div v-if="isCopyTicket">
          <el-tooltip 
            v-if="selectedTickets.filter(t => t.booked_status === false).length > 0"
            content="Dán vé" 
            placement="top"
          >
            <el-button 
              type="success" 
              :icon="CopyDocument" 
              circle 
              @click="$emit('paste')" 
            />
          </el-tooltip>
        </div>

        <!-- Edit button -->
        <div>
          <el-tooltip content="Cập nhật thông tin vé" placement="top">
            <el-button 
              type="warning" 
              :icon="Edit" 
              circle 
              @click="$emit('edit')" 
            />
          </el-tooltip>
        </div>

        <!-- Copy button -->
        <div v-if="bookedTicketsCount > 0 && !hasDifferentPhoneNumbers">
          <el-tooltip content="Sao chép vé" placement="top">
            <el-button 
              color="#626aef" 
              :icon="CopyDocument" 
              circle 
              @click="$emit('copy')" 
            />
          </el-tooltip>
        </div>

        <!-- Move button -->
        <div v-if="bookedTicketsCount > 0">
          <el-tooltip content="Di chuyển vé" placement="top">
            <el-button 
              type="primary" 
              :icon="Rank" 
              circle 
              @click="$emit('move')" 
            />
          </el-tooltip>
        </div>

        <!-- Cancel button -->
        <div v-if="bookedTicketsCount > 0">
          <el-tooltip content="Hủy vé" placement="top">
            <el-button 
              type="danger" 
              :icon="Delete" 
              circle 
              @click="handleCancelTickets" 
            />
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CloseBold, Delete, Edit, CopyDocument, Rank } from '@element-plus/icons-vue';
import type { TicketItem } from '~/types/ticket/ticket.interface';

interface Props {
  selectedTickets: TicketItem[];
  isCopyTicket: boolean;
  hasDifferentPhoneNumbers: boolean;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  clearAll: [];
  paste: [];
  edit: [];
  copy: [];
  move: [];
  cancel: [ticketIds: { id: number[] }];
}>();

// Computed
const bookedTicketsCount = computed(() => 
  props.selectedTickets.filter(t => t.booked_status === true).length
);

// Methods
const handleClearAll = () => {
  emit('clearAll');
};

const handleCancelTickets = () => {
  const bookedTicketIds = props.selectedTickets
    .filter(t => t.booked_status === true)
    .map(t => t.id);
  
  // emit('cancel', { id: bookedTicketIds  });
};
</script>