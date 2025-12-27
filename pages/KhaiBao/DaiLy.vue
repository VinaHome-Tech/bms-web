<script setup lang="ts">
import type { DrawerProps, FormRules } from 'element-plus'
import InputText from '~/components/inputs/inputText.vue';
import InputNumber from '~/components/inputs/inputNumber.vue';
import {
    Plus, Delete, Edit, Checked
} from '@element-plus/icons-vue'
import { useAgentManagement } from '~/composables/account/useAgentManagement';
import { useAgentActions } from '~/composables/agent/useAgentActions';
import { useAgentList } from '~/composables/agent/useAgentList';
import { agentList } from '~/composables/agent/useAgentGlobal';
definePageMeta({
    layout: 'default',
})
// const {
//     drawer,
//     isEditMode,
//     agents,
//     loadingData,
//     loadingSubmit,
//     ruleFormRef,
//     ruleForm,
//     handleAdd,
//     handleEdit,
//     handleDelete,
//     fetchListAgents,
//     submitForm,
//     cancelClick,
//     resetForm,

// } = useAgentManagement();
const {
    loadingData,
    fetchListAgent,
} = useAgentList();
const {
    isEditMode,
    ruleFormRef,
    drawer,
    loadingSubmit,
    ruleForm,
    handleAdd,
    handleEdit,
    resetForm,
    cancelClick,
    handleDelete,
    handleSubmitAgent,
} = useAgentActions();
const useUserStore = userStore();
const direction = ref<DrawerProps[ 'direction' ]>('rtl')

