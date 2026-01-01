<template>
  <div class="space-y-3">
    <!-- Loading -->
    <div v-if="props.loading" class="space-y-3">
      <div v-loading="props.loading" element-loading-text="Đang tải danh sách chuyến..." class="min-h-[150px]" />
    </div>

    <!-- Empty -->
    <div v-else-if="!trips || trips.length === 0" class="text-center py-8 text-gray-500">
      <div class="text-4xl mb-2">🚌</div>
      <p class="text-lg font-medium">Không có chuyến nào</p>
      <p class="text-sm">Vui lòng chọn ngày và tuyến khác</p>
    </div>

    <!-- Trip list -->
    <div v-else class="grid grid-cols-3 gap-1 sm:grid-cols-1 sm:gap-1">
      <div v-for="trip in sortedTrips" :key="trip.id"
        class="relative bg-white px-3 py-2 border-2 rounded-lg transition-shadow cursor-pointer" :class="[
          trip.id === props.selectedTripId
            ? 'border-[#0072bc] shadow-md'
            : 'border-gray-200 hover:shadow-md'
        ]" @click="handleTripClick(trip)">

        <!-- ================= 🚚 CHUYẾN CHỞ HÀNG ================= -->
        <template v-if="trip.trip_type === 2">
          <div class="flex justify-between items-center mb-1">
            <div class="font-semibold text-gray-700 text-sm">
              {{ trip.start_time?.substring(0, 5) }}
            </div>
            <span class="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
              Hàng
            </span>
          </div>

          <div class="text-xs text-gray-700 mt-1 truncate">
            {{ trip.route?.route_name || '—' }}
          </div>

          <div class="mt-1 flex justify-between items-center text-xs">
            <span class="truncate">
              {{
                Array.isArray(trip.driver)
                  ? trip.driver.map(d => d.name).join(', ')
                  : '—'
              }}
            </span>
            <span class="text-gray-500">
              {{ trip.vehicle?.license_plate || '' }}
            </span>
          </div>

          <div class="mt-1 text-[11px] text-gray-500 italic">
            Không áp dụng ghế
          </div>
        </template>

        <!-- ================= 🚌 CHUYẾN CHỞ KHÁCH ================= -->
        <template v-else>
          <!-- Đã xuất bến -->
          <div v-if="trip.confirmation_depart"
            class="absolute inset-0 bg-opacity-75 flex items-start justify-center z-10">
            <div class="border border-red-500 text-red-500 px-2 font-medium text-[12px] shadow-lg mt-2">
              ĐÃ XUẤT BẾN
            </div>
          </div>

          <!-- Giờ + số ghế -->
          <div class="flex justify-between items-start mb-1">
            <div class="font-semibold text-gray-700 text-sm">
              {{ trip.start_time?.substring(0, 5) }}
            </div>
            <div class="text-xs font-medium"
              :class="getBookingStatusClass(trip.ticket_booked ?? 0, trip.total_seat ?? 0)">
              {{ trip.ticket_booked ?? 0 }}/{{ trip.total_seat }}
            </div>
          </div>

          <!-- Thanh tỷ lệ -->
          <div class="fill-indicator mb-1" :class="getCapacityClass(trip.ticket_booked ?? 0, trip.total_seat ?? 0)"
            :style="{ width: getCapacityPercentage(trip.ticket_booked ?? 0, trip.total_seat ?? 0) + '%' }" />

          <!-- Trạng thái -->
          <div class="mt-1 flex justify-between items-center">
            <span v-if="(trip.ticket_booked ?? 0) >= (trip.total_seat ?? 0)"
              class="inline-block px-1.5 py-0.5 text-[11px] bg-red-100 text-red-800 rounded-full">
              Kín
            </span>
            <span v-else-if="trip.ticket_booked / trip.total_seat >= 0.8"
              class="inline-block px-1.5 py-0.5 text-[11px] bg-orange-100 text-orange-800 rounded-full">
              Sắp kín
            </span>
            <span v-else class="inline-block px-1.5 py-0.5 text-[11px] bg-green-100 text-green-800 rounded-full">
              Còn chỗ
            </span>

            <div class="text-[11px] bg-green-100 text-green-900 rounded-full px-1.5 py-0.5">
              {{ Math.round((trip.ticket_booked / trip.total_seat) * 100) }}%
            </div>
          </div>

          <!-- Tài xế + ghế -->
          <div class="mt-1 flex justify-between items-center text-xs">
            <span class="truncate">
              {{
                Array.isArray(trip.driver)
                  ? trip.driver.map(d => d.name).join(', ')
                  : ''
              }}
            </span>
            <span class="text-gray-500 truncate">
              {{ trip.seat_chart?.seat_chart_name || '' }}
            </span>
          </div>

          <!-- Phụ xe + biển số -->
          <div class="mt-1 flex justify-between items-center text-xs">
            <span class="truncate">
              {{
                Array.isArray(trip.assistant)
                  ? trip.assistant.map(a => a.name).join(', ')
                  : ''
              }}
            </span>
            <span class="text-gray-500">
              {{ trip.vehicle?.license_plate || '' }}
            </span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Trip } from '~/types/trip/trip.interface'

interface Props {
  loading?: boolean
  trips?: Trip[]
  selectedTripId?: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  tripSelected: [ trip: Trip ]
}>()

const sortedTrips = computed(() => {
  if (!props.trips) return []
  return [ ...props.trips ].sort((a, b) => {
    const timeA = a.start_time || '00:00'
    const timeB = b.start_time || '00:00'
    return timeA.localeCompare(timeB)
  })
})

const handleTripClick = (trip: Trip) => {
  emit('tripSelected', trip)
}

const getCapacityPercentage = (booked: number, capacity: number): number => {
  if (!capacity) return 0
  return Math.min((booked / capacity) * 100, 100)
}

const getCapacityClass = (booked: number, capacity: number): string => {
  if (!capacity) return 'capacity-low'
  const percentage = booked / capacity
  if (percentage >= 1) return 'capacity-full'
  if (percentage >= 0.8) return 'capacity-high'
  if (percentage >= 0.5) return 'capacity-medium'
  return 'capacity-low'
}

const getBookingStatusClass = (booked: number, capacity: number): string => {
  if (!capacity) return 'text-gray-500'
  const percentage = booked / capacity
  if (percentage >= 1) return 'text-red-600 font-semibold'
  if (percentage >= 0.8) return 'text-orange-600 font-medium'
  return 'text-green-600'
}
</script>

<style scoped>
.fill-indicator {
  height: 4px;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.capacity-low {
  background-color: #10b981;
}

.capacity-medium {
  background-color: #f59e0b;
}

.capacity-high {
  background-color: #ef4444;
}

.capacity-full {
  background-color: #6b7280;
}
</style>
