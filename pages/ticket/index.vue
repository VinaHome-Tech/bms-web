<script setup lang="ts">
import Calendar from '~/components/widgets/Calendar.vue';
import {
  ArrowUpBold, ArrowRightBold, CloseBold, Delete, Rank, Edit, Printer, Plus, More, CopyDocument, Finished, Timer, RefreshRight, Setting, DocumentCopy
} from '@element-plus/icons-vue'
import type { CollapseModelValue, TabsPaneContext } from 'element-plus'
import TicketItem from '~/components/widgets/TicketItem.vue';
import InputNote from '~/components/inputs/inputNote.vue'
import TripList from '~/components/widgets/TripList.vue'
import TripInformation from '~/components/widgets/TripInformation.vue'
import { format } from 'date-fns';
import type { TripType } from '~/types/tripType';
import { useFirebase } from '~/composables/useFirebase';
import { get, update } from 'firebase/database';
import EditTicketDialog from '~/components/dialog/EditTicketDialog.vue';
import EditTripInformationDialog from '~/components/dialog/EditTripInformationDialog.vue';
import { useTripManagement } from '~/composables/useTripManagement';
import { useTicketManagement, queryRouteID, queryDate, queryTripID, queryTicketID } from '~/composables/useTicketManagement';
import { userStore } from '~/stores/useUserStore';
import { useOfficeStore } from '~/stores/officeStore';
import { useTripOperations } from '~/composables/useTripOperations';
import CustomerTable from '~/components/table/CustomerTable.vue';
import TransitUpTable from '~/components/table/TransitUpTable.vue';
import TransitDownTable from '~/components/table/TransitDownTable.vue';
import CargoTable from '~/components/table/CargoTable.vue';
import CargoDialog from '~/components/dialog/CargoDialog.vue';
import ChangeTimeTrip from '~/components/dialog/ChangeTimeTrip.vue';
definePageMeta({
  layout: 'default',
})


const {
  // tripList,
  // selectedTrip, 
  loadingListTrip,
  fetchListTripByRouteAndDate,
  dialogFormEditTripInformation,
  loadingFormEditTripInformation,
  handleOpenFormEditTripInformation,
  handleClosedDialogdialogFormEditTripInformation,
  handleUpdateTripInformation,

} = useTripManagement();

const {
  handleOpenCargoDialog,
  handleClosedDialogCargo,
  dialogFormCargo,
  isEditCargo,
  handleSaveCargo,
  cargoData,
  loadingCargoTable,
  loadingCargoSubmit,
} = useCargoManagement();

const {
  dialogChangeTimeTrip,
  loadingFormChangeTimeTrip,
  handleUpdateTimeTrip,
  handleOpenChangeTimeDialog,
  openMessageBoxDeleteTrip,
  openMessageBoxConfirmationDepart,
  printTicketListOfTheTrip,
  handleUpdateNote,
} = useTripOperations();


const { db, ref: dbRef, off } = useFirebase()

const useUserStore = userStore();
const officeStore = useOfficeStore();

const valueSelectedDate = ref<string | Date | undefined>(undefined);
function handleDateChange(date: Date) {
  console.log('Ngày được chọn:', date)
  valueSelectedDate.value = date;
  console.log('Ngày chọn:', valueSelectedDate.value);
  if (queryDate.value !== date) {
    queryDate.value = date;
  }
}


const activeNames = ref([ '1' ])
const activeTab = ref('1');
const elTabTicketPending = ref(false);
const showRouteInfo = ref(false);

const handleChange = (val: CollapseModelValue) => {
  console.log(val)
}

const handleViewRoute = () => {
  console.log('Xem lộ trình được click');
  showRouteInfo.value = !showRouteInfo.value;
}





const handleTripSelected = async (trip: TripType) => {
  console.log('Trip được chọn:', trip);
  selectedTrip.value = trip;
  activeTab.value = '';
  selectedTickets.value = [];
  elTabTicketPending.value = false;
}








