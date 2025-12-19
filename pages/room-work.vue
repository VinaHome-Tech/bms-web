<script setup lang="ts">
import { ref, computed } from 'vue'
import { SwitchButton } from '@element-plus/icons-vue'
import { API_GetListOfficeRoomWorkByCompanyId } from '~/services/resource-service/office/bms-office.api'
import type { OfficeRoomWork } from '~/types/office/office.interface'
import { API_LogoutBMS } from '~/services/identity-service/auth/bms-auth.api'
definePageMeta({
  middleware: ['auth'],
  layout: false,
})
// const { handleManualLogout } = useAuth();
const useUserStore = userStore();
const officeStore = useOfficeStore();

const selectedOffice = ref<number | null>(null)
const searchQuery = ref('')
const filterByAvailability = ref(false)

const offices = ref<OfficeRoomWork[]>([]);
const isLoading = ref(true);

const filteredOffices = computed(() => {
  let result = offices.value.filter(office =>
    (office.name ?? '').toLowerCase().includes(searchQuery.value.toLowerCase())
  )

  if (filterByAvailability.value) {
    result = result.filter(office => office.status)
  }

  return result
})

const selectOffice = (officeId: number) => {
  selectedOffice.value = officeId
}

const confirmSelection = () => {
  if (selectedOffice.value) {
    const office = offices.value.find(o => o.id === selectedOffice.value);
    if (office) {
      officeStore.setOfficeStore({
        id: office.id,
        name: office.name,
      });
      // console.log('Văn phòng đã chọn:', office);

      notifySuccess('Bắt đầu làm việc tại: ' + office.name)
      navigateTo('/dashboard');
    }
  } else {
    notifyWarning('Vui lòng chọn một văn phòng!')
  }
};



const fetchOfficeList = async () => {
  isLoading.value = true;
  try {
    const res = await API_GetListOfficeRoomWorkByCompanyId(useUserStore.company_id ?? '');
    if (res.success && res.result) {
      offices.value = res.result;
    } else {
      notifyError(res.message || 'Lỗi khi lấy danh sách văn phòng!');
    }
  } catch (err) {
    console.error('Lỗi khi lấy danh sách văn phòng:', err);
  } finally {
    isLoading.value = false;
  }
};
const handleManualLogout = async (): Promise<void> => {
  try {
    const response = await API_LogoutBMS(useUserStore.id || '');
    if (response.success) {
      notifySuccess('Đăng xuất thành công!');
    }
  } catch (error) {
    console.error('Logout API error:', error);
    notifyWarning('Đăng xuất thành công!');
  } finally {
    useUserStore.resetUserInfo();
    officeStore.resetOfficeStore();
    await navigateTo('/');
  }
};
onMounted(async () => {
  await useUserStore.loadUserInfo();
  await fetchOfficeList();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-2">
    <div class="max-w-6xl mx-auto px-2">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-md p-4 md:p-6 mb-3">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4">
          <div class="flex-1">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Chào mừng bạn đến với Phần mềm Quản lý bán vé!
            </h1>
            <p class="text-gray-600">
              Vui lòng chọn văn phòng mà bạn sẽ làm việc
            </p>
          </div>
          <div class="flex items-center justify-between gap-3 lg:text-right">
            <ClientOnly>
              <div class="flex-1">
                <p class="text-base md:text-lg font-semibold text-blue-600">
                  Nhân viên: {{ useUserStore.full_name || '' }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ useUserStore.username || '' }}
                </p>
              </div>

              <template #fallback>
                <div class="flex-1">
                  <p class="text-base md:text-lg font-semibold text-blue-600">
                    Nhân viên:
                  </p>
                  <p class="text-sm text-gray-500"></p>
                </div>
              </template>
            </ClientOnly>

            <el-button class="shrink-0" type="danger" :icon="SwitchButton" @click="handleManualLogout">
              Đăng xuất
            </el-button>
          </div>

        </div>
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p class="text-blue-700">
            <strong>Lưu ý:</strong> Sau khi chọn văn phòng, bạn sẽ được chuyển đến trang làm việc chính.
            Bạn có thể thay đổi lựa chọn này trong phần cài đặt tài khoản.
          </p>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="bg-white rounded-lg shadow-md p-2 md:p-6 mb-3">
        <div class="flex flex-col gap-4">
          <!-- Search Input -->
          <div class="w-full">
            <el-input v-model="searchQuery" type="text" placeholder="Tìm kiếm theo tên hoặc địa chỉ văn phòng..."
              />
          </div>

          <!-- Filter Controls -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <label class="flex items-center cursor-pointer">
              <input v-model="filterByAvailability" type="checkbox"
                class="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
              <span class="text-sm md:text-base text-gray-700">Chỉ văn phòng đang hoạt động</span>
            </label>
            <el-button class="w-full sm:w-auto" @click="() => { searchQuery = ''; filterByAvailability = false }">
              Xóa bộ lọc
            </el-button>
          </div>
        </div>
      </div>
      <div v-if="isLoading">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="filteredOffices.length === 0" class="text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">🏢</div>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">
          Không tìm thấy văn phòng nào
        </h3>
        <p class="text-gray-500">
          Thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-2">
        <div v-for="office in filteredOffices" :key="`office-${office.id}`" :class="[
          'bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-300',
          selectedOffice === office.id ? 'ring-4 ring-blue-500 transform scale-100' : 'hover:shadow-lg',
          !office.status ? 'opacity-60 cursor-not-allowed' : ''
        ]" @click="office.status && selectOffice(office.id as number)">
          <div class="p-4">
            <h3 class="text-base font-semibold text-gray-800 mb-2">{{ office.name }}</h3>
            <div class="text-gray-600 mb-1">
              <span class="text-sm font-medium text-gray-700">Địa chỉ: {{ office.address }}</span>
            </div>
            <div class="mb-1">
              <h4 class="text-sm font-medium text-gray-700">Số điện thoại:</h4>
              <div class="flex flex-wrap gap-1">
                <span v-for="phone in office.phones || []" :key="`phone-${phone.id}`"
                  class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                  {{ phone.phone }}
                </span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span :class="[
                'px-3 py-1 rounded-full text-sm font-medium',
                office.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              ]">
                {{ office.status ? 'Đang hoạt động' : 'Ngưng hoạt động' }}
              </span>
            </div>
          </div>
        </div>
      </div>


      <div v-if="selectedOffice" class="fixed bottom-8 right-8 z-50">

        <button @click="confirmSelection"
          class="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-full shadow-lg transition-all duration-300 flex items-center gap-3 animate-pulse">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"></path>
          </svg>
          Bắt đầu làm việc
        </button>

      </div>

      <div v-if="!isLoading && !selectedOffice" class="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <div
          class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-3 rounded-lg shadow-md flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"></path>
          </svg>
          Vui lòng chọn một văn phòng để tiếp tục
        </div>
      </div>
    </div>
  </div>
</template>