<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref } from 'vue'
import {
  Menu,
  Search,
  User,
  TrendCharts,
  Bell,
  Setting,
  Tools,
  SwitchButton,
  Ticket,
  HomeFilled,
  Finished,
  Lock,
  DataAnalysis,
  Postcard,
  Service,
  Operation,
} from '@element-plus/icons-vue'
import IconZalo from '~/assets/icon/static/icon-zalo.png'
import IconPhone from '~/assets/icon/static/icon-phone.png'
import IconDesk from '~/assets/icon/static/icon-desk.png'
import IconSend from '~/assets/icon/static/icon-send.png'
import type { Component } from 'vue'
import { querySearchTickets } from '~/api/ticketAPI';
import type { DTO_RP_SearchTicket } from '~/types/ticketType';
import { formatDate } from '~/lib/formatDate';
import { formatCurrency } from '~/lib/formatCurrency';
import ChangePasswordDialog from '../dialog/ChangePasswordDialog.vue';
import SendCommentDialog from '../dialog/SendCommentDialog.vue';

const Icons: Record<string, Component> = {
  Menu,
  Search,
  User,
  TrendCharts,
  Bell,
  Setting,
  Tools,
  SwitchButton,
  Ticket,
  HomeFilled,
  Finished,
  Lock,
  DataAnalysis,
  Operation,
};
const { handleQueryTicket } = useTicketManagement();
// const { handleLogout } = useLogout();
const { handleManualLogout } = useAuth();

const useUserStore = userStore();
const officeStore = useOfficeStore();


const notifications = ref([
  { id: 1, text: "Người dùng mới đăng ký", time: "2 phút trước", type: "user" },
  { id: 2, text: "Cảnh báo bảo mật", time: "5 phút trước", type: "warning" },
  { id: 3, text: "Backup hoàn thành", time: "10 phút trước", type: "success" }
])


const handleNotificationCommand = (command: number) => {
  console.log('Notification clicked:', command)
}

const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      console.log('Go to profile')
      break
    case 'settings':
      console.log('Go to settings')
      break
    case 'system':
      console.log('Go to system management')
      break
    case 'logout':
      console.log('Logout')
      break
  }
}

const getNotificationDotClass = (type: string) => {
  const baseClass = 'w-2 h-2 rounded-full mt-2 '
  switch (type) {
    case 'warning':
      return baseClass + 'bg-yellow-500'
    case 'success':
      return baseClass + 'bg-green-500'
    default:
      return baseClass + 'bg-blue-500'
  }
}

const menuItems = [
  {
    type: 'item',
    label: 'Tổng quan',
    index: '1',
    icon: 'HomeFilled',
    to: '/dashboard',
  },
  {
    type: 'item',
    label: 'Đặt vé',
    index: '2',
    icon: 'Ticket',
    to: '/ticket',
  },
  {
    type: 'submenu',
    label: 'Khai báo',
    index: '3',
    icon: 'Finished',
    children: [
      { label: 'Văn phòng', index: '3-1', to: '/declare/office' },
      { label: 'Phương tiện', index: '3-2', to: '/declare/vehicle' },
      { label: 'Tuyến', index: '3-3', to: '/declare/route' },
      { label: 'Nhân viên', index: '3-5', to: '/declare/account' },
      { label: 'Đại lý', index: '3-6', to: '/declare/agent' },
      { label: 'Lịch chạy', index: '3-7', to: '/declare/schedule' },
      { label: 'Mã giảm giá', index: '3-8', to: '/declare/discount' },
      { label: 'Sơ đồ ghế', index: '13-9', to: '/declare/seat' },

    ],
  },
  {
    type: 'submenu',
    label: 'Báo cáo',
    index: '4',
    icon: 'DataAnalysis',
    children: [
      { label: 'Báo cáo vé', index: '14-1', to: '/report/ticket' },
      { label: 'Báo cáo hàng', index: '14-2', to: '/report/cargo' },


    ],
  },
  {
    type: 'submenu',
    label: 'Cấu hình',
    index: '5',
    icon: 'Operation',
    children: [
      { label: 'Giá vé', index: '14-1', to: '/config/fare' },
      { label: 'Thời gian', index: '14-2', to: '/config/point-time' },

    ],
  },

];

const searchQuery = ref('')

let debounceTimeout: ReturnType<typeof setTimeout> | null = null

