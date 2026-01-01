<script setup lang="ts">
import { ref } from 'vue';
import { listTrip, valueSelectedTrip } from '~/composables/trip/useTripGlobal';
import { ArrowUpBold, ArrowRightBold, Printer, Finished, Delete, Timer, Plus, More, RefreshRight, Setting } from '@element-plus/icons-vue';
import { format, formatDate } from 'date-fns';
import InputNote from '~/components/inputs/inputNote.vue';
import ChangeTimeTrip from '~/components/dialog/ChangeTimeTrip.vue';

import { useTicketList } from '~/composables/ticket/useTicketList';
import type { DTO_RQ_ChangeTimeTrip, Trip } from '~/types/trip/trip.interface';
import { API_CancelTrip, API_ChangeTimeTrip, API_UpdateTripNote } from '~/services/booking-service/trip/bms-trip.api';
import { listItemTicket } from '~/composables/ticket/useTicketGlobal';
import { useTripActions } from '~/composables/trip/useTripActions';
import DialogEditTripInfo from './dialog/DialogEditTripInfo.vue';
import { licensePlateList } from '~/composables/vehicle/useVehicleGlobal';
import { assistantList, driverList } from '~/composables/account/useAccountGlobal';
import { useVehicleList } from '~/composables/vehicle/useVehicleList';
import { useAccountList } from '~/composables/account/useAccountList';
const useUserStore = userStore();
const {
    loadingLicensePlate,
    fetchLicensePlateVehicle
} = useVehicleList();
const {
    loadingDriver,
    loadingAssistant,
    fetchListDriver,
    fetchListAssistant
} = useAccountList();
const {
    handleSubmitUpdateTripInfo,
    loadingSubmitUpdateTripInfo,
    dialogEditTripInfo,
    handleOpenDialogEditTrip,
    handleCloseDialogEditTripInfo
} = useTripActions();
const showRouteInfo = ref(false);
const handleViewRoute = () => {
    // console.log('Xem lộ trình được click');
    showRouteInfo.value = !showRouteInfo.value;
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
    await fetchListTicketByTripId(valueSelectedTrip.value as Trip);
}
const formatVND = (value: number) => {
    if (value == null) return '0';
    return new Intl.NumberFormat('vi-VN', { style: 'decimal' }).format(value);
};
const handleUpdateNote = async (newNote: string) => {
    if (valueSelectedTrip.value) {
        const response = await API_UpdateTripNote(valueSelectedTrip.value.id, newNote);
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
        const response = await API_CancelTrip(valueSelectedTrip.value.id);
        if (response.success) {
            notifySuccess('Hủy chuyến thành công.');
            // Cập nhật danh sách trips
            listTrip.value = listTrip.value.filter(
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


const handlePrintListSeatInTrip = () => {
    const trip = valueSelectedTrip.value;
    const tickets = listItemTicket.value;

    if (!trip || tickets.length === 0) {
        return notifyError("Không có dữ liệu để in sơ đồ ghế.");
    }

    // ======= Gom vé theo tầng =======
    const grouped = new Map();
    tickets.forEach(t => {
        const floor = t.seat_floor ?? 1;
        if (!grouped.has(floor)) grouped.set(floor, []);
        grouped.get(floor)!.push(t);
    });

    // ======= Hàm dựng sơ đồ theo row/column =======
    const buildSeatGrid = (seatList: any[]) => {
        if (!seatList || seatList.length === 0) return "";

        const maxRow = Math.max(...seatList.map(s => s.seat_row ?? 1));
        const maxCol = Math.max(...seatList.map(s => s.seat_column ?? 1));

        let html = `<table style="width: 100%; border-collapse: collapse; margin: 15px 0; table-layout: fixed;">`;

        for (let r = 1; r <= maxRow; r++) {
            html += `<tr>`;
            for (let c = 1; c <= maxCol; c++) {
                const seat = seatList.find(s => s.seat_row === r && s.seat_column === c);
                const isBooked = seat?.booked_status;
                const cellStyle = isBooked
                    ? "background-color: #d4edda; color: #155724;"
                    : "background-color: #f8f9fa;";

                const seatInfo = seat ? `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <div style="font-weight: bold; font-size: 14px; text-align: left;">${seat.seat_name}</div>
            ${seat.phone ? `<span style="font-size: 14px; text-align: right;">${seat.phone}</span>` : ""}
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-start; width: 100%;">
            ${seat.name ? `<div style="font-size: 12px; margin-bottom: 2px;">${seat.name}</div>` : ""}
            ${seat.point_up ? `<div style="font-size: 12px; margin-bottom: 2px;">↑ ${seat.point_up}</div>` : ""}
            ${seat.point_down ? `<div style="font-size: 12px; margin-bottom: 2px;">↓ ${seat.point_down}</div>` : ""}
            ${seat.note ? `<div style="font-size: 12px; margin-bottom: 2px; font-style: italic;">${seat.note}</div>` : ""}
            ${isBooked ? `
              <div style="display: flex; justify-content: space-between; width: 100%; margin-top: 4px; padding-top: 4px;">
                <div style="font-size: 11px;">
                  <span>${seat.money_paid ?? 0}</span>
                  <span>/</span>
                  <span>${seat.total_price ?? 0}</span>
                </div>
                <div style="font-size: 11px; font-weight: bold;">${seat.payment_method || ""}</div>
              </div>
            ` : ""}
          </div>
        ` : "";

                html += `<td style="${cellStyle} padding: 10px 8px; border: 1px solid #ddd; vertical-align: top; text-align: left; height: auto; word-wrap: break-word;">${seatInfo}</td>`;
            }
            html += `</tr>`;
        }

        html += `</table>`;
        return html;
    };

    // ======= Render toàn bộ tầng =======
    let fullSeatHTML = "";
    [ ...grouped.entries() ]
        .sort((a, b) => a[ 0 ] - b[ 0 ])
        .forEach(([ floor, seatList ]) => {
            fullSeatHTML += `
        <div style="page-break-inside: avoid; margin-bottom: 40px;">
          <h3 style="margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 5px;">Tầng ${floor}</h3>
          ${buildSeatGrid(seatList)}
        </div>
      `;
        });

    // ======= Template A4 =======
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>In sơ đồ ghế</title>
      <style>
        * { margin: 0; padding: 0; }
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          margin: 0;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #000;
          padding-bottom: 15px;
        }
        .header h2 {
          margin: 10px 0 5px 0;
          font-size: 20px;
        }
        .header p {
          margin: 5px 0;
          font-size: 14px;
        }
        .legend {
          margin-top: 20px;
          font-size: 12px;
        }
        @media print {
          body { padding: 10px; margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>${trip.route_name || "N/A"}</h2>
        <p><strong>Ngày:</strong> ${trip.start_date || "N/A"}</p>
        <p><strong>Giờ:</strong> ${trip.start_time || "N/A"}</p>
        <p><strong>Xe:</strong> ${trip.license_plate || "N/A"}</p>
      </div>
      ${fullSeatHTML}
      <div class="legend">
        <p><span style="background-color: #d4edda; padding: 2px 8px; border: 1px solid #ddd;">Ghế đã đặt</span></p>
      </div>
    </body>
    </html>
  `;

    // ======= Tạo iframe để in =======
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();

        iframe.onload = () => {
            setTimeout(() => {
                iframe.contentWindow?.print();
                document.body.removeChild(iframe);
            }, 250);
        };
    }
};

watch(dialogEditTripInfo, async (open) => {
  if (!open) return

  await Promise.all([
    fetchLicensePlateVehicle(useUserStore.company_id ?? ''),
    fetchListDriver(useUserStore.company_id ?? ''),
    fetchListAssistant(useUserStore.company_id ?? '')
  ])
})

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
                            {{ valueSelectedTrip.route?.route_name || 'Tuyến chưa xác định' }}
                            
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
                                <span class="font-medium text-[#0072bc] text-[14px]">{{ valueSelectedTrip.vehicle?.license_plate
                                    || ''
                                }}</span>
                            </div>
                            <div>
                                <span class="font-medium text-black text-[14px]">Số điện thoại xe: </span>
                                <span class="font-medium text-[#0072bc] text-[14px]">{{ valueSelectedTrip.vehicle?.phone
                                }}</span>
                            </div>
                            <div>
                                <span class="font-medium text-black text-[14px]">Sơ đồ ghế: </span>
                                <span class="font-medium text-[#0072bc] text-[14px]">{{
                                    valueSelectedTrip.seat_chart?.seat_chart_name }}</span>
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
                        <el-button :icon="Printer" @click="handlePrintListSeatInTrip">In phơi</el-button>
                        <el-button :icon="Finished">Xuất bến</el-button>
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
    <DialogEditTripInfo 
        v-model="dialogEditTripInfo" 
        :trip="valueSelectedTrip" 
        :loading="loadingSubmitUpdateTripInfo"

        :vehicles="licensePlateList" 
        :loading-vehicles="loadingLicensePlate" 

        :drivers="driverList"
        :loading-drivers="loadingDriver"

        :assistants="assistantList"
        :loading-assistants="loadingAssistant"

        @save="handleSubmitUpdateTripInfo"
        @closed="handleCloseDialogEditTripInfo"
    />
    <ChangeTimeTrip v-model="dialogChangeTimeTrip" :trip="valueSelectedTrip" :loading="loadingChangeTimeTrip"
        @updated="handleUpdateTimeTrip" />
</template>