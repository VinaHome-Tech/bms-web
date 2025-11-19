<script setup lang="ts">
import { ref } from 'vue';
import { valueSelectedTrip } from '~/composables/trip/useTripGlobal';
import { ArrowUpBold, ArrowRightBold, Printer, Finished, Delete, Timer, Plus, More, RefreshRight, Setting } from '@element-plus/icons-vue';
import { format, formatDate } from 'date-fns';
import InputNote from '~/components/inputs/inputNote.vue';
import EditTripInformationDialog from '~/components/dialog/EditTripInformationDialog.vue';
import { useTicketList } from '~/composables/ticket/useTicketList';
import type { TripItem } from '~/types/trip/trip.interface';
const showRouteInfo = ref(false);
const dialogEditTrip = ref(false);
const handleViewRoute = () => {
    // console.log('Xem lộ trình được click');
    showRouteInfo.value = !showRouteInfo.value;
}
const handleOpenDialogEditTrip = () => {
    dialogEditTrip.value = true;
}
const {
       fetchListTicketByTripId 
} = useTicketList();
const handleReloadListTicket = async () => {
    console.log('Reload list ticket');
    await fetchListTicketByTripId(valueSelectedTrip.value as TripItem);
}
</script>

<template>
    <section v-if="valueSelectedTrip">
        <!-- Trip Information Section -->
        <div class="bg-white px-2 rounded-lg shadow-md">
            <el-collapse >
                <el-collapse-item name="1">
                    <template #title>
                        <span class="text-[16px] font-semibold text-black">
                            {{ valueSelectedTrip.start_time?.substring(0, 5) }} •
                            {{ formatDate(valueSelectedTrip.start_date as Date, 'dd/MM/yyyy') }} •
                            {{ valueSelectedTrip.route_name || 'Tuyến chưa xác định' }}
                        </span>
                    </template>
                    <template #icon="{ isActive }">
                        <span class="flex items-center justify-center gap-4">
                            <span class="flex items-center gap-1 text-[#0072bc] cursor-pointer hover:text-[#005a9a]"
                                @click.stop="handleViewRoute">
                                {{ showRouteInfo ? 'Ẩn lộ trình' : 'Xem lộ trình' }}
                                <el-icon>
                                    <component :is="showRouteInfo ? ArrowUpBold : ArrowRightBold" />
                                </el-icon>
                            </span>
                            <span class="flex items-center gap-1 text-[#0072bc]">
                                {{ isActive ? 'Thu gọn' : 'Xem thông tin chuyến' }}
                                <el-icon>
                                    <component :is="isActive ? ArrowUpBold : ArrowRightBold" />
                                </el-icon>
                            </span>
                        </span>
                    </template>
                    <el-row>
                        <el-col :span="8">
                            <div>
                                <span class="font-medium text-black text-[14px]">Biển số: </span>
                                <span class="font-medium text-[#0072bc] text-[14px]">{{ valueSelectedTrip.license_plate || ''
                                    }}</span>
                            </div>
                            <div>
                                <span class="font-medium text-black text-[14px]">Số điện thoại xe: </span>
                                <span class="font-medium text-[#0072bc] text-[14px]">{{ valueSelectedTrip.vehicle_phone }}</span>
                            </div>
                            <div>
                                <span class="font-medium text-black text-[14px]">Sơ đồ ghế: </span>
                                <span class="font-medium text-[#0072bc] text-[14px]">{{ valueSelectedTrip.seat_chart_name }}</span>
                            </div>
                            <div>
                                <span class="font-medium text-black text-[14px]">Khởi hành: </span>
                                <span class="font-medium text-[#0072bc] text-[14px]">{{
                                    valueSelectedTrip.start_time?.substring(0, 5) }} - {{
                                        format(new Date(valueSelectedTrip.start_date as Date), 'dd/MM/yyyy') }}</span>
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <div>
                                <span class="font-medium text-black text-[14px]">Tài xế: </span>
                                <span class="font-medium text-[#0072bc] text-[14px]">
                                    {{valueSelectedTrip.driver?.map(d => `${d.name} (${d.phone})`).join(', ')}}
                                </span>
                            </div>
                            <div>
                                <span class="font-medium text-black text-[14px]">Phụ xe: </span>
                                <span class="font-medium text-[#0072bc] text-[14px]">
                                    {{valueSelectedTrip.assistant?.map(a => `${a.name} (${a.phone})`).join(', ')}}
                                </span>
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <div>
                                <span class="font-medium text-black text-[14px]">Tổng vé: </span>
                                <span class="font-medium text-[#0072bc] text-[14px]">{{ valueSelectedTrip.ticket_booked }}/{{
                                    valueSelectedTrip.total_seat }}</span>
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

                    <!-- <div v-if="ticketsByOffice && hasLoadedTickets">
                        <span class="font-medium text-black text-[14px]">Đặt chỗ: </span>
                        <span class="font-medium text-[#0072bc] text-[14px]">{{ ticketsByOffice }}</span>
                    </div> -->

                </el-collapse-item>
            </el-collapse>

            <div class="py-2">
                <div class="flex justify-between items-center">
                    <div class="mb-2">
                        <el-button :icon="Printer">In phơi</el-button>
                        <el-button :icon="Finished">Xuất bến</el-button>
                        <el-button :icon="Delete" type="danger" plain>Huỷ chuyến</el-button>
                        <el-button :icon="Timer">Đổi giờ</el-button>
                        <el-button :icon="Plus" type="warning" plain>Thêm hàng</el-button>
                        <el-dropdown style="margin-left: 12px;">
                            <el-button>
                                <el-icon>
                                    <More />
                                </el-icon>
                            </el-button>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item>Lịch sử</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                    <div class="mb-2">
                        <el-button :icon="RefreshRight" type="info" @click="handleReloadListTicket"/>
                        <el-button :icon="Setting" type="info" @click="handleOpenDialogEditTrip"/>
                    </div>
                </div>
                <InputNote :note="valueSelectedTrip?.note" @update="handleUpdateNote" />
            </div>
        </div>

        <!-- Route Information Section - Hiển thị lộ trình ở dưới -->
        <!-- <RouteInfo :show="showRouteInfo" :route-id="valueSelectedRoute || undefined"
              :trip-time="selectedTrip.departure_time || ''" @close="showRouteInfo = false" /> -->

    </section>
    <section v-else>
        <div class="flex justify-center items-center h-full">
            <div class="text-center text-gray-500">
                <div class="text-4xl mb-2">🚌</div>
                <p class="text-lg font-medium">Chưa chọn chuyến</p>
                <p class="text-sm">Vui lòng chọn một chuyến để xem thông tin</p>
            </div>
        </div>
    </section>
    <EditTripInformationDialog v-model="dialogEditTrip" :trip="valueSelectedTrip"/>
</template>