const groupTicketsByPhoneAndTrip = (tickets: DTO_RP_SearchTicket[]) => {
  const grouped = new Map<string, DTO_RP_SearchTicket>()

  tickets.forEach(ticket => {
    const key = `${ticket.ticket_phone}_${ticket.trip_id}`

    if (grouped.has(key)) {
      const existingTicket = grouped.get(key)!

      // ✅ Gộp seat_name
      if (existingTicket.seat_name && ticket.seat_name) {
        const existingSeats = existingTicket.seat_name.split(', ')
        const newSeats = ticket.seat_name.split(', ')
        const allSeats = [ ...new Set([ ...existingSeats, ...newSeats ]) ]
        existingTicket.seat_name = allSeats.join(', ')
      } else if (ticket.seat_name) {
        existingTicket.seat_name = ticket.seat_name
      }

      // ✅ Cộng dồn giá tiền
      existingTicket.ticket_display_price = (existingTicket.ticket_display_price || 0) + (ticket.ticket_display_price || 0)

    } else {
      // ✅ Giữ nguyên ticket đầu tiên (để lấy ID)
      grouped.set(key, { ...ticket })
    }
  })

  return Array.from(grouped.values())
}

// ✅ THÊM: Helper function để format seat display
const formatSeatDisplay = (seatName: string) => {
  if (!seatName) return ''

  const seats = seatName.split(', ')

  if (seats.length === 1) {
    return `Ghế ${seats[ 0 ]}`
  } else if (seats.length <= 3) {
    return `Ghế ${seats.join(', ')}`
  } else {
    return `Ghế ${seats.slice(0, 2).join(', ')} +${seats.length - 2}`
  }
}

const querySearch = (queryString: string, callback: (results: DTO_RP_SearchTicket[]) => void) => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }

  debounceTimeout = setTimeout(async () => {
    if (!queryString.trim()) {
      callback([])
      return
    }

    if (queryString.trim().length < 3) {
      callback([])
      return
    }

    try {
      console.log('Searching for:', queryString)

      const response = await querySearchTickets(queryString, String(useUserStore.company_id ?? ''))
      console.log('Search results:', response)

      // ✅ THÊM: Gộp các vé có cùng phone và trip_id
      const groupedResults = groupTicketsByPhoneAndTrip(response.result || [])

      callback(groupedResults)

    } catch (error) {
      console.error('Lỗi tìm kiếm vé:', error)
      ElMessage.error('Không thể tìm kiếm vé. Vui lòng thử lại sau.')
      callback([])
    }
  }, 800)
}

// const cleanup = () => {
//   if (debounceTimeout) {
//     clearTimeout(debounceTimeout)
//     debounceTimeout = null
//   }
// }

const handleSelectTicket = (item: Record<string, any>): void => {
  const ticket = item as DTO_RP_SearchTicket;
  handleQueryTicket(ticket);
}


