<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import solarlunar from 'solarlunar'
import {
  ArrowRightBold,
  ArrowLeftBold
} from '@element-plus/icons-vue'

/* =======================
   Props & Emits
======================= */
interface Props {
  modelValue?: Date | string
  disabled?: boolean
  disabledDate?: (date: Date) => boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: Date]
  'change': [value: Date]
  'select': [value: Date]
}>()

/* =======================
   State
======================= */
const selectedDate = ref<Date | null>(null)
const currentMonth = ref(new Date())

watch(
  () => props.modelValue,
  (val) => {
    if (!val) return
    const d = typeof val === 'string' ? new Date(val) : val
    selectedDate.value = d
    currentMonth.value = new Date(d.getFullYear(), d.getMonth(), 1)
  },
  { immediate: true }
)

/* =======================
   Helpers
======================= */
const isSameDay = (d1: Date, d2: Date | null) => {
  if (!d2) return false
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

/* =======================
   Lunar calendar (SOLARLUNAR)
======================= */
const lunarMonthNames = [
  '',
  'Giêng',
  'Hai',
  'Ba',
  'Tư',
  'Năm',
  'Sáu',
  'Bảy',
  'Tám',
  'Chín',
  'Mười',
  'M.một',
  'M.hai'
]

// cache để tối ưu performance
const lunarCache = new Map<string, any>()

const getLunar = (date: Date) => {
  const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  if (lunarCache.has(key)) return lunarCache.get(key)

  const lunar = solarlunar.solar2lunar(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  )

  const data = {
    day: lunar.lDay,
    month: lunar.lMonth,
    year: lunar.lYear,
    isLeap: lunar.isLeap,
    monthName: lunarMonthNames[lunar.lMonth],
    displayText: `${lunar.lDay}/${lunar.lMonth}${lunar.isLeap ? 'N' : ''}`
  }

  lunarCache.set(key, data)
  return data
}

/* =======================
   Computed
======================= */
const monthYear = computed(() => {
  return `Tháng ${currentMonth.value.getMonth() + 1}/${currentMonth.value.getFullYear()}`
})

const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()

  const firstDay = new Date(year, month, 1)
  let startOffset = firstDay.getDay()
  startOffset = startOffset === 0 ? 6 : startOffset - 1

  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - startOffset)

  const days = []
  const cursor = new Date(startDate)

  for (let i = 0; i < 42; i++) {
    const date = new Date(cursor)

    days.push({
      date,
      isCurrentMonth: date.getMonth() === month,
      isToday: isSameDay(date, new Date()),
      isSelected: isSameDay(date, selectedDate.value),
      lunar: getLunar(date)
    })

    cursor.setDate(cursor.getDate() + 1)
  }

  return days
})

/* =======================
   Actions
======================= */
const onDateClick = (date: Date) => {
  if (props.disabled) return
  if (props.disabledDate?.(date)) return

  selectedDate.value = date
  currentMonth.value = new Date(date.getFullYear(), date.getMonth(), 1)

  emit('update:modelValue', date)
  emit('change', date)
  emit('select', date)
}

const goToPrevMonth = () => {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() - 1,
    1
  )
}

const goToNextMonth = () => {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() + 1,
    1
  )
}

const goToToday = () => {
  const today = new Date()
  selectedDate.value = today
  currentMonth.value = new Date(today.getFullYear(), today.getMonth(), 1)

  emit('update:modelValue', today)
  emit('change', today)
  emit('select', today)
}

const isDateDisabled = (date: Date) => {
  return props.disabled || props.disabledDate?.(date)
}

/* =======================
   Expose
======================= */
defineExpose({
  selectedDate,
  goToToday,
  goToPrevMonth,
  goToNextMonth
})
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="bg-white rounded-lg overflow-hidden p-2">
      <!-- Header -->
      <div class="flex items-center mb-2">
        <div class="w-1/3 font-medium text-sm">{{ monthYear }}</div>

        <div class="w-1/3 flex justify-center">
          <el-button text type="primary" @click="goToToday">Hôm nay</el-button>
        </div>

        <div class="w-1/3 flex justify-end space-x-2">
          <el-button circle :icon="ArrowLeftBold" @click="goToPrevMonth" />
          <el-button circle :icon="ArrowRightBold" @click="goToNextMonth" />
        </div>
      </div>

      <!-- Weekdays -->
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div
          v-for="d in weekDays"
          :key="d"
          class="h-9 flex items-center justify-center text-xs font-semibold text-gray-600 bg-gray-50 rounded"
        >
          {{ d }}
        </div>
      </div>

      <!-- Calendar -->
      <div class="grid grid-cols-7 gap-2">
        <button
          v-for="day in calendarDays"
          :key="`${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`"
          @click="onDateClick(day.date)"
          :disabled="isDateDisabled(day.date)"
          :class="[
            'h-[45px] rounded-lg flex flex-col justify-center items-center transition',
            day.isCurrentMonth ? 'text-gray-800' : 'text-gray-400',
            day.isSelected ? 'bg-blue-500 text-white' : '',
            day.isToday && !day.isSelected ? 'bg-blue-100 text-blue-600' : '',
            isDateDisabled(day.date) ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'
          ]"
        >
          <span class="text-sm font-semibold">{{ day.date.getDate() }}</span>
          <span class="text-xs opacity-80">{{ day.lunar.displayText }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
