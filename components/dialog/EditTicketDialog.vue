<script setup lang="ts">
import type { CancelTicketType, DTO_RQ_UpdateTicket, TicketType } from '~/types/ticketType'
import { Checked, Printer, Delete } from '@element-plus/icons-vue'
import type { AgentNameType } from '~/types/agentType';
import { getAgencyListByCompany } from '~/api/agentAPI';
import { formatCurrency, formatCurrencyWithoutSymbol } from '~/lib/formatCurrency';
import type { TabsPaneContext } from 'element-plus'
import { API_GetHistoryTicket } from '~/api/historyTicketAPI';
import type { DTO_RP_HistoryTicket } from '~/types/historyTicketType';
import { format } from 'date-fns';
const props = defineProps<{
    modelValue: boolean
    selectedTickets?: TicketType[]
}>()
const useUserStore = userStore();
const activeName = ref('1')
const localTickets = ref<TicketType[]>([])

// Giá trị hiển thị cho input
const priceDisplayValue = ref('')

// Xử lý khi input thay đổi - format ngay lập tức
const handlePriceInput = (value: string) => {
    // Chỉ giữ lại số
    const numericValue = value.replace(/\D/g, '');

    if (localTickets.value.length > 0) {
        // Lưu giá trị số thuần
        localTickets.value[ 0 ].ticket_display_price = Number(numericValue) || 0;

        // Format và hiển thị
        if (numericValue) {
            priceDisplayValue.value = formatCurrencyWithoutSymbol(Number(numericValue));
        } else {
            priceDisplayValue.value = '';
        }
    }
}

watch(
    () => props.selectedTickets,
    (val) => {
        localTickets.value = val ? val.map(ticket => ({ ...ticket })) : [];
        localTickets.value.forEach(ticket => {
            ticket.payment_method = ticket.payment_method || 'TTTX';
        });
        // Cập nhật giá trị hiển thị
        if (localTickets.value.length > 0 && localTickets.value[ 0 ].ticket_display_price) {
            priceDisplayValue.value = formatCurrencyWithoutSymbol(Number(localTickets.value[ 0 ].ticket_display_price));
        } else {
            priceDisplayValue.value = '';
        }
    },
    { immediate: true, deep: true }
)

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'closed'): void
    (e: 'updateTickets', tickets: DTO_RQ_UpdateTicket): void
    (e: 'cancelTickets', tickets: CancelTicketType): void
    (e: 'print', tickets: TicketType[]): void
}>()

const visible = ref(props.modelValue)

watch(
    () => props.modelValue,
    async (val) => {
        visible.value = val
        if (val) {
            await useUserStore.loadUserInfo();
            await fetchListAgency();
        }
    }
)

watch(visible, (val) => {
    emit('update:modelValue', val)
})
const handlePrintTickets = () => {
    emit('print', localTickets.value);
}