// Handle menu navigation với force refresh
const handleMenuItemClick = async (routePath: string | undefined) => {
  if (!routePath) return
  
  
  try {
    const route = useRoute()
    
    // Kiểm tra nếu đã ở trang hiện tại
    if (route.path === routePath) {
      // Force refresh trang hiện tại
      await nextTick()
      window.location.reload()
      return
    }
    
    // Navigate đến trang mới với force refresh
    await navigateTo(routePath, { 
      replace: false,
      external: false 
    })
    
    // Đảm bảo trang được refresh sau khi navigate
    await nextTick()
  } catch (error) {
    console.error('Navigation error:', error)
    // Fallback: sử dụng window.location
    window.location.href = routePath
  }
}
const {
  dialogFormChangePassword,
  loadingChangePassword,
  handleOpenChangePasswordDialog,
  handleClosedChangePasswordDialog,
  handleSaveChangePasswordDialog
} = useAccountManagement();
const dialogFormSendComment = ref(false)
onMounted(async () => {
  await useUserStore.loadUserInfo();
  await officeStore.loadOfficeStore();
});
</script>
<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-300 px-6 py-1 flex items-center justify-between">
    <div class="flex items-center space-x-4">


      <el-dropdown trigger="click">
        <div class="flex items-center space-x-3 rounded-lg transition-colors cursor-pointer">
          <el-button :icon="Icons.Menu" circle />
        </div>

        <template #dropdown>
          <el-menu :default-active="$route.path" unique-opened class="el-menu-vertical-demo">
            <template v-for="item in menuItems" :key="item.index">
              <!-- item thường -->
              <el-menu-item v-if="item.type === 'item'" :index="item.to" @click="handleMenuItemClick(item.to)">
                <el-icon>
                  <component :is="Icons[ item.icon as string ]" />
                </el-icon>
                <span class="text-base">{{ item.label }}</span>
              </el-menu-item>

              <!-- submenu -->
              <el-sub-menu v-else-if="item.type === 'submenu'" :index="item.index">
                <template #title>
                  <el-icon>
                    <component :is="Icons[ item.icon as string ]" />
                  </el-icon>
                  <span class="text-base">{{ item.label }}</span>
                </template>

                <el-menu-item v-for="child in item.children" :key="child.index" :index="child.to" @click="handleMenuItemClick(child.to)">
                  <span class="text-base">{{ child.label }}</span>
                </el-menu-item>
              </el-sub-menu>
            </template>
          </el-menu>
        </template>
      </el-dropdown>


      <div class="flex items-center space-x-3">
        <ClientOnly>
          <div class="flex flex-col">
            <span class="text-lg font-semibold text-black">{{ useUserStore.company_name || '' }}</span>
            <span class="w-fit text-xs text-black bg-green-300 px-2 py-0.5 rounded">
              {{ officeStore.name || '' }}
            </span>
          </div>
          <template #fallback>
            <div class="flex flex-col">
              <span class="text-lg font-semibold text-black" />
              <span class="w-fit text-xs text-black bg-green-300 px-2 py-0.5 rounded" />
            </div>
          </template>
        </ClientOnly>
      </div>



    </div>

    <!-- Center Section - Search -->
    <div class="flex-1 max-w-md mx-4 hidden sm:block ">
      <el-autocomplete v-model="searchQuery" :fetch-suggestions="querySearch" placeholder="Tìm kiếm theo số điện thoại"
        size="large" class="w-full custom-autocomplete" :trigger-on-focus="false" :debounce="900"
        @select="handleSelectTicket" popper-class="custom-autocomplete-popper">
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>

        <template #default="{ item }">
          <div
            class="flex items-center justify-between hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
            <div class="flex-1 min-w-0 py-1">

              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span class="text-sm font-medium text-green-600">
                  {{ item.ticket_phone }}
                </span>
                <span v-if="item.ticket_customer_name">-</span>
                <span class="text-sm font-medium text-gray-500">
                  {{ item.ticket_customer_name }}
                </span>
              </div>

              <div class="flex items-center space-x-2 py-[1px]">
                <svg class="w-4 h-4 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-gray-700 truncate">{{ item.route_name }}</span>

                <!-- ✅ SỬA: Hiển thị nhiều ghế -->
                <span v-if="item.seat_name"
                  class="inline-flex items-center px-2 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-xs font-medium shadow-sm">
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  <!-- ✅ Hiển thị nhiều ghế, format đẹp -->
                  {{ formatSeatDisplay(item.seat_name) }}
                </span>
              </div>

              <div class="flex items-center mt-1">
                <div
                  class="flex items-center space-x-1 px-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <svg class="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-sm font-semibold text-green-700">
                    {{ item.departure_time ? item.departure_time.split(':').slice(0, 2).join(':') : '' }}
                  </span>
                  <span>-</span>
                  <span class="text-sm font-semibold text-green-700">
                    {{ formatDate(item.departure_date) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex-shrink-0 ml-4">
              <div class="flex flex-col items-center space-y-1">
                <div
                  class="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors duration-200">
                  <svg class="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-200"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div>
                  <span class="text-sm font-medium text-red-600 whitespace-nowrap">
                    {{ formatCurrency(item.ticket_display_price) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </el-autocomplete>
    </div>

    <!-- Right Section -->
    <div class="flex items-center space-x-3">


      <!-- Notifications -->
      <el-dropdown @command="handleNotificationCommand" trigger="click">
        <el-button link class="p-2 relative">
          <el-icon>
            <Bell />
          </el-icon>
          <el-badge :value="notifications.length" class="absolute -top-1">
          </el-badge>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu class="w-80">
            <div class="p-4 border-b border-gray-200">
              <h3 class="text-sm font-semibold text-gray-900">Thông báo</h3>
            </div>
            <div class="max-h-64 overflow-y-auto">
              <el-dropdown-item v-for="notification in notifications" :key="notification.id" :command="notification.id"
                class="p-4 hover:bg-gray-50">
                <div class="flex items-start space-x-3">
                  <div :class="getNotificationDotClass(notification.type)"></div>
                  <div class="flex-1">
                    <p class="text-sm text-gray-900">{{ notification.text }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ notification.time }}</p>
                  </div>
                </div>
              </el-dropdown-item>
            </div>
            <div class="p-3 border-t border-gray-200">
              <el-button link class="text-indigo-600 hover:text-indigo-700">
                Xem tất cả thông báo
              </el-button>
            </div>
          </el-dropdown-menu>
        </template>
      </el-dropdown>




      <div class="group relative inline-block">
        <span
          class="flex items-center justify-center w-10 h-10 cursor-pointer bg-gray-100 rounded-lg transition-colors duration-200">
          <el-icon class="text-gray-600 hover:text-gray-800">
            <Service />
          </el-icon>
        </span>

        <div class="absolute left-0 top-full w-full h-2 invisible group-hover:visible"></div>

        <div
          class="absolute left-0 top-full mt-2 hidden group-hover:block bg-white shadow-lg rounded-lg border border-gray-200 py-1 min-w-[190px] z-10">
          <div class="flex flex-col">
            <div class="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150">
              <img :src="IconZalo" alt="Zalo" class="w-6 h-6 mr-1" />
              <span class="text-sm text-gray-700">Hỗ trợ qua Zalo</span>
            </div>
            <a href="tel:0877717575"
              class="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150">
              <img :src="IconPhone" alt="Phone" class="w-6 h-6 mr-1" />
              <span class="text-sm text-gray-700">
                Hotline hỗ trợ kỹ thuật: <br />0877 71 7575
              </span>
            </a>

            <a href="https://remotedesktop.google.com/support" target="_blank"
              class="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150">
              <img :src="IconDesk" alt="Desk" class="w-6 h-6 mr-1" />
              <span class="text-sm text-gray-700">Điều khiển từ xa</span>
            </a>

            <div class="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-150" @click="dialogFormSendComment = true">
              <img :src="IconSend" alt="Send" class="w-6 h-6 mr-1" />
              <span class="text-sm text-gray-700">Gửi ý kiến đóng góp</span>
            </div>
          </div>
        </div>
      </div>




      <!-- User Menu -->
      <el-dropdown @command="handleUserCommand" trigger="click">
        <div
          class="flex items-center space-x-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
          <el-avatar :size="32" class="bg-gradient-to-r from-indigo-500 to-purple-500">
            <el-icon>
              <User />
            </el-icon>
          </el-avatar>
          <div class="hidden md:block text-left">
            <ClientOnly>
              <div class="text-sm font-medium text-black">{{ useUserStore.full_name || '' }}</div>
              <div class="text-xs text-gray-900">{{ useUserStore.username || '' }}</div>
              <template #fallback>
                <div class="text-sm font-medium text-black" />
                <div class="text-xs text-gray-900" />
              </template>
            </ClientOnly>
          </div>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <div class="px-4 py-3 border-b border-gray-200">
              <div class="flex items-center space-x-3">
                <el-avatar :size="40" class="bg-gradient-to-r from-indigo-500 to-purple-500">
                  <el-icon>
                    <User />
                  </el-icon>
                </el-avatar>
                <div>
                  <ClientOnly>
                    <div class="text-sm font-medium text-gray-900">{{ useUserStore.full_name || '' }}</div>
                    <div class="text-xs text-gray-500">{{ useUserStore.role || '' }}</div>
                    <template #fallback>
                      <div class="text-sm font-medium text-gray-900" />
                      <div class="text-xs text-gray-500" />
                    </template>
                  </ClientOnly>
                </div>
              </div>
            </div>

            <el-dropdown-item command="settings" @click="navigateTo('/account-setting')">
              <el-icon>
                <Setting />
              </el-icon>
              <span class="ml-2">Cài đặt tài khoản</span>
            </el-dropdown-item>

            <el-dropdown-item command="settings" @click="navigateTo('/account-setting')">
              <el-icon>
                <Postcard />
              </el-icon>
              <span class="ml-2">Cài đặt hiển thị</span>
            </el-dropdown-item>

            <el-dropdown-item command="system" @click="handleOpenChangePasswordDialog">
              <el-icon>
                <Lock />
              </el-icon>
              <span class="ml-2">Đổi mật khẩu</span>
            </el-dropdown-item>

            <el-dropdown-item divided command="logout" class="text-red-600" @click="handleManualLogout">
              <el-icon>
                <SwitchButton />
              </el-icon>
              <span class="ml-2">Đăng xuất</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <ChangePasswordDialog v-model="dialogFormChangePassword" :loading="loadingChangePassword"
      @closed="handleClosedChangePasswordDialog" @save="handleSaveChangePasswordDialog" />

    <SendCommentDialog v-model="dialogFormSendComment" />
  </header>
</template>



<style scoped>
/* Custom styles nếu cần */
.el-dropdown-menu {
  min-width: 200px;
}

.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>