<template>
  <div class="space-y-3">
    <div v-if="props.loading" class="space-y-3">
      <div v-loading="props.loading" element-loading-text="Đang tải danh sách chuyến..." class="min-h-[150px]" />
    </div>

    <div v-else-if="!trips || trips.length === 0" class="text-center py-8 text-gray-500">
      <div class="text-4xl mb-2">🚌</div>
      <p class="text-lg font-medium">Không có chuyến nào</p>
      <p class="text-sm">Vui lòng chọn ngày và tuyến khác</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="trip in sortedTrips" :key="trip.trip_id"
        class="bg-white px-4 py-2 border-2 border-gray-200 rounded-lg  hover:shadow-md transition-shadow cursor-pointer"
        @click="handleTripClick(trip)">
        <div class="flex justify-between items-start mb-2">
          <div class="font-semibold text-gray-700 text-base">
            {{ trip.departure_time?.substring(0, 5) }}
          </div>
          <div class="text-sm font-medium" :class="getBookingStatusClass(trip.tickets_booked, trip.total_ticket)">
            {{ trip.tickets_booked }}/{{ trip.total_ticket }}
          </div>
        </div>
        <div class="fill-indicator mb-1" :class="getCapacityClass(trip.tickets_booked, trip.total_ticket)"
          :style="{ width: getCapacityPercentage(trip.tickets_booked, trip.total_ticket) + '%' }" />


        <div class="mt-1 flex justify-between items-center">
          <span v-if="trip.tickets_booked >= trip.total_ticket"
            class="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
            Đã kín chỗ
          </span>
          <span v-else-if="trip.tickets_booked / trip.total_ticket >= 0.8"
            class="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
            Sắp kín chỗ
          </span>
          <span v-else class="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
            Còn chỗ trống
          </span>

          <div class="text-xs bg-green-100 text-green-900 rounded-full px-2 py-1">
            Tỉ lệ: {{ Math.round((trip.tickets_booked / trip.total_ticket) * 100) }}%
          </div>
        </div>

        <div class="mt-1 flex justify-between items-center">
          <div class="font-semibold text-gray-800 text-sm">
            {{ Array.isArray(trip.driver) ? trip.driver.map(d => `${d.name}`).join(', ') : '' }}
          </div>
          <div class="text-xs text-gray-500">
            {{ trip.seat_chart_name || '' }}
          </div>
        </div>
        <div class="mt-1 flex justify-between items-center">
          <div class="font-semibold text-gray-800 text-sm">
            {{ Array.isArray(trip.assistant) ? trip.assistant.map(a => `${a.name}`).join(', ') : '' }}
          </div>
          <div class="text-xs text-gray-500">
            {{ trip.license_plate || '' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TripType } from '~/types/tripType'

interface Props {
  loading?: boolean;
  trips?: TripType[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  tripSelected: [trip: TripType]
}>()

// Computed property to sort trips by departure time
const sortedTrips = computed(() => {
  if (!props.trips) return []

  return [...props.trips].sort((a, b) => {
    // Convert time strings to comparable format
    const timeA = a.departure_time || '00:00'
    const timeB = b.departure_time || '00:00'
    return timeA.localeCompare(timeB)
  })
})

// Handle trip click
const handleTripClick = (trip: TripType) => {
  emit('tripSelected', trip)
}

const getCapacityPercentage = (booked: number, capacity: number): number => {
  return Math.min((booked / capacity) * 100, 100)
}

const getCapacityClass = (booked: number, capacity: number): string => {
  const percentage = booked / capacity
  if (percentage >= 1) return 'capacity-full'
  if (percentage >= 0.8) return 'capacity-high'
  if (percentage >= 0.5) return 'capacity-medium'
  return 'capacity-low'
}

const getBookingStatusClass = (booked: number, capacity: number): string => {
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

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: .5;
  }
}
</style>