const handleClickTabs = async (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
  console.log('Tab được click:', tab.props.name);
  if (tab.props.name === '1') {
    console.log('Sơ đồ ghế tab được chọn');
    console.log('Chuyến hiện tại:', selectedTrip.value);
    elTabTicketPending.value = true;
    if (selectedTrip.value?.trip_id) {
      // 1. Gọi API lấy danh sách vé
      await fetchListTicketByTrip(selectedTrip.value.trip_id);

      // ✅ SỬA: Chỉ xóa vé được chọn bởi user hiện tại
      const tripId = selectedTrip.value.trip_id;
      const currentUser = useUserStore.full_name;

      // Lấy danh sách vé đang được chọn
      const selectedTicketsSnapshot = await get(dbRef(db, `selectedTickets/${tripId}`));
      if (selectedTicketsSnapshot.exists()) {
        const selectedUpdates: Record<string, null> = {};
        Object.entries(selectedTicketsSnapshot.val()).forEach(([ ticketId, userName ]) => {
          // Chỉ xóa vé của user hiện tại
          if (userName === currentUser) {
            selectedUpdates[ `selectedTickets/${tripId}/${ticketId}` ] = null;
          }
        });

        if (Object.keys(selectedUpdates).length > 0) {
          await update(dbRef(db), selectedUpdates);
        }
      }

      // 2. Ép cập nhật lại selectedTickets từ Firebase
      setupRealtimeListener(selectedTrip.value.trip_id);
    }
  } else if (tab.props.name === '2') {
    console.log('Hành khách tab được chọn');
    elTabTicketPending.value = false;
    await fetchListCustomerByTrip();
  } else if (tab.props.name === '3') {
    console.log('Trung chuyển tab được chọn');
    elTabTicketPending.value = false;
    fetchListTransitUpByTrip();
    fetchListTransitDownByTrip();
  } else if (tab.props.name === '4') {
    elTabTicketPending.value = false;
    console.log('Hàng hóa tab được chọn');
  } else if (tab.props.name === '5') {
    elTabTicketPending.value = false;
    console.log('Thu chi chuyến tab được chọn');
  }
}

watch(selectedTrip, async (newTrip, oldTrip) => {
  if (oldTrip?.trip_id) {
    await cleanupTripData(oldTrip.trip_id);
  }

  if (newTrip?.trip_id) {
    setupRealtimeListener(newTrip.trip_id);
  }
});
const cleanupTripData = async (tripId: number) => {
  try {
    // 1. Hủy tất cả listeners
    off(dbRef(db, `selectedTickets/${tripId}`));
    off(dbRef(db, `tickets/${tripId}`));

    // 2. Xóa các vé đang chọn của user hiện tại
    const cleanupPromises: Promise<void>[] = [];

    // a. Xóa selectedTickets
    const selectedTicketsSnapshot = await get(dbRef(db, `selectedTickets/${tripId}`));
    if (selectedTicketsSnapshot.exists()) {
      const selectedUpdates: Record<string, null> = {};
      Object.entries(selectedTicketsSnapshot.val()).forEach(([ ticketId, userName ]) => {
        if (userName === useUserStore.full_name) {
          selectedUpdates[ `selectedTickets/${tripId}/${ticketId}` ] = null;
        }
      });

      if (Object.keys(selectedUpdates).length > 0) {
        cleanupPromises.push(update(dbRef(db), selectedUpdates));
      }
    }

    // b. Xóa tickets cũ (chỉ xóa những vé do user hiện tại cập nhật)
    const ticketsSnapshot = await get(dbRef(db, `tickets/${tripId}`));
    if (ticketsSnapshot.exists()) {
      const ticketUpdates: Record<string, null> = {};
      Object.entries(ticketsSnapshot.val()).forEach(([ ticketId, ticketData ]) => {
        const data = ticketData as { updatedBy?: string };
        if (data.updatedBy === useUserStore.full_name) {
          ticketUpdates[ `tickets/${tripId}/${ticketId}` ] = null;
        }
      });

      if (Object.keys(ticketUpdates).length > 0) {
        cleanupPromises.push(update(dbRef(db), ticketUpdates));
      }
    }

    await Promise.all(cleanupPromises);

    console.log(`✅ Đã dọn dẹp toàn bộ dữ liệu cho chuyến ${tripId}`);
  } catch (error) {
    console.error(`❌ Lỗi khi dọn dẹp chuyến ${tripId}:`, error);
    throw error;
  }
};







