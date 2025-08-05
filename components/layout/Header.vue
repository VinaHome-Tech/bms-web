<script setup lang="ts">
import { ref } from 'vue'
// Import các icon từ @element-plus/icons-vue
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
  Finished
} from '@element-plus/icons-vue'

import type { Component } from 'vue'
import { useLogout } from "@/composables/useLogout";
import { querySearchTickets } from '~/api/ticketAPI';
const { handleLogout } = useLogout();
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
  Finished
};

const useUserStore = userStore();
const officeStore = useOfficeStore();
// Reactive data
// const searchQuery = ref('')


const notifications = ref([
  { id: 1, text: "Người dùng mới đăng ký", time: "2 phút trước", type: "user" },
  { id: 2, text: "Cảnh báo bảo mật", time: "5 phút trước", type: "warning" },
  { id: 3, text: "Backup hoàn thành", time: "10 phút trước", type: "success" }
])


const openSettings = () => {
  // Logic mở settings
  console.log('Open settings')
}

const handleNotificationCommand = (command: number) => {
  // Xử lý click notification
  console.log('Notification clicked:', command)
}

const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      // Navigate to profile
      console.log('Go to profile')
      break
    case 'settings':
      // Navigate to settings
      console.log('Go to settings')
      break
    case 'system':
      // Navigate to system management
      console.log('Go to system management')
      break
    case 'logout':
      // Logout logic
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
    index: '11',
    icon: 'HomeFilled',
    to: '/dashboard',
  },
  {
    type: 'item',
    label: 'Đặt vé',
    index: '12',
    icon: 'Ticket',
    to: '/ticket',
  },
  {
    type: 'submenu',
    label: 'Khai báo',
    index: '13',
    icon: 'Finished',
    children: [
      { label: 'Văn phòng', index: '13-1', to: '/declare/office' },
      { label: 'Phương tiện', index: '13-2', to: '/declare/vehicle' },
      { label: 'Tuyến', index: '13-3', to: '/declare/route' },
      { label: 'Điểm dừng', index: '13-4', to: '/declare/point' },
      { label: 'Nhân viên', index: '13-5', to: '/declare/employee' },
      { label: 'Đại lý', index: '13-6', to: '/declare/agent' },
      { label: 'Lịch chạy', index: '13-7', to: '/declare/schedule' },
      { label: 'Mã giảm giá', index: '13-8', to: '/declare/discount' },
      { label: 'Sơ đồ ghế', index: '13-9', to: '/declare/seat' },

    ],
  },
];

// const logout = async () => {
//   try {
//     await useUserStore.resetUserInfo();
//     await officeStore.resetOfficeStore();
//     await companyStore.resetCompanyStore();
//     ElNotification({
//       message: h('p', { style: 'color: teal' }, 'Đăng xuất thành công!'),
//       type: 'success',
//     })
//     navigateTo('/');
//   } catch (error) {
//     console.error('Logout failed:', error);
//     ElNotification({
//       message: h('p', { style: 'color: red' }, 'Đăng xuất không thành công!'),
//       type: 'error',
//     })
//   }
// }
const searchQuery = ref('')
const searchResults = ref([])

let debounceTimeout: ReturnType<typeof setTimeout> | null = null

const querySearch = (queryString: string, callback: (results: any[]) => void) => {
  // Clear previous timeout
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  
  debounceTimeout = setTimeout(async () => {
    if (!queryString.trim()) {
      callback([])
      return
    }
    
    if (queryString.trim().length < 4) {
      callback([])
      return
    }
    
    try {
      console.log('Searching for:', queryString)
      
      const response = await querySearchTickets(queryString, useUserStore.company_id ?? '')
      console.log('Search results:', response)
      

      
    } catch (error) {
      console.error('Lỗi tìm kiếm vé:', error)
      ElMessage.error('Không thể tìm kiếm vé. Vui lòng thử lại sau.')
      callback([])
    }
  }, 800)
}
const cleanup = () => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
    debounceTimeout = null
  }
}