const rules: FormRules = {
    name: [
        { required: true, message: 'Vui lòng nhập tên đại lý', trigger: 'blur' },
    ],
    phone: [
        { required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' },
        { pattern: /^0[0-9]{9}$/, message: 'Số điện thoại không hợp lệ', trigger: 'blur' }
    ],
    username: isEditMode.value ? [] : [
        { required: true, message: 'Vui lòng nhập tài khoản', trigger: 'blur' },
    ],
    password: isEditMode.value ? [] : [
        { required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' },
    ],
}

const search = ref('')
const filterTableData = computed(() =>
    agentList.value.filter(
        (data) =>
            !search.value ||
            (data.name ?? '').toLowerCase().includes(search.value.toLowerCase())
    )
)



onMounted(async () => {
    await useUserStore.loadUserInfo();
    await fetchListAgent(useUserStore.company_id ?? '');
});
</script>
<template>
    <section>
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">DANH SÁCH ĐẠI LÝ</h3>
            <el-button :icon="Plus" type="primary" @click="handleAdd">Thêm đại lý</el-button>
        </div>
        <el-table v-loading="loadingData" element-loading-text="Đang tải dữ liệu..." :data="filterTableData"
            style="width: 100%">
            <el-table-column type="index" label="STT" width="50" />
            <el-table-column label="Đại lý">
                <template #default="scope">
                    <span class="font-medium">{{ scope.row.name }}</span>
                    <br/>
                    <span class="text-sm text-gray-500">{{ scope.row.username }}</span>
                </template>
            </el-table-column>
            
            <el-table-column label="Thông tin liên hệ">
                <template #default="scope">
                    <div class="flex flex-col space-y-1">
                        <div>
                            <span>{{ scope.row.phone }}</span>
                        </div>
                        <div>
                            <span>{{ scope.row.email }}</span>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="Địa chỉ" prop="address" />
            <el-table-column label="Trạng thái" prop="status">
                <template #default="scope">
                    <el-tag :type="scope.row.status ? 'success' : 'danger'">
                        {{ scope.row.status ? 'Kích hoạt' : 'Ngưng kích hoạt' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="Chiết khấu vé">
  <template #default="{ row }">
    <span class="font-medium">
      {{
        row.ticket_type
          ? row.ticket_value
          : row.ticket_value?.toLocaleString('vi-VN')
      }}
      ({{ row.ticket_type ? '%' : 'VNĐ' }})
    </span>
  </template>
</el-table-column>

           <el-table-column label="Chiết khấu hàng hóa">
  <template #default="{ row }">
    <span class="font-medium">
      {{
        row.goods_type
          ? row.goods_value
          : row.goods_value?.toLocaleString('vi-VN')
      }}
      ({{ row.goods_type ? '%' : 'VNĐ' }})
    </span>
  </template>
</el-table-column>


            <el-table-column align="right">
                <template #header>
                    <el-input v-model="search" placeholder="Tìm đại lý" />
                </template>
                <template #default="scope">
                    <el-button type="primary" :icon="Edit" circle @click="handleEdit(scope.$index, scope.row)" />
                    <el-button circle type="danger" :icon="Delete" @click="handleDelete(scope.$index, scope.row)" />
                </template>
            </el-table-column>
        </el-table>

        <el-drawer v-model="drawer" :direction="direction" :before-close="cancelClick" size="50%">
            <template #header>
                <div class="font-semibold text-lg text-black">{{ isEditMode ? 'Chỉnh sửa đại lý' : 'Thêm đại lý'
                    }}</div>
            </template>
            <template #default>
                <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="auto">
                    <el-row>
                        <el-col :span="12" class="pr-5">
                            <h2 class="text-gray-500 font-medium mb-5">THÔNG TIN ĐẠI LÝ</h2>
                            <InputText v-model="ruleForm.name" prop="name" label="Tên đại lý" />
                            <InputText v-if="!isEditMode" v-model="ruleForm.username" prop="username"
                                label="Tài khoản" />
                            <InputText v-if="!isEditMode" v-model="ruleForm.password" prop="password"
                                label="Mật khẩu" />
                            <InputText v-model="ruleForm.phone" prop="phone" label="Số điện thoại liên lạc" />
                            <InputText v-model="ruleForm.email" prop="email" label="Email" />
                            <InputText v-model="ruleForm.address" prop="address" label="Địa chỉ" />
                            <el-form-item prop="status" label-position="top">
                                <template #label>
                                    <label class="text-sm font-medium text-gray-700">Trạng thái</label>
                                </template>
                                <el-switch v-model="ruleForm.status" size="large" active-text="Kích hoạt"
                                    inactive-text="Ngưng kích hoạt" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12" class="pl-5 space-y-8">
                            <h2 class="text-gray-500 font-medium mb-5">
                                CHÍNH SÁCH CHIẾT KHẤU
                            </h2>

                            <!-- ================= CHIẾT KHẤU VÉ ================= -->
                            <div class="p-4 border rounded-lg space-y-4 bg-white">
                                <h3 class="text-sm font-medium text-gray-700">
                                    Chiết khấu vé
                                </h3>

                                <InputNumber v-model="ruleForm.ticket_value" prop="discount_ticket_value"
                                    label="Giá trị chiết khấu" class="w-full" />

                                <form-item prop="discount_ticket_type" label-position="top">
                                    <template #label>
                                        <span class="text-sm font-medium text-gray-600">
                                            Loại chiết khấu
                                        </span>
                                    </template>

                                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">


                                        <el-switch v-model="ruleForm.ticket_type" size="large"  active-text="%" inactive-text="VNĐ" style="
            --el-switch-on-color: #13ce66;
            --el-switch-off-color: #409eff;
          " />

                                    </div>
                                </form-item>
                            </div>

                            <!-- ================= CHIẾT KHẤU HÀNG HÓA ================= -->
                            <div class="p-4 border rounded-lg space-y-4 bg-white">
                                <h3 class="text-sm font-medium text-gray-700">
                                    Chiết khấu hàng hóa theo đơn
                                </h3>

                                <InputNumber v-model="ruleForm.goods_value" prop="discount_goods_value"
                                    label="Giá trị chiết khấu" class="w-full" />

                                <form-item prop="discount_goods_type" label-position="top">
                                    <template #label>
                                        <span class="text-sm font-medium text-gray-600">
                                            Loại chiết khấu
                                        </span>
                                    </template>

                                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-md">


                                        <el-switch v-model="ruleForm.goods_type" size="large"  active-text="%" inactive-text="VNĐ" style="
            --el-switch-on-color: #13ce66;
            --el-switch-off-color: #409eff;
          "/>

                                    </div>
                                </form-item>
                            </div>
                        </el-col>

                    </el-row>
                </el-form>
            </template>
            <template #footer>
                <div style="flex: auto">
                    <el-button @click="resetForm(ruleFormRef)">Thoát</el-button>
                    <el-button type="primary" :icon="Checked" :loading="loadingSubmit"
                        @click="handleSubmitAgent(ruleFormRef)">
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