const isTicketUpdating = (ticketId: number) => {
  return updatingTicketIds.value.has(ticketId);
};



const handleReloadTicketList = () => {
  if (selectedTrip.value?.trip_id) {
    fetchListTicketByTrip(selectedTrip.value.trip_id);
  }
};





// Ản nút sao chép nếu danh sách vé được chọn có các vé khác số điện thoại nhau
const hasDifferentPhoneNumbers = computed(() => {
  const bookedTickets = mySelectedTickets.value.filter(t => t.booked_status === true);
  if (bookedTickets.length <= 1) {
    return false;
  }
  const phoneNumbers = bookedTickets
    .map(ticket => ticket.ticket_phone?.trim())
    .filter(phone => phone && phone !== '');
  const hasEmptyPhone = bookedTickets.some(ticket => !ticket.ticket_phone?.trim());
  const hasFilledPhone = bookedTickets.some(ticket => ticket.ticket_phone?.trim());
  if (hasEmptyPhone && hasFilledPhone) {
    return true;
  }
  const uniquePhoneNumbers = new Set(phoneNumbers);
  return uniquePhoneNumbers.size > 1;
});
const {
  routeNames,
  loadingListRouteName,
  valueSelectedRoute,
  fetchListRouteName,
  handleRouteChange,
  // ticketList,
  loadingListTicket,
  // selectedTickets,
  fetchListTicketByTrip,
  getFloorSeats,
  getAvailableFloors,
  setupRealtimeListener,
  isTicketSelected,
  clearAllSelectedTickets,
  handleTicketClick,
  getTicketSelector,

  // tripList,
  mySelectedTickets,
  dialogFormEditTicket,
  updatingTicketIds,
  handleOpenFormEditTicket,
  handleCancelTickets,
  handleUpdateTickets,
  isCopyTicket,
  // isMoveTicket,
  handleCopyTickets,
  handlePasteTickets,
  handleMoveTickets,
  cancelMoveTickets,
  handleUpdateContactStatus,
  fetchListCustomerByTrip,
  loadingTabCustomer,
  listCustomer,
  loadingTransitUp,
  loadingTransitDown,
  listTransitUp,
  listTransitDown,
  fetchListTransitUpByTrip,
  fetchListTransitDownByTrip,
  handlePrintTickets,

} = useTicketManagement();



watch([ valueSelectedDate, valueSelectedRoute ], ([ newDate, newRoute ], [ oldDate, oldRoute ]) => {
  console.log('Ngày:', oldDate, '=>', newDate);
  console.log('Tuyến:', oldRoute, '=>', newRoute);

  if (newDate && newRoute) {
    fetchListTripByRouteAndDate(newDate, newRoute as number, useUserStore.company_id ?? '');
    selectedTrip.value = null;
    if (!queryTripID.value) {
      selectedTrip.value = null;
    }
  }

  console.log("QUERY ROUTE ID:", queryRouteID.value);
  console.log("QUERY DATE:", queryDate.value);
  console.log("QUERY TRIP ID:", queryTripID.value);
  console.log("QUERY TICKET ID:", queryTicketID.value);
});