const handleSelect = (item) => {
  console.log('Selected item:', item)
 
}
onMounted(async () => {
  await useUserStore.loadUserInfo();
  await officeStore.loadOfficeStore();
});
</script>
<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-300 px-6 py-1 flex items-center justify-between">
    <div class="flex items-center space-x-4">


      <el-dropdown @command="handleUserCommand" trigger="click">
        <div class="flex items-center space-x-3 rounded-lg transition-colors cursor-pointer">
          <el-button :icon="Menu" circle />
        </div>
        <template #dropdown>
          <el-menu default-active="2" class="el-menu-vertical-demo">
            <template v-for="item in menuItems" :key="item.index">
              <NuxtLink v-if="item.type === 'item'" :to="item.to" exact>
                <el-menu-item :index="item.index">
                  <el-icon>
                    <component :is="Icons[item.icon as string]" />
                  </el-icon>
                  <span class="text-base">{{ item.label }}</span>
                </el-menu-item>
              </NuxtLink>

              <el-sub-menu v-else-if="item.type === 'submenu'" :index="item.index">
                <template #title>
                  <el-icon>
                    <component :is="Icons[item.icon as string]" />
                  </el-icon>
                  <span class="text-base">{{ item.label }}</span>
                </template>

                <NuxtLink v-for="child in item.children" :key="child.index" :to="child.to" exact>
                  <el-menu-item :index="child.index">
                    <span class="text-base">{{ child.label }}</span>
                  </el-menu-item>
                </NuxtLink>
              </el-sub-menu>
            </template>
          </el-menu>
        </template>
      </el-dropdown>


      <div class="flex items-center space-x-3">
        <div class="flex flex-col">
          <span class="text-lg font-semibold text-black">{{ useUserStore.company_name }}</span>
          <span class="w-fit text-xs text-black bg-green-300 px-2 py-0.5 rounded">
            {{ officeStore.name }}
          </span>

        </div>

      </div>



    </div>

    <!-- Center Section - Search -->
    <div class="flex-1 max-w-md mx-4 hidden sm:block ">
      <el-autocomplete
      v-model="searchQuery"
      :fetch-suggestions="querySearch"
      placeholder="Tìm kiếm theo số điện thoại"
      size="large"
      class="w-full custom-autocomplete"
      :trigger-on-focus="false"
      :debounce="300"
      @select="handleSelect"
      popper-class="custom-autocomplete-popper"
    >
      <template #prefix>
        <el-icon>
          <Search />
        </el-icon>
      </template>
      
      <template #default="{ item }">
        <div class="flex items-center space-x-3 py-2 px-1 hover:bg-blue-50 rounded-lg transition-colors duration-150 group">
          <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
            {{ item.name.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {{ item.name }}
            </div>
            <div class="text-sm text-blue-600 font-medium mt-0.5">
              {{ item.phone }}
            </div>
            <div class="text-xs text-gray-500 mt-1 flex items-center">
              <svg class="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
              <span class="truncate">{{ item.address }}</span>
            </div>
          </div>
          <div class="flex-shrink-0">
            <svg class="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </template>
    </el-autocomplete>
    </div>

    <!-- Right Section -->
    <div class="flex items-center space-x-3">
      <!-- Quick Stats -->
      <div class="hidden lg:flex items-center space-x-4 text-sm">
        <div class="flex items-center space-x-1 text-gray-600">
          <el-icon>
            <User />
          </el-icon>
          <span>1,234</span>
        </div>
        <div class="flex items-center space-x-1 text-gray-600">
          <el-icon>
            <TrendCharts />
          </el-icon>
          <span>89%</span>
        </div>
      </div>

      <!-- Notifications -->
      <el-dropdown @command="handleNotificationCommand" trigger="click">
        <el-button type="text" class="p-2 relative">
          <el-icon>
            <Bell />
          </el-icon>
          <el-badge :value="notifications.length" class="absolute -top-1 -right-1">
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
              <el-button type="text" class="text-indigo-600 hover:text-indigo-700">
                Xem tất cả thông báo
              </el-button>
            </div>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- Settings -->
      <el-button type="text" class="p-2" @click="openSettings">
        <el-icon>
          <Setting />
        </el-icon>
      </el-button>

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
            <div class="text-sm font-medium text-black">{{ useUserStore.full_name }}</div>
            <div class="text-xs text-gray-900">{{ useUserStore.username }}</div>
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
                  <div class="text-sm font-medium text-gray-900">{{ useUserStore.full_name }}</div>
                  <div class="text-xs text-gray-500">{{ useUserStore.role }}</div>
                </div>
              </div>
            </div>

            <el-dropdown-item command="profile">
              <el-icon>
                <User />
              </el-icon>
              <span class="ml-2">Hồ sơ cá nhân</span>
            </el-dropdown-item>

            <el-dropdown-item command="settings">
              <el-icon>
                <Setting />
              </el-icon>
              <span class="ml-2">Cài đặt tài khoản</span>
            </el-dropdown-item>

            <el-dropdown-item command="system">
              <el-icon>
                <Tools />
              </el-icon>
              <span class="ml-2">Quản lý hệ thống</span>
            </el-dropdown-item>

            <el-dropdown-item divided command="logout" class="text-red-600" @click="handleLogout">
              <el-icon>
                <SwitchButton />
              </el-icon>
              <span class="ml-2">Đăng xuất</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
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