<script setup lang="ts">
import { ref } from 'vue';
import { listItemTrip, valueSelectedTrip } from '~/composables/trip/useTripGlobal';
import { ArrowUpBold, ArrowRightBold, Printer, Finished, Delete, Timer, Plus, More, RefreshRight, Setting } from '@element-plus/icons-vue';
import { format, formatDate } from 'date-fns';
import InputNote from '~/components/inputs/inputNote.vue';
import ChangeTimeTrip from '~/components/dialog/ChangeTimeTrip.vue';
import EditTripInformationDialog from '~/components/dialog/EditTripInformationDialog.vue';
import { useTicketList } from '~/composables/ticket/useTicketList';
import type { DTO_RQ_ChangeTimeTrip, TripItem } from '~/types/trip/trip.interface';
import { API_CancelTrip, API_ChangeTimeTrip, API_UpdateTripNote } from '~/api/booking-service/trip/bms_trip.api';
const showRouteInfo = ref(false);
const dialogEditTrip = ref(false);
const handleViewRoute = () => {
    // console.log('Xem lộ trình được click');
    showRouteInfo.value = !showRouteInfo.value;
}
const handleOpenDialogEditTrip = () => {
    dialogEditTrip.value = true;
}
const dialogChangeTimeTrip = ref(false);
const handleOpenDialogChangeTimeTrip = () => {
    dialogChangeTimeTrip.value = true;
}
const {
    fetchListTicketByTripId
} = useTicketList();
const handleReloadListTicket = async () => {
    console.log('Reload list ticket');
    await fetchListTicketByTripId(valueSelectedTrip.value as TripItem);
}
const formatVND = (value: number) => {
  if (value == null) return '0';
  return new Intl.NumberFormat('vi-VN', { style: 'decimal' }).format(value);
};
const handleUpdateNote = async (newNote: string) => {
    if (valueSelectedTrip.value) {
        const response = await API_UpdateTripNote(valueSelectedTrip.value.id || 0, newNote);
        if (response.success) {
            notifySuccess('Cập nhật ghi chú thành công.');
            valueSelectedTrip.value.note = newNote;
        } else {
            notifyError(response.message || 'Cập nhật ghi chú thất bại. Vui lòng thử lại.');
        }
    }
};
const loadingChangeTimeTrip = ref(false);
const handleUpdateTimeTrip = async (data: DTO_RQ_ChangeTimeTrip) => {
    try {
        loadingChangeTimeTrip.value = true;
        const response = await API_ChangeTimeTrip(data);
        if (response.success) {
            notifySuccess('Cập nhật giờ khởi hành thành công.');
            // Cập nhật lại thông tin chuyến trong valueSelectedTrip
            if (valueSelectedTrip.value) {
                valueSelectedTrip.value.start_time = data.start_time;
            }
        } else {
            notifyError(response.message || 'Cập nhật giờ khởi hành thất bại. Vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật giờ khởi hành:', error);
        notifyError('Đã xảy ra lỗi khi cập nhật giờ khởi hành. Vui lòng thử lại.');
    } finally {
        loadingChangeTimeTrip.value = false;
        dialogChangeTimeTrip.value = false;
    }
};
const handleCancelTrip = async () => {
  if (!valueSelectedTrip.value) return;

  try {
    // Hiển thị hộp xác nhận
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn hủy chuyến này không?`,
      'Xác nhận huỷ chuyến',
      {
        confirmButtonText: 'Huỷ',
        cancelButtonText: 'Đóng',
        type: 'warning',
      }
    );

    // Nếu người dùng nhấn "Huỷ", gọi API
    const response = await API_CancelTrip(valueSelectedTrip.value.id || 0);
    if (response.success) {
      notifySuccess('Hủy chuyến thành công.');
      // Cập nhật danh sách trips
      listItemTrip.value = listItemTrip.value.filter(
        trip => trip.id !== valueSelectedTrip.value?.id
      );
      valueSelectedTrip.value = null;
    } else {
      notifyError(response.message || 'Hủy chuyến thất bại. Vui lòng thử lại.');
    }
  } catch (error) {
    // Nếu người dùng nhấn "Đóng", sẽ vào catch, không làm gì cả
    if (error !== 'cancel') {
      console.error('Lỗi khi hủy chuyến:', error);
      notifyError('Đã xảy ra lỗi khi hủy chuyến. Vui lòng thử lại.');
    }
  }
};
</script>

<template>
    <section v-if="valueSelectedTrip">
        <!-- Trip Information Section -->
        <div class="bg-white px-2 rounded-lg shadow-md">
            <el-collapse>
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
                                <span class="font-medium text-[#0072bc] text-[14px]">{{ valueSelectedTrip.license_plate
                                    || ''
                                    }}</span>
                            </div>
                            <div>
                                <span class="font-medium text-black text-[14px]">Số điện thoại xe: </span>
                                <span class="font-medium text-[#0072bc] text-[14px]">{{ valueSelectedTrip.vehicle_phone
                                    }}</span>
                            </div>
                            <div>
                                <span class="font-medium text-black text-[14px]">Sơ đồ ghế: </span>
                                <span class="font-medium text-[#0072bc] text-[14px]">{{
                                    valueSelectedTrip.seat_chart_name }}</span>
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
                                <span class="font-medium text-[#0072bc] text-[14px]">{{ valueSelectedTrip.ticket_booked
                                    }}/{{
                                        valueSelectedTrip.total_seat }}</span>
                            </div>
                            <div>
                                <span class="font-medium text-black text-[14px]">Tiền vé: </span>
                                <span class="font-medium text-[#0072bc] text-[14px]">
                                    {{ formatVND(valueSelectedTrip.money_paid ?? 0) }}/{{
                                        formatVND(valueSelectedTrip.total_price ?? 0) }}
                                </span>

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
                        <!-- <el-button :icon="Finished">Xuất bến</el-button> -->
                        <el-button :icon="Delete" type="danger" plain @click="handleCancelTrip">Huỷ chuyến</el-button>
                        <el-button :icon="Timer" @click="handleOpenDialogChangeTimeTrip">Đổi giờ</el-button>
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
                        <el-button :icon="RefreshRight" type="info" @click="handleReloadListTicket" />
                        <el-button :icon="Setting" type="info" @click="handleOpenDialogEditTrip" />
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
    <EditTripInformationDialog v-model="dialogEditTrip" :trip="valueSelectedTrip" />
    <ChangeTimeTrip v-model="dialogChangeTimeTrip" :trip="valueSelectedTrip" :loading="loadingChangeTimeTrip" @updated="handleUpdateTimeTrip"/>
</template>