// ✅ THÊM: Watcher cho tripList - chạy sau khi có danh sách chuyến
watch(tripList, async (newTripList) => {
  console.log('🔍 tripList changed, length:', newTripList.length);
  console.log('🔍 queryTripID current:', queryTripID.value);

  // Nếu có queryTripID và tripList đã được load
  if (queryTripID.value && newTripList.length > 0) {
    const foundTrip = newTripList.find(trip => trip.trip_id === queryTripID.value);
    if (foundTrip) {
      console.log('✅ Đã tự động chọn chuyến sau khi load danh sách:', foundTrip);
      selectedTrip.value = foundTrip;
      activeTab.value = '1';
      await fetchListTicketByTrip(foundTrip.trip_id);
      if (queryTicketID.value) {
        const targetTicket = ticketList.value.find(ticket => ticket.id === queryTicketID.value);
        if (targetTicket) {
          console.log('✅ Đã tìm thấy vé cần chọn:', targetTicket);

          await handleTicketClick(targetTicket);

          console.log('✅ Đã tự động chọn vé:', targetTicket.id);
        } else {
          console.warn('⚠️ Không tìm thấy vé với ID:', queryTicketID.value);
        }
      }
    } else {
      console.warn('⚠️ Không tìm thấy chuyến với ID trong danh sách mới:', queryTripID.value);
    }
  }
});

// ✅ SỬA: Watcher duy nhất cho queryTripID
watch(queryTripID, async (newValue, oldValue) => {
  console.log('🔍 queryTripID changed:', oldValue, '=>', newValue);
  console.log('🔍 tripList current:', tripList.value);
  console.log('🔍 selectedTrip current:', selectedTrip.value);

  // ✅ Trường hợp 1: Chuyển chuyến mới
  if (newValue && newValue !== oldValue && tripList.value.length > 0) {
    const foundTrip = tripList.value.find(trip => trip.trip_id === newValue);
    if (foundTrip) {
      console.log('✅ Đã tìm thấy chuyến từ query (tripList có sẵn):', foundTrip);
      selectedTrip.value = foundTrip;
      activeTab.value = '1';

      // ✅ Clear vé đang chọn trước khi fetch tickets mới
      clearAllSelectedTickets();

      // ✅ Fetch tickets cho chuyến mới
      await fetchListTicketByTrip(foundTrip.trip_id);

      // ✅ Nếu có queryTicketID, tự động chọn vé
      if (queryTicketID.value) {
        const targetTicket = ticketList.value.find(ticket => ticket.id === queryTicketID.value);
        if (targetTicket) {
          console.log('✅ Đã tìm thấy vé cần chọn:', targetTicket);
          await handleTicketClick(targetTicket);
          console.log('✅ Đã tự động chọn vé:', targetTicket.id);
        } else {
          console.warn('⚠️ Không tìm thấy vé với ID:', queryTicketID.value);
        }
      }
    } else {
      console.warn('⚠️ Không tìm thấy chuyến với ID:', newValue);
    }
  }
  // ✅ Trường hợp 2: Cùng chuyến hiện tại, chỉ cần tìm vé
  else if (newValue && selectedTrip.value && selectedTrip.value.trip_id === newValue) {
    console.log('🔍 Cùng chuyến hiện tại, chỉ cần xử lý vé:', newValue);

    // ✅ QUAN TRỌNG: Luôn clear vé đang chọn trước
    clearAllSelectedTickets();

    // ✅ Nếu có queryTicketID, tự động chọn vé mới
    if (queryTicketID.value) {
      // Đảm bảo ticketList đã có dữ liệu
      if (ticketList.value.length === 0) {
        await fetchListTicketByTrip(selectedTrip.value.trip_id);
      }

      const targetTicket = ticketList.value.find(ticket => ticket.id === queryTicketID.value);
      if (targetTicket) {
        console.log('✅ Đã tìm thấy vé trong chuyến hiện tại:', targetTicket);
        await handleTicketClick(targetTicket);
        console.log('✅ Đã chọn vé mới trong cùng chuyến:', targetTicket.id);
      } else {
        console.warn('⚠️ Không tìm thấy vé với ID trong chuyến hiện tại:', queryTicketID.value);
      }
    } else {
      console.log('✅ Đã clear selection trong cùng chuyến');
    }
  }
  else if (newValue && tripList.value.length === 0) {
    console.log('⏳ queryTripID đã set, đang chờ tripList được load...');
  }
});

