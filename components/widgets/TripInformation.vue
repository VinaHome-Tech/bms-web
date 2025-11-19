<script setup lang="ts">
import { format, formatDate } from 'date-fns';
import { formatCurrencyWithoutSymbol } from '~/lib/formatCurrency';
import type { TripItem } from '~/types/trip/trip.interface';

interface Props {
  trip: TripItem;
}

defineProps<Props>();
</script>

<template>
  <el-row>
    <el-col :span="8">
      <div>
        <span class="font-medium text-black text-[14px]">Biển số: </span>
        <span class="font-medium text-[#0072bc] text-[14px]">{{ trip.license_plate || '' }}</span>
      </div>
      <div>
        <span class="font-medium text-black text-[14px]">Số điện thoại xe: </span>
        <span class="font-medium text-[#0072bc] text-[14px]">{{ trip.vehicle_phone }}</span>
      </div>
      <div>
        <span class="font-medium text-black text-[14px]">Sơ đồ ghế: </span>
        <span class="font-medium text-[#0072bc] text-[14px]">{{ trip.seat_chart_name }}</span>
      </div>
      <div>
        <span class="font-medium text-black text-[14px]">Khởi hành: </span>
        <span class="font-medium text-[#0072bc] text-[14px]">{{
          trip.start_time?.substring(0, 5)  }} - {{
          format(new Date(trip.start_date as Date), 'dd/MM/yyyy') }}</span>
      </div>
    </el-col>
    <el-col :span="8">
      <div>
        <span class="font-medium text-black text-[14px]">Tài xế: </span>
        <span class="font-medium text-[#0072bc] text-[14px]">
          {{ trip.driver?.map(d => `${d.name} (${d.phone})`).join(', ') }}
        </span>
      </div>
      <div>
        <span class="font-medium text-black text-[14px]">Phụ xe: </span>
        <span class="font-medium text-[#0072bc] text-[14px]">
          {{ trip.assistant?.map(a => `${a.name} (${a.phone})`).join(', ') }}
        </span>
      </div>
    </el-col>
    <el-col :span="8">
      <div>
        <span class="font-medium text-black text-[14px]">Tổng vé: </span>
        <span class="font-medium text-[#0072bc] text-[14px]">{{ trip.ticket_booked }}/{{
          trip.total_seat }}</span>
      </div>
      <div>
        <span class="font-medium text-black text-[14px]">Tiền vé: </span>
        <!-- <span class="font-medium text-[#0072bc] text-[14px]">0/{{
          formatCurrencyWithoutSymbol(trip.total_tickets_price ?? 0) }}</span> -->
      </div>
      <div>
        <span class="font-medium text-black text-[14px]">Số hàng: </span>
        <span class="font-medium text-[#0072bc] text-[14px]">13</span>
      </div>
      <div>
        <span class="font-medium text-black text-[14px]">Tiền hàng: </span>
        <span class="font-medium text-[#0072bc] text-[14px]">7.000.000</span>
      </div>
    </el-col>
  </el-row>
</template>

