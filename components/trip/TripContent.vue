<script setup lang="ts">
import type { TabsPaneContext } from 'element-plus'
import { valueSelectedTrip } from '~/composables/trip/useTripGlobal'
import TripTabCustomers from '../trip/tabs/TripTabCustomers.vue'
import TripTabFinance from '../trip/tabs/TripTabFinance.vue'
import TripTabSeats from '../trip/tabs/TripTabSeats.vue'
import TripTabTransit from '../trip/tabs/TripTabTransit.vue'
import TripTabCargo from '../trip/tabs/TripTabCargo.vue'
import { useTicketList } from '~/composables/ticket/useTicketList'
import type { Trip } from '~/types/trip/trip.interface'
import { listTicket } from '~/composables/ticket/useTicketGlobal'
const {
    loadingListTicket,
    fetchListTicketByTripId
} = useTicketList()
const activeName = ref('1')
watch(
  () => valueSelectedTrip.value?.id,
  async (tripId, oldTripId) => {
    if (!tripId || tripId === oldTripId) return

    if (valueSelectedTrip.value?.trip_type === 2) {
      activeName.value = '4'
    } else {
      await fetchListTicketByTripId(valueSelectedTrip.value as Trip)
      activeName.value = '1'
    }
  },
  { immediate: true }
)

const handleClick = async (tab: TabsPaneContext, event: Event) => {
    console.log(tab, event)
    if (tab.props.name === '1') {
        await fetchListTicketByTripId(valueSelectedTrip.value as Trip)
    } else if (tab.props.name === '2') {
        console.log('Hành khách tab clicked')
    } else if (tab.props.name === '3') {
        console.log('Trung chuyển tab clicked')
    } else if (tab.props.name === '4') {
        console.log('Hàng hoá tab clicked')
    } else if (tab.props.name === '5') {
        console.log('Thu chi chuyến tab clicked')
    }
}
</script>
<template>
    <section v-if="valueSelectedTrip" class="bg-white px-2 rounded-lg shadow-md mt-2">
        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
            <el-tab-pane v-if="valueSelectedTrip.trip_type != 2" label="Sơ đồ ghế" name="1" >
                <TripTabSeats v-if="valueSelectedTrip.trip_type != 2" :tickets="listTicket" :loading="loadingListTicket"/>
            </el-tab-pane>

            <el-tab-pane v-if="valueSelectedTrip.trip_type != 2" label="Hành khách" name="2">
                <TripTabCustomers :trip="valueSelectedTrip" />
            </el-tab-pane>

            <el-tab-pane v-if="valueSelectedTrip.trip_type != 2" label="Trung chuyển" name="3">
                <TripTabTransit :trip="valueSelectedTrip" />
            </el-tab-pane>

            <el-tab-pane label="Hàng hoá" name="4">
                <TripTabCargo :trip="valueSelectedTrip" />
            </el-tab-pane>

            <el-tab-pane label="Thu chi chuyến" name="5">
                <TripTabFinance :trip="valueSelectedTrip" />
            </el-tab-pane>
        </el-tabs>
    </section>
</template>