// ✅ SỬA: Watcher riêng cho queryTicketID để xử lý khi chỉ thay đổi vé
watch(queryTicketID, async (newValue, oldValue) => {
  console.log('🔍 queryTicketID changed:', oldValue, '=>', newValue);
  console.log('🔍 selectedTrip current:', selectedTrip.value);
  console.log('🔍 queryTripID current:', queryTripID.value);

  // ✅ Chỉ xử lý khi có chuyến đã chọn và queryTripID không thay đổi
  if (selectedTrip.value && queryTripID.value === selectedTrip.value.trip_id && newValue !== oldValue) {

    // ✅ QUAN TRỌNG: Luôn clear vé đang chọn trước
    clearAllSelectedTickets();

    if (newValue) {
      // Đảm bảo ticketList đã có dữ liệu
      if (ticketList.value.length === 0) {
        await fetchListTicketByTrip(selectedTrip.value.trip_id);
      }

      const targetTicket = ticketList.value.find(ticket => ticket.id === newValue);
      if (targetTicket) {
        console.log('✅ Tìm vé mới trong chuyến hiện tại:', targetTicket);
        await handleTicketClick(targetTicket);
        console.log('✅ Đã chọn vé mới:', targetTicket.id);
      } else {
        console.warn('⚠️ Không tìm thấy vé với ID:', newValue);
      }
    } else {
      console.log('✅ Đã clear selection do queryTicketID bị xóa');
    }
  }
});

watch(queryRouteID, (newValue) => {
  console.log('🔍 queryRouteID changed:', newValue);
  console.log('🔍 valueSelectedRoute current:', valueSelectedRoute.value);
  console.log('🔍 routeNames available:', routeNames.value.map(r => ({ id: r.id, name: r.route_name })));

  if (newValue) {
    const routeExists = routeNames.value.some(r => r.id === newValue);
    if (routeExists) {
      valueSelectedRoute.value = newValue;
      console.log('✅ Đã tự động chọn route:', newValue);
    } else {
      console.warn('⚠️ Route không tồn tại trong danh sách:', newValue);
    }
  }
});

watch(queryDate, (newValue) => {
  console.log('🔍 queryDate changed:', newValue);
  console.log('🔍 valueSelectedDate current:', valueSelectedDate.value);

  if (newValue) {
    valueSelectedDate.value = newValue;
    console.log('✅ Đã tự động chọn date:', newValue);
  }
});

// ✅ SỬA: Watcher để đồng bộ khi routeNames được load
watch(routeNames, (newRouteNames) => {
  // Nếu có queryRouteID và routeNames đã được load
  if (queryRouteID.value && newRouteNames.length > 0) {
    const routeExists = newRouteNames.some(r => r.id === queryRouteID.value);
    if (routeExists) {
      valueSelectedRoute.value = queryRouteID.value;
      console.log('✅ Đã set route sau khi load danh sách:', queryRouteID.value);
    }
  }
});



onMounted(async () => {
  await useUserStore.loadUserInfo();
  await officeStore.loadOfficeStore();
  fetchListRouteName(String(useUserStore.company_id ?? ''));

});

</script>