function handleClose() {
    visible.value = false
    activeName.value = '1'
    emit('closed')
}
function handleUpdateDataTicket() {
    if (localTickets.value.length === 0) return
    const ids = localTickets.value.map(ticket => ticket.id)
    const base = localTickets.value[ 0 ]
    const updatePayload: DTO_RQ_UpdateTicket = {
        id: ids,
        ticket_phone: base.ticket_phone,
        ticket_email: base.ticket_email,
        ticket_customer_name: base.ticket_customer_name,
        ticket_point_up: base.ticket_point_up,
        ticket_point_down: base.ticket_point_down,
        ticket_note: base.ticket_note,
        ticket_display_price: Number(base.ticket_display_price),
        payment_method: base.payment_method,
        transit_up: base.transit_up || false,
        transit_down: base.transit_down || false,
    }
    emit('updateTickets', updatePayload)
    visible.value = false;
}
function handleCancelTicket() {
    visible.value = false
    const ids = localTickets.value.map(ticket => ticket.id)
    emit('cancelTickets', { id: ids })
}
function getActLabel(act: string): string {
    switch (act) {
        case 'UPDATE':
            return 'Cập nhật';
        case 'COPY':
            return 'Sao chép';
        case 'MOVE':
            return 'Di chuyển';
        case 'UPDATE_CONTACT':
            return 'Liên hệ';
        default:
            return act; // Nếu không có mapping, hiển thị nguyên giá trị
    }
}
function getContactStatusLabel(status: number): string {
  const statusMap: Record<number, string> = {
    1: 'Chưa gọi',
    2: 'Phòng vé đã gọi',
    3: 'Phòng vé gọi không nghe',
    4: 'Tài xế đã gọi',
    5: 'Tài xế gọi không nghe',
    6: 'Số điện thoại không đúng',
    7: 'Đã gọi cho tài xế',
    8: 'Thuê bao không gọi được',
    9: 'Tài xế báo hủy',
    10: 'Đã nhận tin',
    11: 'Đã nhận tin trung chuyển',
    12: 'Sai địa chỉ đón',
    13: 'Chuyển chuyến khác',
  };

  return statusMap[status] || '-';
}
const agencyList = ref<AgentNameType[]>([]);
const loadingAgency = ref(false);
const fetchListAgency = async () => {
    loadingAgency.value = true;
    try {
        const response = await getAgencyListByCompany(useUserStore.company_id ?? '');
        if (response.success) {
            agencyList.value = response.result ?? [];
            console.log('Danh sách đại lý:', agencyList.value);
        } else {
            notifyError(response.message || 'Lấy danh sách đại lý thất bại!');
        }
    } catch (error) {
        console.error('Lỗi khi lấy danh sách đại lý:', error);
        notifyError('Đã xảy ra lỗi khi lấy danh sách đại lý!');
    } finally {
        loadingAgency.value = false;
    }
};
const loadingHistory = ref(false);
const historyTicket = ref<DTO_RP_HistoryTicket[]>([]);
const fetchHistoryTicket = async () => {
    try {
        const response = await API_GetHistoryTicket(localTickets.value[ 0 ].ticket_code || '');
        if (response.success) {
            historyTicket.value = response.result ?? [];
        } else {
            notifyError(response.message || 'Lấy lịch sử vé thất bại!');
        }
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử vé:', error);
        notifyError('Đã xảy ra lỗi khi lấy lịch sử vé!');
    } finally {
        loadingHistory.value = false;
    }
};

const handleClick = async (tab: TabsPaneContext, event: Event) => {
    if (tab.paneName === '2') {
        await fetchHistoryTicket();
    }
}

// Helper function để tìm giá trị trước đó của một trường
const getPreviousValue = (currentIndex: number, fieldName: string) => {
    for (let i = currentIndex + 1; i < historyTicket.value.length; i++) {
        const item = historyTicket.value[i] as any;
        const value = item[fieldName];
        if (value !== null && value !== undefined && value !== '') {
            return value;
        }
    }
    return null;
}

// Helper function để kiểm tra có thay đổi không
const hasFieldChanged = (currentIndex: number, fieldName: string, currentValue: unknown) => {
    if (!currentValue && currentValue !== false && currentValue !== 0) return false;
    
    const previousValue = getPreviousValue(currentIndex, fieldName);
    return currentValue !== previousValue;
}

