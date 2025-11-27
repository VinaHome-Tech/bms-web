<script setup lang="ts">
import {
  Plus,
  Delete,
  Edit,
  ArrowUp,
  ArrowDown,
  Checked,
} from "@element-plus/icons-vue";
import type { DrawerProps, FormRules } from "element-plus";
import InputText from "~/components/inputs/inputText.vue";
import InputNumber from "~/components/inputs/inputNumber.vue";
import { formatCurrency } from "~/lib/formatCurrency";
import { useRouteManagement } from "~/composables/route/useRouteManagement";
definePageMeta({
  layout: "default",
});
const {
  handleAdd,
  handleEdit,
  handleDelete,
  submitForm,
  resetForm,
  cancelClick,
  drawer,
  isEditMode,
  routes,
  loadingData,
  loadingSubmit,
  ruleFormRef,
  ruleForm,
  fetchListRoutes,
  handleMoveUp,
  handleMoveDown,
} = useRouteManagement();
const useUserStore = userStore();
const direction = ref<DrawerProps["direction"]>("rtl");

const rules = reactive<FormRules>({
  route_name: [
    { required: true, message: "Vui lòng nhập tên tuyến", trigger: "blur" },
    {
      min: 2,
      max: 50,
      message: "Tên tuyến phải từ 2 đến 50 ký tự",
      trigger: "blur",
    },
  ],
  base_price: [
    { required: true, message: "Vui lòng nhập giá cơ bản", trigger: "blur" },
  ],
  short_name: [
    {
      required: true,
      message: "Vui lòng nhập tên tuyến rút gọn",
      trigger: "blur",
    },
    {
      min: 1,
      max: 20,
      message: "Tên rút gọn phải từ 1 đến 20 ký tự",
      trigger: "blur",
    },
  ],
  e_ticket_price: [
    {
      required: true,
      message: "Vui lòng nhập giá vé điện tử",
      trigger: "blur",
    },
  ],
  route_name_e_ticket: [
    {
      required: true,
      message: "Vui lòng nhập tên tuyến xuất vé điện tử",
      trigger: "blur",
    },
  ],
});

const search = ref("");
const filterTableData = computed(() =>
  routes.value.filter(
    (data) =>
      !search.value ||
      (data.route_name ?? "").toLowerCase().includes(search.value.toLowerCase())
  )
);

onMounted(async () => {
  await useUserStore.loadUserInfo();
  await fetchListRoutes(useUserStore.company_id ?? "");
});
</script>
<template>
  <section>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">DANH SÁCH TUYẾN</h3>
      <el-button :icon="Plus" type="primary" @click="handleAdd"
        >Thêm tuyến</el-button
      >
    </div>
    <el-table
      v-loading="loadingData"
      element-loading-text="Đang tải dữ liệu..."
      :data="filterTableData"
      style="width: 100%"
    >
      <el-table-column type="index" label="STT" width="50" />
      <el-table-column label="Tên tuyến" prop="route_name" />
      <el-table-column label="Tên tuyến rút gọn" prop="short_name" />
      <el-table-column
        label="Giá cơ bản"
        prop="base_price"
        :formatter="(_, __, value) => formatCurrency(value)"
      />
      <el-table-column label="Trạng thái" prop="status">
        <template #default="scope">
          <el-tag :type="scope.row.status ? 'success' : 'danger'">
            {{ scope.row.status ? "Kích hoạt" : "Ngưng kích hoạt" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Ghi chú" prop="note" />
      <el-table-column label="Vị trí" width="120">
        <template #default="scope">
          <el-button-group>
            <el-button
              :disabled="scope.$index === 0"
              size="small"
              @click="handleMoveUp(scope.row, scope.$index)"
              :icon="ArrowUp"
              @click.stop.prevent=""
            />
            <el-button
              :disabled="scope.$index === filterTableData.length - 1"
              size="small"
              @click="handleMoveDown(scope.row, scope.$index)"
              :icon="ArrowDown"
              @click.stop.prevent=""
            />
          </el-button-group>
        </template>
      </el-table-column>
      <el-table-column align="right">
        <template #header>
          <el-input v-model="search" placeholder="Tìm tuyến" />
        </template>
        <template #default="scope">
          <el-button
            type="primary"
            :icon="Edit"
            circle
            @click="handleEdit(scope.$index, scope.row)"
          />
          <el-button
            circle
            type="danger"
            :icon="Delete"
            @click="handleDelete(scope.$index, scope.row)"
          />
        </template>
      </el-table-column>
    </el-table>

    <el-drawer
      v-model="drawer"
      :direction="direction"
      :before-close="cancelClick"
    >
      <template #header>
        <div class="font-semibold text-lg text-black">
          {{ isEditMode ? "Chỉnh sửa tuyến" : "Thêm tuyến" }}
        </div>
      </template>
      <template #default>
        <el-form
          ref="ruleFormRef"
          :model="ruleForm"
          :rules="rules"
          label-width="auto"
        >
          <div>
            <h2 class="text-gray-500 font-medium mb-5">THÔNG TIN TUYẾN</h2>

            <InputText
              v-model="ruleForm.route_name"
              prop="route_name"
              label="Tên tuyến"
            />

            <InputNumber
              v-model="ruleForm.base_price"
              prop="base_price"
              label="Giá cơ bản"
            />

            <InputText
              v-model="ruleForm.short_name"
              prop="short_name"
              label="Tên rút gọn"
            />

            <el-form-item prop="status" label-position="top">
              <template #label>
                <label class="text-sm font-medium text-gray-700"
                  >Trạng thái</label
                >
              </template>
              <el-switch
                v-model="ruleForm.status"
                size="large"
                active-text="Kích hoạt"
                inactive-text="Ngưng kích hoạt"
              />
            </el-form-item>

            <InputText
              v-model="ruleForm.route_name_e_ticket"
              prop="route_name_e_ticket"
              label="Tên tuyến xuất vé điện tử"
            />

            <InputNumber
              v-model="ruleForm.e_ticket_price"
              prop="e_ticket_price"
              label="Giá vé điện tử"
            />

            <InputText v-model="ruleForm.note" prop="note" label="Ghi chú" />

            <InputNumber
              v-model="ruleForm.distance"
              prop="distance"
              label="Quảng đường (km)"
            />

            <InputText
              v-model="ruleForm.journey"
              prop="journey"
              label="Lộ trình"
            />
          </div>
        </el-form>
      </template>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="resetForm(ruleFormRef)">Thoát</el-button>
          <el-button type="primary" :icon="Checked" :loading="loadingSubmit" @click="submitForm(ruleFormRef)">
            {{ loadingSubmit ? 'Đang lưu...' : 'Lưu thông tin' }}
          </el-button>
        </div>
      </template>
    </el-drawer>
  </section>
</template>
<style scoped>
:deep(.el-drawer__footer) {
  padding-bottom: 10px !important;
  background-color: whitesmoke !important;
  border-top: 1px solid rgb(240, 240, 240) !important;
}

:deep(.el-drawer__header) {
  background-color: whitesmoke !important;
  border-bottom: 1px solid rgb(240, 240, 240) !important;
  padding-bottom: 20px;
  margin-bottom: 0 !important;
}
</style>
