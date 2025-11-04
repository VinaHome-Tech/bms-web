<script setup lang="ts">
import { ref, onMounted, nextTick, type Ref } from 'vue'
import { Edit, Delete, Plus, Calendar, Printer } from '@element-plus/icons-vue'


interface CargoData {
    id: number
    cargo_name: string
    sender_phone: string
    receiver_phone: string
    shipping_fee: string
    collected_amount: string
    remaining_amount: string
    staff_receiver: string
    pickup_point: string
    dropoff_point: string
    note: string
}

interface TableRowClassNameParams {
    row: CargoData
    rowIndex: number
}


const loading: Ref<boolean> = ref(false)
const currentHoverRow: Ref<CargoData | null> = ref(null)
const floatingButtons: Ref<HTMLElement | null> = ref(null)
const isHoveringButtons: Ref<boolean> = ref(false)
const isHoveringRow: Ref<boolean> = ref(false)

const data: Ref<CargoData[]> = ref([
    {
        id: 1,
        cargo_name: 'Hàng hóa 1Hàng hóa 1Hàng hóa 1Hàng hóa 1Hàng hóa 1Hàng hóa 1Hàng hóa 1Hàng hóa 1',
        sender_phone: '0123456789',
        receiver_phone: '0987654321',
        shipping_fee: '100,000',
        collected_amount: '50,000',
        remaining_amount: '50,000',
        staff_receiver: 'NV001',
        pickup_point: 'Hà Nội',
        dropoff_point: 'TP.HCM',
        note: 'Ghi chú 1'
    },
    {
        id: 2,
        cargo_name: 'Hàng hóa 2',
        sender_phone: '0123456788',
        receiver_phone: '0987654322',
        shipping_fee: '200,000',
        collected_amount: '100,000',
        remaining_amount: '100,000',
        staff_receiver: 'NV002',
        pickup_point: 'Đà Nẵng',
        dropoff_point: 'TP.HCM',
        note: 'Ghi chú 2'
    },
    {
        id: 3,
        cargo_name: 'Hàng hóa 2',
        sender_phone: '0123456788',
        receiver_phone: '0987654322',
        shipping_fee: '200,000',
        collected_amount: '100,000',
        remaining_amount: '100,000',
        staff_receiver: 'NV002',
        pickup_point: 'Đà Nẵng',
        dropoff_point: 'TP.HCM',
        note: 'Ghi chú 2'
    },
    {
        id: 4,
        cargo_name: 'Hàng hóa 2',
        sender_phone: '0123456788',
        receiver_phone: '0987654322',
        shipping_fee: '200,000',
        collected_amount: '100,000',
        remaining_amount: '100,000',
        staff_receiver: 'NV002',
        pickup_point: 'Đà Nẵng',
        dropoff_point: 'TP.HCM',
        note: 'Ghi chú 2'
    }
])

// Methods
const tableRowClassName = ({ row, rowIndex }: TableRowClassNameParams): string => {
    return 'hover-row'
}

onMounted(() => {
    nextTick(() => {
        // Lắng nghe sự kiện hover trên các row
        const tableRows = document.querySelectorAll('.el-table__row')

        tableRows.forEach((row, index) => {
            row.addEventListener('mouseenter', (e: Event) => {
                isHoveringRow.value = true
                currentHoverRow.value = data.value[index]
                showFloatingButtons(e.currentTarget as HTMLElement)
            })

            row.addEventListener('mouseleave', () => {
                isHoveringRow.value = false
                // Chỉ ẩn buttons nếu không hover vào buttons
                setTimeout(() => {
                    if (!isHoveringButtons.value && !isHoveringRow.value) {
                        hideFloatingButtons()
                    }
                }, 100)
            })
        })

        // Thêm event listeners cho floating buttons
        if (floatingButtons.value) {
            floatingButtons.value.addEventListener('mouseenter', () => {
                isHoveringButtons.value = true
            })

            floatingButtons.value.addEventListener('mouseleave', () => {
                isHoveringButtons.value = false
                // Ẩn buttons khi không hover vào row và buttons
                setTimeout(() => {
                    if (!isHoveringButtons.value && !isHoveringRow.value) {
                        hideFloatingButtons()
                    }
                }, 100)
            })
        }
    })
})

