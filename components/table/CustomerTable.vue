<script setup lang="ts">
import { formatCurrencyWithoutSymbol } from '~/lib/formatCurrency';
import type { DTO_RP_ListCustomerByTrip } from '~/types/ticketType';

interface Props {
    data: DTO_RP_ListCustomerByTrip[];
    loading?: boolean;
}
withDefaults(defineProps<Props>(), {
    customers: () => [],
    loading: false,
});

</script>
<template>
    <div class="pb-2">
        <el-table v-loading="loading" element-loading-text="Đang tải dữ liệu..." :data="data" style="width: 100%"
            border :header-cell-style="{ backgroundColor: '#0072bc', color: '#fff', fontWeight: 'bold' }">
            <template #empty>
                <div style="text-align: center;">
                    <div>Không có dữ liệu</div>
                </div>
            </template>
            <el-table-column type="index" label="STT" width="55" header-align="center" align="center" />
            <el-table-column prop="seat_name" label="Số ghế" header-align="center" align="center" />
            <el-table-column prop="ticket_customer_name" label="Tên hành khách" header-align="center" align="center" />
            <el-table-column prop="ticket_phone" label="Số điện thoại" header-align="center" align="center" />
            <el-table-column prop="ticket_point_up" label="Điểm đón" header-align="center" align="center" />
            <el-table-column prop="ticket_point_down" label="Điểm trả" header-align="center" align="center" />
            <el-table-column prop="payment_method" label="Hình thức TT" header-align="center" align="center" />
            <el-table-column label="Giá vé" header-align="center" align="center">
                <template #default="scope">
                    <span>{{ formatCurrencyWithoutSymbol(scope.row.ticket_display_price) }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="ticket_note" label="Ghi chú" header-align="center" align="center" />
            <el-table-column prop="user_created" label="NV đặt" header-align="center" align="center" />
        </el-table>

    </div>
</template>