<template>
  <section>
    <el-container>
      <el-aside width="20%" class="">
        <div>
          <el-select v-model="queryRouteID!" :loading="loadingListRouteName" placeholder="Chọn tuyến"
            @change="(value) => { valueSelectedRoute = value; handleRouteChange(value); }">
            <el-option v-for="item in routeNames" :key="item.id" :label="item.route_name" :value="item.id" />
            <template #empty>
              <span v-if="loadingListRouteName">Đang tải danh sách tuyến...</span>
              <span v-else>Không có tuyến nào</span>
            </template>
          </el-select>
        </div>
        <div class="mt-2">
          <Calendar v-model="valueSelectedDate" @change="handleDateChange" />
        </div>

        <div class="mt-2">
          <TripList :loading="loadingListTrip" :trips="tripList" @trip-selected="handleTripSelected" />
        </div>

      </el-aside>
      <el-container>
        <el-header>
          <section v-if="selectedTrip">
            <!-- Trip Information Section -->
            <div class="bg-white px-2 rounded-lg shadow-md">
              <el-collapse v-model="activeNames" @change="handleChange">
                <el-collapse-item name="1">
                  <template #title>
                    <span class="text-[16px] font-semibold">
                      {{ selectedTrip.departure_time?.substring(0, 5) }} •
                      {{ format(new Date(valueSelectedDate as Date), 'dd/MM/yyyy') }} •
                      {{routeNames.find(r => r.id === valueSelectedRoute)?.route_name || 'Tuyến chưa xác định'}}
                    </span>
                  </template>
                  <template #icon="{ isActive }">
                    <span class="flex items-center justify-center gap-4">
                      <span class="flex items-center gap-1 text-[#0072bc] cursor-pointer hover:text-[#005a9a]" @click.stop="handleViewRoute">
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

                  <TripInformation :trip="selectedTrip" />
                  <div>
                    <span class="font-medium text-black text-[14px]">Đặt chỗ: </span>
                    <!-- <span class="font-medium text-[#0072bc] text-[14px]">VP An Sương(4), VP Tân Bình(5), Bến xe miền
                      đông(10)</span> -->
                  </div>

                </el-collapse-item>
              </el-collapse>

              <div class="py-2">
                <div class="flex justify-between items-center">
                  <div class="mb-2">
                    <el-button :icon="Printer" @click="printTicketListOfTheTrip">In phơi</el-button>
                    <el-button :icon="Finished" @click="openMessageBoxConfirmationDepart">Xuất bến</el-button>
                    <el-button :icon="Delete" type="danger" plain @click="openMessageBoxDeleteTrip">Huỷ
                      chuyến</el-button>
                    <el-button :icon="Timer" @click="handleOpenChangeTimeDialog">Đổi giờ</el-button>
                    <el-button :icon="Plus" type="warning" plain>Thêm hàng</el-button>
                    <el-dropdown style="margin-left: 12px;">
                      <el-button>
                        <el-icon><More /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item>Lịch sử</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>


                  </div>
                  <div class="mb-2">
                    <el-button :icon="RefreshRight" type="info" @click="handleReloadTicketList" />
                    <el-button :icon="Setting" type="info" @click="handleOpenFormEditTripInformation" />
                  </div>
                </div>
                <InputNote :note="selectedTrip?.note" @update="handleUpdateNote" />
              </div>
            </div>

            <!-- Route Information Section - Hiển thị lộ trình ở dưới -->
            <div v-if="showRouteInfo" class="bg-white px-2 rounded-lg shadow-md mt-2">
              <div class="py-3">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-[16px] font-semibold">Lộ trình</h3>
                  <el-button size="small" type="primary" plain @click="showRouteInfo = false">
                    <el-icon><CloseBold /></el-icon>
                    Đóng
                  </el-button>
                </div>
                
            
              </div>
            </div>


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

        </el-header>
        <el-main>
          <section v-if="selectedTrip" class="mt-1">
            <div class="bg-white px-2 rounded-lg shadow-md">
              <el-tabs v-model="activeTab" @tab-click="handleClickTabs">
                <el-tab-pane label="Sơ đồ ghế" name="1">
                  <div v-if="loadingListTicket" v-loading="loadingListTicket"
                    element-loading-text="Đang tải danh sách vé..."
                    class="text-center py-8 text-gray-500 min-h-[200px]" />
                  <div v-else>
                    <div class="mb-2">
                      <div class="flex flex-wrap gap-3 justify-center items-start">
                        <div v-for="floor in getAvailableFloors()" :key="`floor-${floor}`" class="flex-1 min-w-[300px]">
                          <div class="flex flex-col gap-1">
                            <div v-for="row in getFloorSeats(floor)" :key="`floor${floor}-row${row.rowNumber}`"
                              class="grid gap-1 w-full"
                              :style="{ gridTemplateColumns: `repeat(${row.seats.length}, 1fr)` }">
                              <TicketItem v-for="seat in row.seats" :key="seat.id" :ticket="seat"
                                :onClick="() => handleTicketClick(seat)" :isSelected="isTicketSelected(seat)"
                                :selectedBy="getTicketSelector(seat)" :isLoading="isTicketUpdating(seat.id)"
                                @update-contact-status="(status) => handleUpdateContactStatus(status)"
                                :is-move-ticket="isMoveTicket" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>


                    <div v-if="mySelectedTickets.length > 0">
                      <!-- Container chung cho cả hai div -->
                      <div class="fixed left-1/2 transform -translate-x-1/2 w-[90%] max-w-5xl z-50"
                        style="bottom: 8px;">

                        <!-- Div trên - Di chuyển vé -->
                        <div v-if="isMoveTicket"
                          class="absolute -top-[70px] left-0 bg-white border border-gray-300 shadow-lg transition-all duration-300 rounded-xl min-w-[300px] max-w-[600px]">
                          <!-- Header với close button -->
                          <div
                            class="flex items-center justify-between px-4 py-1 bg-blue-50 rounded-t-xl border-b border-gray-200">
                            <div class="flex items-center gap-2">
                              <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span class="text-sm font-semibold text-gray-700">Di chuyển vé</span>
                              <span class="text-xs text-gray-500">({{ mySelectedTickets.length }} vé)</span>
                            </div>
                            <el-icon @click="cancelMoveTickets"
                              class="cursor-pointer hover:text-red-500 hover:bg-red-50 p-1 rounded transition-all">
                              <CloseBold />
                            </el-icon>
                          </div>

                          <!-- Selected tickets -->
                          <div class="px-4 py-2">
                            <div class="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                              <el-tag v-for="ticket in mySelectedTickets" :key="ticket.id" type="warning" effect="dark"
                                size="small" class="animate-fade-in">
                                <span class="text-sm font-medium">{{ ticket.seat_name }}</span>
                              </el-tag>
                            </div>
                          </div>
                        </div>

                        <!-- Div dưới - Thanh công cụ chính -->
                        <div
                          class="bg-white border border-gray-300 shadow-md transition-transform duration-300 rounded-xl">
                          <div class="flex items-stretch justify-between gap-4 h-full">
                            <div
                              class="bg-gray-100 px-4 py-2 rounded-l-xl text-sm font-medium text-gray-700 flex items-center justify-center flex-shrink-0">
                              <div class="flex items-center gap-x-2">
                                <el-icon @click="clearAllSelectedTickets(); cancelMoveTickets();"
                                  class="cursor-pointer hover:text-red-500 transition">
                                  <CloseBold />
                                </el-icon>
                                <span class="text-[16px]">
                                  Số vé đang chọn:
                                  <span class="text-[#FF9900]">{{ mySelectedTickets.length }}</span>
                                </span>
                              </div>
                            </div>

                            <div
                              class="px-4 py-3 text-sm text-blue-800 flex-1 flex flex-wrap gap-2 items-center rounded-none overflow-hidden">
                              <el-tag v-for="ticket in mySelectedTickets" :key="ticket.id" type="warning" effect="dark">
                                <span class="text-[15px]">{{ ticket.seat_name }}</span>
                              </el-tag>
                            </div>
                            <div
                              class="bg-purple-50 px-4 py-2 rounded-r-xl flex gap-2 items-center justify-center flex-shrink-0">
                              <div v-if="isCopyTicket">
                                <el-tooltip v-if="mySelectedTickets.filter(t => t.booked_status === false).length > 0"
                                  content="Dán vé" placement="top">
                                  <el-button type="success" :icon="DocumentCopy" circle @click="handlePasteTickets" />
                                </el-tooltip>
                              </div>
                              <div>
                                <el-tooltip content="Cập nhật thông tin vé" placement="top">
                                  <el-button type="warning" :icon="Edit" circle @click="handleOpenFormEditTicket" />
                                </el-tooltip>
                              </div>
                              <div
                                v-if="mySelectedTickets.filter(t => t.booked_status === true).length > 0 && !hasDifferentPhoneNumbers">
                                <el-tooltip content="Sao chép vé" placement="top">
                                  <el-button color="#626aef" :icon="CopyDocument" circle @click="handleCopyTickets" />
                                </el-tooltip>
                              </div>
                              <div v-if="mySelectedTickets.filter(t => t.booked_status === true).length > 0">
                                <el-tooltip content="Di chuyển vé" placement="top">
                                  <el-button type="primary" :icon="Rank" circle @click="handleMoveTickets" />
                                </el-tooltip>
                              </div>
                              <div v-if="mySelectedTickets.filter(t => t.booked_status === true).length > 0">
                                <el-tooltip content="Hủy vé" placement="top">
                                  <el-button type="danger" :icon="Delete" circle
                                    @click="handleCancelTickets({ id: mySelectedTickets.filter(t => t.booked_status === true).map(t => t.id) })" />
                                </el-tooltip>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="Hành khách" name="2">
                  <CustomerTable :data="listCustomer" :loading="loadingTabCustomer" />
                </el-tab-pane>
                <el-tab-pane label="Trung chuyển" name="3">
                  <div class="pb-2">
                    <TransitUpTable :data="listTransitUp" :loading="loadingTransitUp" />
                    <TransitDownTable :data="listTransitDown" :loading="loadingTransitDown" />
                  </div>
                </el-tab-pane>
                <el-tab-pane label="Hàng hóa" name="4">
                  <div class="py-2" style="text-align: right;">
                    <el-button type="warning" :icon="Plus" plain @click="handleOpenCargoDialog">Thêm hàng
                      mới</el-button>
                    <el-button type="primary" :icon="Printer" plain>In danh sách</el-button>
                  </div>
                  <CargoTable />
                  <CargoDialog v-model="dialogFormCargo" @closed="handleClosedDialogCargo" :is-edit="isEditCargo"
                    @save="handleSaveCargo" />
                </el-tab-pane>
                <el-tab-pane label="Thu chi chuyến" name="5">Thu chi chuyến</el-tab-pane>
              </el-tabs>
            </div>
            <div class="bg-white px-2 rounded-lg mt-1" v-if="elTabTicketPending">
              <el-tabs>
                <el-tab-pane label="Chờ xử lý" name="1">

                </el-tab-pane>
                <el-tab-pane label="Vé hủy" name="2">

                </el-tab-pane>
              </el-tabs>
            </div>
          </section>
        </el-main>
      </el-container>
    </el-container>
    <EditTicketDialog v-model="dialogFormEditTicket" :selected-tickets="mySelectedTickets"
      @closed="clearAllSelectedTickets" @update-tickets="handleUpdateTickets" @cancel-tickets="handleCancelTickets"
      @print="handlePrintTickets" />

    <EditTripInformationDialog v-model="dialogFormEditTripInformation" :trip="selectedTrip"
      :is-updating="loadingFormEditTripInformation" @updated="handleUpdateTripInformation"
      @closed="handleClosedDialogdialogFormEditTripInformation" />

    <ChangeTimeTrip v-model="dialogChangeTimeTrip" :trip="selectedTrip" :is-updating="loadingFormChangeTimeTrip"
      @updated="handleUpdateTimeTrip" />
  </section>

</template>
<style scoped>
.el-header {
  padding: 0px;
  margin-left: 0.25rem;
}

.el-main {
  padding: 0px;
  margin-left: 0.25rem;
}

.icon-ele {
  margin: 0 8px 0 auto;
  color: #409eff;
}

.el-header {
  height: auto !important;
}

.el-collapse {
  border-top: none !important;
}
</style>