const showFloatingButtons = (rowElement: HTMLElement): void => {
    if (!floatingButtons.value) return

    const rect = rowElement.getBoundingClientRect()
    const containerElement = rowElement.closest('.table-container') as HTMLElement
    if (!containerElement) return

    const containerRect = containerElement.getBoundingClientRect()

    floatingButtons.value.style.top = (rect.top - containerRect.top + rect.height / 2 - 20) + 'px'
    floatingButtons.value.style.right = '10px'
    floatingButtons.value.style.opacity = '1'
    floatingButtons.value.style.visibility = 'visible'
    floatingButtons.value.style.pointerEvents = 'auto'
}

const hideFloatingButtons = (): void => {
    if (!floatingButtons.value) return

    floatingButtons.value.style.opacity = '0'
    floatingButtons.value.style.visibility = 'hidden'
    floatingButtons.value.style.pointerEvents = 'none'
    currentHoverRow.value = null
}

const handleEdit = (row: CargoData | null): void => {
    if (row) console.log('Edit:', row)
}

const handleView = (row: CargoData | null): void => {
    if (row) console.log('View:', row)
}

const handleDelete = (row: CargoData | null): void => {
    if (row) console.log('Delete:', row)
}
</script>
<template>
    <div>
        

        <div class="table-container">
            <el-table v-loading="loading" element-loading-text="Đang tải dữ liệu..." :data="data" style="width: 100%"
                border :header-cell-style="{ backgroundColor: '#0072bc', color: '#fff', fontWeight: 'bold' }"
                :row-class-name="tableRowClassName">
                <template #empty>
                    <div style="text-align: center;">
                        <div>Không có dữ liệu</div>
                    </div>
                </template>

                <el-table-column type="index" label="" width="50" align="center" />
                <el-table-column prop="cargo_name" label="Tên hàng" />
                <el-table-column prop="sender_phone" label="Người gửi" />
                <el-table-column prop="receiver_phone" label="Người nhận" />
                <el-table-column prop="shipping_fee" label="Cước" />
                <el-table-column prop="collected_amount" label="Đã thu" />
                <el-table-column prop="remaining_amount" label="Chưa thu" />
                <el-table-column prop="staff_receiver" label="NV Nhận" />
                <el-table-column prop="pickup_point" label="Điểm lên" />
                <el-table-column prop="dropoff_point" label="Điểm xuống" />
                <el-table-column prop="note" label="Ghi chú" />


            </el-table>

            <div class="floating-buttons" ref="floatingButtons">
                <el-tooltip content="Sửa đơn hàng" placement="top">
                    <el-button type="primary" :icon="Edit" circle plain @click="handleEdit(currentHoverRow)" />
                </el-tooltip>
                <el-tooltip content="Lịch sử" placement="top">
                    <el-button type="warning" :icon="Calendar" circle plain />
                </el-tooltip>
                <el-tooltip content="Hủy đơn" placement="top">
                    <el-button type="danger" :icon="Delete" circle plain @click="handleDelete(currentHoverRow)" />
                </el-tooltip>

            </div>
        </div>
    </div>
</template>



<style scoped>
.table-container {
    position: relative;
    margin-bottom: 10px;
}

.floating-buttons {
    position: absolute;
    top: 0;
    z-index: 1000;
    display: flex;
    /* gap: 2px; */
    background: rgba(255, 255, 255, 0.95);
    padding: 4px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    pointer-events: none;
}

.floating-buttons:hover,
.table-container:hover .floating-buttons {
    pointer-events: auto;
}


:deep(.el-table__row:hover) {
    /* background-color: #f5f7fa; */
}

.floating-buttons .el-button {
    pointer-events: auto;
}
</style>