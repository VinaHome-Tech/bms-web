// components/layout/trip/SidebarFilter.vue
<script setup lang="ts">
import Calendar from '~/components/widgets/Calendar.vue'
import TripList from '~/components/trip/TripList.vue'
import { useRouteList } from '~/composables/route/useRouteList'
import { useTripList } from '~/composables/trip/useTripList'
import { useRouteActions } from '~/composables/route/useRouteActions'
import {
  routeNameList,
  valueSelectedDate,
  valueSelectedRoute
} from '~/composables/route/useRouteGlobal'
import { valueSelectedTrip, listTrip } from '~/composables/trip/useTripGlobal'
import type { Trip } from '~/types/trip/trip.interface'
const useUserStore = userStore();
const { loadingRouteName, fetchListRouteName } = useRouteList()
const { loadingListItemTrip, fetchListTripByRouteAndDate } = useTripList()
const { handleChangeRoute } = useRouteActions()
const handleDateChange = (date: Date) => {
  valueSelectedDate.value = date
}

const handleClickItemTrip = (trip: Trip) => {
  valueSelectedTrip.value = trip
}
watch([ valueSelectedDate, valueSelectedRoute ], async ([ newDate, newRoute ]) => {
  if (newDate && newRoute) {
    await fetchListTripByRouteAndDate(useUserStore.company_id ?? '', newRoute as string, newDate);
    valueSelectedTrip.value = null;
  }
});
onMounted(async () => {
  await fetchListRouteName(useUserStore.company_id || "")
  const savedRoute = localStorage.getItem('selectedRoute')
  if (savedRoute) {
    valueSelectedRoute.value = savedRoute
  }
})
</script>

<template>
  <el-aside>
    <!-- Route Selection -->
    <div>
      <el-select v-model="valueSelectedRoute" :loading="loadingRouteName" placeholder="Chọn tuyến"
        @change="handleChangeRoute">
        <el-option v-for="item in routeNameList" :key="item.id" :label="item.route_name" :value="item.id" />
        <template #empty>
          <span v-if="loadingRouteName">Đang tải danh sách tuyến...</span>
          <span v-else>Không có tuyến nào</span>
        </template>
      </el-select>
    </div>

    <!-- Date Selection -->
    <div class="mt-2">
      <Calendar v-model="valueSelectedDate" @change="handleDateChange" />
    </div>

    <!-- Trip List -->
    <div class="mt-2">
      <TripList 
        :loading="loadingListItemTrip" 
        :trips="listTrip" 
        :selected-trip-id="valueSelectedTrip?.id"
        @trip-selected="handleClickItemTrip" 
      />
    </div>
  </el-aside>
</template>

<style scoped>
.el-aside {
  overflow-y: auto;
}
</style>