onMounted(async () => {

});
</script>
<template>
    <el-dialog v-model="visible" width="700" @close="handleClose" style="padding: 0px;">
        <template #header>
            <div class="pt-[10px] pl-2">
                <span class="text-[16px] font-semibold text-white">Cập nhật thông tin vé</span>
            </div>

        </template>



        <!-- Nội dung form chỉnh sửa thông tin vé ở đây -->
        <div class="">
            <div v-if="props.selectedTickets && props.selectedTickets.length > 0">
                <h3 class="text-base font-medium pb-1 px-2 pt-2">Đang chọn ({{ props.selectedTickets.length }} vé):</h3>
                <div class="mb-2 px-2">
                    <el-tag v-for="ticket in localTickets" :key="ticket.id" class="m-1" type="primary">{{
                        ticket.seat_name }}</el-tag>
                </div>
                <el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
                    <el-tab-pane label="Thông tin chung" name="1">

                        <el-form :model="localTickets[ 0 ]">
                            <el-row>
                                <el-col :span="12" class="pr-2">
                                    <el-form-item label-position="top">
                                        <template #label>
                                            <span class="text-sm font-semibold">Điện thoại</span>
                                        </template>
                                        <el-input v-model="localTickets[ 0 ].ticket_phone" width="100%" />
                                    </el-form-item>
                                    <el-form-item label-position="top">
                                        <template #label>
                                            <span class="text-sm font-semibold">Điểm đón</span>
                                        </template>
                                        <el-input v-model="localTickets[ 0 ].ticket_point_up" />
                                    </el-form-item>
                                    <el-form-item label-position="top">
                                        <template #label>
                                            <span class="text-sm font-semibold">Điểm trả</span>
                                        </template>
                                        <el-input v-model="localTickets[ 0 ].ticket_point_down" />
                                    </el-form-item>
                                    <el-form-item label-position="top">
                                        <template #label>
                                            <span class="text-sm font-semibold">Giá vé</span>
                                        </template>
                                        <el-input v-model="priceDisplayValue" placeholder="Nhập giá vé"
                                            @input="handlePriceInput" />
                                    </el-form-item>
                                    <el-form-item label-position="top">
                                        <template #label>
                                            <span class="text-sm font-semibold">Ghi chú</span>
                                        </template>
                                        <el-input v-model="localTickets[ 0 ].ticket_note" type="textarea"
                                            :autosize="{ minRows: 2, maxRows: 4 }" />
                                    </el-form-item>

                                </el-col>
                                <el-col :span="12" class="pl-2">
                                    <el-form-item label-position="top">
                                        <template #label>
                                            <span class="text-sm font-semibold">Họ tên</span>
                                        </template>
                                        <el-input v-model="localTickets[ 0 ].ticket_customer_name" width="100%" />
                                    </el-form-item>
                                    <el-form-item label-position="top">
                                        <template #label>
                                            <span class="text-sm font-semibold">Email</span>
                                        </template>
                                        <el-input v-model="localTickets[ 0 ].ticket_email" width="100%" />
                                    </el-form-item>
                                    <el-form-item label-position="top">
                                        <template #label>
                                            <span class="text-sm font-semibold">Hình thức thanh toán</span>
                                        </template>
                                        <el-select v-model="localTickets[ 0 ].payment_method"
                                            placeholder="Chọn hình thức thanh toán">
                                            <el-option label="Thanh toán trên xe" value="TTTX" />
                                            <el-option label="Thanh toán tại quầy" value="TTTQ" />
                                            <el-option label="Thanh toán trực tuyến (Online)" value="ONLINE" />
                                            <el-option label="Chuyển khoản" value="CK" />
                                            <el-option label="Đại lý thu" value="DLT" />
                                            <el-option label="Không thu tiền" value="KTT" />
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label-position="top">
                                        <template #label>
                                            <span class="text-sm font-semibold">Đại lý</span>
                                        </template>
                                        <el-select v-model="localTickets[ 0 ].agent_id" filterable
                                            placeholder="Chọn đại lý" :loading="loadingAgency"
                                            loading-text="Đang tải danh sách đại lý..."
                                            no-data-text="Không có dữ liệu xe" clearable>
                                            <el-option v-for="item in agencyList" :key="item.id" :label="item.name"
                                                :value="item.id" />
                                        </el-select>
                                    </el-form-item>
                                    <div class="flex items-center justify-between">
                                        <el-form-item>
                                            <el-checkbox v-model="localTickets[ 0 ].transit_up">
                                                <span class="text-black">Trung chuyển đón</span>
                                            </el-checkbox>
                                        </el-form-item>
                                        <el-form-item>
                                            <el-checkbox v-model="localTickets[ 0 ].transit_down">
                                                <span class="text-black">Trung chuyển trả</span>
                                            </el-checkbox>
                                        </el-form-item>
                                    </div>
                                </el-col>
                            </el-row>
                        </el-form>


                    </el-tab-pane>
                    <el-tab-pane label="Lịch sử" name="2">
                        <el-table v-loading="loadingHistory" :data="historyTicket" style="width: 100%">
                            <el-table-column label="Thời gian" width="140">
                                <template #default="scope">
                                    <div class="text-black">
                                        {{ format(new Date(scope.row.created_at), 'HH:mm dd-MM-yyyy') }}
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="Người thực hiện" width="140">
                                <template #default="scope">
                                    <div class="text-black">
                                        {{ scope.row.act_by_full_name }}
                                        <br />
                                        ({{ scope.row.act_by_office_name }})
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="Hành động" width="110">
                                <template #default="scope">
                                    <div class="text-black">
                                        {{ getActLabel(scope.row.act) }}
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="Thông tin">
                                <template #default="scope">
                                    <div>
                                        <!-- Hiển thị đầy đủ cho dòng cuối cùng (dòng đầu tiên theo thời gian) -->
                                        <template v-if="scope.$index === historyTicket.length - 1">
                                            <div v-if="scope.row.ticket_customer_name">Họ tên: <span class="text-black font-semibold">{{ scope.row.ticket_customer_name }}</span></div>
                                            <div v-if="scope.row.ticket_phone">Điện thoại: <span class="text-black font-semibold">{{ scope.row.ticket_phone }}</span></div>
                                            <div v-if="scope.row.contact_status">Trạng thái: <span class="text-black font-semibold">{{ getContactStatusLabel(scope.row.contact_status) }}</span></div>
                                            <div v-if="scope.row.seat_name">Mã ghế: <span class="text-black font-semibold">{{ scope.row.seat_name }}</span></div>
                                            <div v-if="scope.row.ticket_email">Email: <span class="text-black font-semibold">{{ scope.row.ticket_email }}</span></div>
                                            <div v-if="scope.row.ticket_point_up">Điểm đón: <span class="text-black font-semibold">{{ scope.row.ticket_point_up }}</span></div>
                                            <div v-if="scope.row.ticket_point_down">Điểm trả: <span class="text-black font-semibold">{{ scope.row.ticket_point_down }}</span></div>
                                            <div v-if="scope.row.ticket_note">Ghi chú: <span class="text-black font-semibold">{{ scope.row.ticket_note }}</span></div>
                                            <div v-if="scope.row.payment_method">HTTT: <span class="text-black font-semibold">{{ scope.row.payment_method }}</span></div>
                                            <div v-if="scope.row.ticket_display_price">Giá vé: <span class="text-black font-semibold">{{ formatCurrency(scope.row.ticket_display_price) }}</span></div>
                                            <div v-if="scope.row.transit_up || scope.row.transit_down">Trung chuyển: <el-tag v-if="scope.row.transit_up" type="primary" size="small">Đón</el-tag> <el-tag v-if="scope.row.transit_down" type="warning" size="small">Trả</el-tag></div>
                                        </template>
                                        
                                        <!-- Chỉ hiển thị thông tin khác biệt so với lần có giá trị trước đó -->
                                        <template v-else>
                                            <div v-if="hasFieldChanged(scope.$index, 'ticket_customer_name', scope.row.ticket_customer_name)">Họ tên: <span class="text-black font-semibold">{{ scope.row.ticket_customer_name }}</span></div>
                                            <div v-if="hasFieldChanged(scope.$index, 'ticket_phone', scope.row.ticket_phone)">Điện thoại: <span class="text-black font-semibold">{{ scope.row.ticket_phone }}</span></div>
                                            <div v-if="hasFieldChanged(scope.$index, 'contact_status', scope.row.contact_status)">Trạng thái: <span class="text-black font-semibold">{{ getContactStatusLabel(scope.row.contact_status) }}</span></div>
                                            <div v-if="hasFieldChanged(scope.$index, 'seat_name', scope.row.seat_name)">Mã ghế: <span class="text-black font-semibold">{{ scope.row.seat_name }}</span></div>
                                            <div v-if="hasFieldChanged(scope.$index, 'ticket_email', scope.row.ticket_email)">Email: <span class="text-black font-semibold">{{ scope.row.ticket_email }}</span></div>
                                            <div v-if="hasFieldChanged(scope.$index, 'ticket_point_up', scope.row.ticket_point_up)">Điểm đón: <span class="text-black font-semibold">{{ scope.row.ticket_point_up }}</span></div>
                                            <div v-if="hasFieldChanged(scope.$index, 'ticket_point_down', scope.row.ticket_point_down)">Điểm trả: <span class="text-black font-semibold">{{ scope.row.ticket_point_down }}</span></div>
                                            <div v-if="hasFieldChanged(scope.$index, 'ticket_note', scope.row.ticket_note)">Ghi chú: <span class="text-black font-semibold">{{ scope.row.ticket_note }}</span></div>
                                            <div v-if="hasFieldChanged(scope.$index, 'payment_method', scope.row.payment_method)">HTTT: <span class="text-black font-semibold">{{ scope.row.payment_method }}</span></div>
                                            <div v-if="hasFieldChanged(scope.$index, 'ticket_display_price', scope.row.ticket_display_price)">Giá vé: <span class="text-black font-semibold">{{ formatCurrency(scope.row.ticket_display_price) }}</span></div>
                                            <div v-if="hasFieldChanged(scope.$index, 'transit_up', scope.row.transit_up) || hasFieldChanged(scope.$index, 'transit_down', scope.row.transit_down)">
                                                Trung chuyển: 
                                                <el-tag v-if="scope.row.transit_up" type="primary" size="small" class="mr-1">Đón</el-tag> 
                                                <el-tag v-if="scope.row.transit_down" type="warning" size="small">Trả</el-tag>
                                                <span v-if="!scope.row.transit_up && !scope.row.transit_down" class="text-gray-500">Không</span>
                                            </div>
                                            
                                            <!-- Hiển thị thông báo nếu không có thay đổi -->
                                            <div 
                                                v-if="scope.row.ticket_customer_name === historyTicket[scope.$index + 1]?.ticket_customer_name && 
                                                      scope.row.ticket_phone === historyTicket[scope.$index + 1]?.ticket_phone &&
                                                      scope.row.contact_status === historyTicket[scope.$index + 1]?.contact_status &&
                                                      scope.row.seat_name === historyTicket[scope.$index + 1]?.seat_name &&
                                                      scope.row.ticket_email === historyTicket[scope.$index + 1]?.ticket_email &&
                                                      scope.row.ticket_point_up === historyTicket[scope.$index + 1]?.ticket_point_up &&
                                                      scope.row.ticket_point_down === historyTicket[scope.$index + 1]?.ticket_point_down &&
                                                      scope.row.ticket_note === historyTicket[scope.$index + 1]?.ticket_note &&
                                                      scope.row.payment_method === historyTicket[scope.$index + 1]?.payment_method &&
                                                      scope.row.ticket_display_price === historyTicket[scope.$index + 1]?.ticket_display_price &&
                                                      scope.row.transit_up === historyTicket[scope.$index + 1]?.transit_up &&
                                                      scope.row.transit_down === historyTicket[scope.$index + 1]?.transit_down" 
                                                class="text-gray-500 italic">
                                                Không có thay đổi
                                            </div>
                                        </template>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-tab-pane>

                </el-tabs>


            </div>
        </div>

        <template #footer>
            <div class="flex justify-end p-2">
                <el-button 
                    color="#0072bc" 
                    :icon="Checked"
                    :disabled="!props.selectedTickets || props.selectedTickets.length === 0"
                    @click="handleUpdateDataTicket">
                    Cập nhật
                </el-button>
                <el-button type="warning" :icon="Printer" @click="handlePrintTickets">In vé</el-button>
                <el-button type="danger" :icon="Delete" @click="handleCancelTicket">Hủy vé</el-button>
                <el-button @click="handleClose">Đóng</el-button>

            </div>
        </template>
    </el-dialog>
</template>
<style>
.el-dialog__header {
    background-color: #0072bc;
    padding-bottom: 10px;
}

.el-dialog__headerbtn {
    color: white;
}

.el-dialog__footer {
    padding-top: 0;
}
</style>