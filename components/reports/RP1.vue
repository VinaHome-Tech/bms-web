<script setup lang="ts">
import { getListRouteNameActionByCompany } from '~/api/routeAPI';
import type { DTO_RP_ListRouteName } from '~/types/routeType';
import type { DTO_RP_ListTripItem } from '~/types/tripType';
const props = defineProps<{
  companyId: string
}>()
const loading = ref(false)
const listRoute = ref<DTO_RP_ListRouteName[]>([]);
const listTrip = ref<DTO_RP_ListTripItem[]>([]);

const valueCalendar = ref<string | Date>('');
const valueRoute = ref<number | undefined>(undefined);
const valueTrip = ref<number | undefined>(undefined);

const fetchListRoute = async () => {
  try {
    const response = await getListRouteNameActionByCompany(props.companyId);
    if (response && response.result) {
      listRoute.value = response.result;
    }
  } catch (error) {
    console.error('Error fetching route names:', error);
  }
};
const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189',
  },
]
onMounted(() => {
  fetchListRoute();
});
</script>
<template>
  <section>
    <div class="flex gap-4 mb-4">
      <el-date-picker v-model="valueCalendar" type="date" placeholder="Chọn ngày" style="width: 240px" />
      <el-select v-model="valueRoute" placeholder="Chọn tuyến" style="width: 340px">
        <el-option v-for="item in listRoute" :key="item.id" :label="item.route_name" :value="item.id" />
      </el-select>
      <el-select v-model="valueTrip" placeholder="Chọn chuyến" style="width: 240px">
        <el-option v-for="item in listTrip" :key="item.id" :label="item.trip_time" :value="item.id" />
      </el-select>
    </div>
    {{ valueCalendar }}
   <span> Company ID:  {{ props.companyId }}</span>
    <div>
      <el-table v-loading="loading" element-loading-text="Đang tải dữ liệu..." :data="tableData" style="width: 100%"
        border :header-cell-style="{ backgroundColor: '#0072bc', color: '#fff', fontWeight: 'bold' }">
        <template #empty>
          <div style="text-align: center;">
            <div>Không có dữ liệu</div>
          </div>
        </template>
        <el-table-column prop="date" label="Mã vé" header-align="center" align="center" />
        <el-table-column prop="address" label="Mã ghế" header-align="center" align="center" />
        <el-table-column prop="name" label="Tên hành khách" header-align="center" align="center" />
        <el-table-column prop="address" label="Điện thoại" header-align="center" align="center" />
        <el-table-column prop="address" label="Điểm đón" header-align="center" align="center" />
        <el-table-column prop="address" label="Điểm trả" header-align="center" align="center" />
        <el-table-column prop="address" label="Trạng thái" header-align="center" align="center" />

        <el-table-column prop="address" label="HTTT" header-align="center" align="center" />
        <el-table-column prop="address" label="Giá vé" header-align="center" align="center" />
      </el-table>
    </div>
  </section>
</template>