<script setup lang="ts">
import { ref, computed } from 'vue'
import {
    ArrowRightBold, ArrowLeftBold
} from '@element-plus/icons-vue'
// Props
interface Props {
    modelValue?: Date | string
    disabled?: boolean
    disabledDate?: (date: Date) => boolean
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: undefined,
    disabled: false
})

// Emit
const emit = defineEmits<{
    'update:modelValue': [ value: Date ]
    'change': [ value: Date ]
    'select': [ value: Date ]
}>()

// State
const selectedDate = ref<Date | null>(
    props.modelValue
        ? (typeof props.modelValue === 'string' ? new Date(props.modelValue) : props.modelValue)
        : null // <-- Thay bằng null khi không có giá trị
)
watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        const dateValue = typeof newValue === 'string' ? new Date(newValue) : newValue
        selectedDate.value = dateValue
        
        // ✅ Cập nhật currentMonth để hiển thị tháng của ngày được chọn
        currentMonth.value = new Date(dateValue.getFullYear(), dateValue.getMonth(), 1)
        
        console.log('📅 Calendar sync với queryDate:', dateValue)
    }
}, { immediate: true })
const currentMonth = ref(new Date())

// Computed
const monthYear = computed(() => {
    const monthName = currentMonth.value.toLocaleDateString('vi-VN', { month: 'numeric' })
    const year = currentMonth.value.getFullYear()
    return `Tháng ${monthName}/${year}`
})

const daysInMonth = computed(() => {
    const year = currentMonth.value.getFullYear()
    const month = currentMonth.value.getMonth()

    // Ngày đầu tiên của tháng
    const firstDay = new Date(year, month, 1)
    // Ngày cuối cùng của tháng
    const lastDay = new Date(year, month + 1, 0)

    // Tính ngày bắt đầu tuần (Thứ 2)
    const startDate = new Date(firstDay)
    let dayOfWeek = firstDay.getDay() // 0 = CN, 1 = T2, ..., 6 = T7

    // Chuyển đổi để T2 = 0, T3 = 1, ..., CN = 6
    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1

    // Lùi về thứ 2 của tuần chứa ngày đầu tháng
    startDate.setDate(startDate.getDate() - dayOfWeek)

    // Tạo mảng 42 ngày (6 tuần x 7 ngày)
    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
        const currentDate = new Date(current)
        const lunarInfo = getLunarDate(currentDate) // Tính âm lịch cho từng ngày riêng biệt

        days.push({
            date: currentDate,
            isCurrentMonth: current.getMonth() === month,
            isToday: isSameDay(current, new Date()),
            isSelected: isSameDay(current, selectedDate.value),
            lunar: lunarInfo // Lưu thông tin âm lịch vào từng ngày
        })
        current.setDate(current.getDate() + 1)
    }

    return days
})

const weekDays = [ 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN' ]

// Lunar Calendar Functions
const lunarInfo = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
    0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
    0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0
]

