<script setup lang="ts">
import { format } from 'date-fns';
// import { getListRegistrationExpiry } from '~/api/vehicleAPI';
import type { DTO_RP_RegistrationExpiry } from '~/types/vehicleType';

definePageMeta({
    layout: 'default',
})
const useUserStore = userStore();
const loadingVehicle = ref(false);
const listVehicle = ref<DTO_RP_RegistrationExpiry[]>([]);
const fetchListRegistrationExpiry = async () => {
    loadingVehicle.value = true;
    try {
        // const response = await getListRegistrationExpiry(useUserStore.company_id ?? '');
        // if (response.success) {
        //     listVehicle.value = response.result || [];
        // } else {
        //     console.error('Failed to fetch maintenance due vehicles:', response.message);
        // }
    } catch (error) {
        console.error('Error fetching maintenance due vehicles:', error);
    } finally {
        loadingVehicle.value = false;
    }
};
onMounted(async () => {
    await useUserStore.loadUserInfo();
    fetchListRegistrationExpiry();
});
</script>
<template>
    <div class="">
        <h3 class="text-base font-medium pb-1">HẠN ĐĂNG KIỂM</h3>
        <el-table v-loading="loadingVehicle" element-loading-text="Đang tải dữ liệu..." :data="listVehicle"
            style="width: 100%" border
            :header-cell-style="{ backgroundColor: '#0072bc', color: '#fff', fontWeight: 'bold' }">
            <template #empty>
                <div style="text-align: center;">
                    <div>Không có dữ liệu</div>
                </div>
            </template>
            <el-table-column type="index" label="STT" width="55" header-align="center" align="center" />
            <el-table-column prop="license_plate" label="Biển số xe" header-align="center" align="center" />
            <el-table-column label="Ngày hết hạn đăng kiểm" header-align="center" align="center">
                <template #default="scope">
                    <span v-if="scope.row.registration_expiry">
                        {{ format(new Date(scope.row.registration_expiry), 'dd/MM/yyyy') }}
                    </span>
                    <span v-else>-</span>
                </template>
            </el-table-column>
            <el-table-column label="Ngày còn lại" header-align="center" align="center">
                <template #default="scope">
                    <span v-if="scope.row.registration_expiry">
                        {{
                            (() => {
                                const diffDays = Math.ceil(
                                    (new Date(scope.row.registration_expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                                );
                                return diffDays < 0 ? 'Quá hạn' : `${diffDays} ngày`; })() }} </span>
                            <span v-else>-</span>
                </template>
            </el-table-column>

        </el-table>
    </div>
</template>
