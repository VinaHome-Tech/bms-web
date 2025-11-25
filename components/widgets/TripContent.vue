<script setup lang="ts">
import type { TabsPaneContext } from 'element-plus'
import { valueSelectedTrip } from '~/composables/trip/useTripGlobal'
import TripTabCustomers from '../tabs/TripTabCustomers.vue'
import TripTabFinance from '../tabs/TripTabFinance.vue'
import TripTabSeats from '../tabs/TripTabSeats.vue'
import TripTabTransit from '../tabs/TripTabTransit.vue'
import TripTabCargo from '../tabs/TripTabCargo.vue'
import { useTicketList, listItemTicket } from '~/composables/ticket/useTicketList'
import type { TripItem } from '~/types/trip/trip.interface'
const {
    loadingListTicket,
    fetchListTicketByTripId
} = useTicketList()
const activeName = ref('1')
watch(
    () => valueSelectedTrip.value,
    async (newTrip) => {
        if (newTrip) {
            // Luôn tải lại tickets khi trip được chọn thay đổi
            await fetchListTicketByTripId(newTrip as TripItem)
        }
    },
    { immediate: true }
)
const handleClick = async (tab: TabsPaneContext, event: Event) => {
    console.log(tab, event)
    if (tab.props.name === '1') {
        await fetchListTicketByTripId(valueSelectedTrip.value as TripItem)
    } else if (tab.props.name === '2') {

    } else if (tab.props.name === '3') {

    } else if (tab.props.name === '4') {

    } else if (tab.props.name === '5') {

    }
}
</script>
<template>
    <section v-if="valueSelectedTrip" class="bg-white px-2 rounded-lg shadow-md mt-2">
        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
            <el-tab-pane label="Sơ đồ ghế" name="1">
                <TripTabSeats :tickets="listItemTicket" :loading="loadingListTicket"/>
            </el-tab-pane>

            <el-tab-pane label="Hành khách" name="2">
                <TripTabCustomers :trip="valueSelectedTrip" />
            </el-tab-pane>

            <el-tab-pane label="Trung chuyển" name="3">
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