const solarMonth = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ]
const Animals = [ "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi" ]
const lunarMonths = [ "", "Giêng", "Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "Tám", "Chín", "Mười", "M.một", "M.hai" ]

const lYearDays = (y: number) => {
    let i, sum = 348
    for (i = 0x8000; i > 0x8; i >>= 1) {
        sum += (lunarInfo[ y - 1900 ] & i) ? 1 : 0
    }
    return sum + leapDays(y)
}

const leapMonth = (y: number) => {
    return lunarInfo[ y - 1900 ] & 0xf
}

const leapDays = (y: number) => {
    if (leapMonth(y)) {
        return (lunarInfo[ y - 1900 ] & 0x10000) ? 30 : 29
    }
    return 0
}

const monthDays = (y: number, m: number) => {
    if (m > 12 || m < 1) return -1
    return (lunarInfo[ y - 1900 ] & (0x10000 >> m)) ? 30 : 29
}

const solarDays = (y: number, m: number) => {
    if (m > 12 || m < 1) return -1
    let ms = m - 1
    if (ms === 1) {
        return (((y % 4 === 0) && (y % 100 !== 0) || (y % 400 === 0)) ? 29 : 28)
    } else {
        return solarMonth[ ms ]
    }
}

// Fixed toLunar function
const toLunar = (sYear: number, sMonth: number, sDay: number) => {
    // Tính số ngày từ 1900/1/31 (ngày chuẩn 1900/1/1 âm lịch)
    let offset = 0

    // Base date: 1900/1/31 (1900/1/1 lunar)
    const baseYear = 1900
    const baseMonth = 1
    const baseDay = 31

    // Tính offset từ ngày base
    for (let i = baseYear; i < sYear; i++) {
        const isLeapYear = ((i % 4 === 0) && (i % 100 !== 0)) || (i % 400 === 0)
        offset += isLeapYear ? 366 : 365
    }

    for (let i = 1; i < sMonth; i++) {
        offset += solarDays(sYear, i)
    }

    offset += sDay - baseDay

    // Tính năm âm lịch
    let lYear = 1900
    let temp = 0

    while (lYear < 2050 && offset > 0) {
        temp = lYearDays(lYear)
        if (offset >= temp) {
            offset -= temp
            lYear++
        } else {
            break
        }
    }

    // Tính tháng âm lịch
    let lMonth = 1
    let isLeap = false

    while (lMonth <= 12 && offset > 0) {
        // Kiểm tra tháng nhuận
        if (leapMonth(lYear) > 0 && lMonth === (leapMonth(lYear) + 1) && !isLeap) {
            lMonth--
            isLeap = true
            temp = leapDays(lYear)
        } else {
            temp = monthDays(lYear, lMonth)
        }

        if (offset >= temp) {
            offset -= temp
            if (isLeap && lMonth === (leapMonth(lYear) + 1)) {
                isLeap = false
            }
            lMonth++
        } else {
            break
        }
    }

    const lDay = offset + 1 // +1 vì ngày bắt đầu từ 1

    return {
        year: lYear,
        month: lMonth,
        day: lDay,
        isLeap: isLeap,
        yearAnimal: Animals[ (lYear - 1900) % 12 ]
    }
}

const getLunarDate = (date: Date) => {
    const lunar = toLunar(date.getFullYear(), date.getMonth() + 1, date.getDate())
    return {
        day: lunar.day,
        month: lunar.month,
        year: lunar.year,
        monthName: lunarMonths[ lunar.month ],
        isLeap: lunar.isLeap,
        yearAnimal: lunar.yearAnimal,
        displayText: `${lunar.day}/${lunar.month}${lunar.isLeap ? 'N' : ''}`
    }
}

// Methods
const isSameDay = (date1: Date, date2: Date | null) => {
    if (!date2) return false
    return date1.toDateString() === date2.toDateString()
}

const onDateClick = (date: Date) => {
    if (props.disabled) return

    if (props.disabledDate && props.disabledDate(date)) {
        return
    }

    selectedDate.value = date

    // Kiểm tra nếu ngày được chọn thuộc tháng khác với tháng hiện tại
    if (date.getMonth() !== currentMonth.value.getMonth() || 
        date.getFullYear() !== currentMonth.value.getFullYear()) {
        // Cập nhật currentMonth để hiển thị tháng của ngày được chọn
        currentMonth.value = new Date(date.getFullYear(), date.getMonth(), 1)
    }

    emit('update:modelValue', date)
    emit('change', date)
    emit('select', date)
}

const goToPrevMonth = () => {
    const prev = new Date(currentMonth.value)
    prev.setMonth(prev.getMonth() - 1)
    currentMonth.value = prev
}

const goToNextMonth = () => {
    const next = new Date(currentMonth.value)
    next.setMonth(next.getMonth() + 1)
    currentMonth.value = next
}

const goToToday = () => {
    const today = new Date()
    currentMonth.value = today
    selectedDate.value = today

    emit('update:modelValue', today)
    emit('change', today)
    emit('select', today)
}


const isDateDisabled = (date: Date) => {
    return props.disabled || (props.disabledDate && props.disabledDate(date))
}

// Expose
defineExpose({
    selectedDate,
    goToToday,
    goToPrevMonth,
    goToNextMonth
})
</script>

<template>
    <div class="max-w-4xl mx-auto space-y-6">
        <!-- Calendar Card -->
        <div class="bg-white rounded-lg overflow-hidden">

            <!-- Calendar -->
            <div class="p-1">
                <div class="mb-2 mt-2">
                    <div class="flex items-center text-center">
                        <!-- Hiển thị ngày -->
                        <div class="pl-1 w-1/3 flex items-center">
                            <span class="text-[15px] font-medium">{{ monthYear }}</span>
                        </div>

                        <!-- Nút Hôm nay -->
                        <div class="w-1/3 flex justify-center items-center">
                            <el-button type="primary" text @click="goToToday">
                                Hôm nay
                            </el-button>
                        </div>

                        <!-- Nút chuyển ngày -->
                        <div class="w-1/3 flex justify-center items-center space-x-2">
                            <el-button :icon="ArrowLeftBold" circle @click="goToPrevMonth" />
                            <el-button :icon="ArrowRightBold" circle @click="goToNextMonth"/>
                        </div>
                    </div>
                </div>


                <!-- Weekdays Header -->
                <div class="grid grid-cols-7 gap-1 mb-2">
                    <div v-for="day in weekDays" :key="day"
                        class="h-10 flex items-center justify-center text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg">
                        {{ day }}
                    </div>
                </div>

                <!-- Calendar Grid -->
                <div class="grid grid-cols-7 gap-2">
                    <button v-for="day in daysInMonth" :key="day.date.toISOString()" @click="onDateClick(day.date)"
                        :disabled="isDateDisabled(day.date)" :class="[
                            'h-[45px] flex flex-col items-center justify-center text-sm font-medium rounded-lg transition-all duration-200 relative',
                            // Base styles
                            'hover:scale-105 active:scale-95',
                            // Current month vs other months
                            day.isCurrentMonth
                                ? 'text-gray-800'
                                : 'text-gray-400',
                            // Selected state
                            day.isSelected
                                ? 'bg-blue-500 text-white font-bold shadow-lg ring-2 ring-blue-300'
                                : '',
                            // Today state (if not selected)
                            day.isToday && !day.isSelected
                                ? 'bg-blue-100 text-blue-600 font-bold ring-1 ring-blue-300'
                                : '',
                            // Hover state (if not selected)
                            !day.isSelected && !isDateDisabled(day.date)
                                ? 'hover:bg-gray-100'
                                : '',
                            // Disabled state
                            isDateDisabled(day.date)
                                ? 'opacity-30 cursor-not-allowed hover:scale-100 active:scale-100'
                                : 'cursor-pointer'
                        ]">
                        <!-- Solar date -->
                        <span class="text-base font-semibold">{{ day.date.getDate() }}</span>

                        <!-- Lunar date - Sử dụng thông tin âm lịch đã được tính sẵn -->
                        <span :class="[
                            'text-xs mt-0.5 leading-tight',
                            day.isSelected ? 'text-white/80' : 'text-gray-500',
                            !day.isCurrentMonth ? 'text-gray-400' : ''
                        ]">
                            {{ day.lunar.displayText }}
                        </span>

                        <!-- Selected indicator -->
                        <div v-if="day.isSelected"
                            class="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full flex items-center justify-center">
                            <svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd" />
                            </svg>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>