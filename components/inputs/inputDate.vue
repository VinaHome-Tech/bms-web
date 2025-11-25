    <script setup lang="ts">
    import { computed, ref } from 'vue';


    const props = defineProps<{
        modelValue: string | Date | null | undefined;
        prop: string;
        label: string;
        placeholder?: string;
        type?: 'date' | 'datetime' | 'daterange' | 'datetimerange' | 'month' | 'year';
        format?: string;
        valueFormat?: string;
        disabledDate?: (date: Date) => boolean;
        clearable?: boolean;
    }>()

    const emit = defineEmits<{
        (e: 'update:modelValue', value: string | Date | null): void;
    }>()

    const isFocused = ref(false);
    const isHovered = ref(false);

    const inputValue = computed({
        get: () => props.modelValue === null ? '' : props.modelValue,
        set: (val: string | Date | null) => {
            emit('update:modelValue', val === '' ? null : val);
        }
    });

    const handleFocus = () => {
        isFocused.value = true;
    };

    const handleBlur = () => {
        isFocused.value = false;
    };

    const handleMouseEnter = () => {
        isHovered.value = true;
    };

    const handleMouseLeave = () => {
        isHovered.value = false;
    };
    </script>

    <template>
        <el-form-item :prop="prop" label-position="top">
            <template #label>
                <label class="text-sm font-medium text-gray-700">{{ label }}</label>
            </template>

            <div class="datepicker-container" :class="{
                'hovered': isHovered,
                'focused': isFocused
            }" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
                <el-date-picker v-model="inputValue" :type="type || 'date'" :placeholder="placeholder || 'Chọn ngày'"
                    :format="format" :value-format="valueFormat" :disabled-date="disabledDate"
                    :clearable="clearable !== false" size="large" @focus="handleFocus" @blur="handleBlur"
                    class="transition-all duration-300 ease-in-out" style="width: 100%"  />
            </div>
        </el-form-item>
    </template>

<style scoped>
.datepicker-container {
    position: relative;
    width: 100%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.datepicker-container.hovered {
    transform: translateY(-1px);
}

.datepicker-container.hovered :deep(.el-date-editor) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #409eff;
}

.datepicker-container.focused :deep(.el-date-editor) {
    box-shadow: 0 6px 20px rgba(64, 158, 255, 0.2);
    border-color: #409eff;
    transform: scale(1.02);
}

/* Hover effect cho datepicker */
.datepicker-container :deep(.el-date-editor) {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
}

/* Glow effect khi hover */
.datepicker-container.hovered::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg,
            rgba(64, 158, 255, 0.1),
            rgba(64, 158, 255, 0.05),
            rgba(64, 158, 255, 0.1));
    border-radius: 6px;
    z-index: -1;
    opacity: 0;
    animation: glow-fade-in 0.3s ease-in-out forwards;
}

.datepicker-container:not(.hovered)::before {
    animation: glow-fade-out 0.3s ease-in-out forwards;
}

@keyframes glow-fade-in {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes glow-fade-out {
    from {
        opacity: 1;
        transform: scale(1);
    }

    to {
        opacity: 0;
        transform: scale(0.95);
    }
}

/* Icon styling */
.datepicker-icon {
    color: #a8abb2;
    transition: color 0.3s ease;
}

.datepicker-container.hovered .datepicker-icon,
.datepicker-container.focused .datepicker-icon {
    color: #409eff;
}

/* Prefix icon animation */
.datepicker-container :deep(.el-input__prefix) {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.datepicker-container.hovered :deep(.el-input__prefix) {
    transform: scale(1.1);
}

/* Calendar icon styling */
.datepicker-container :deep(.el-input__suffix .el-icon) {
    color: #a8abb2;
    transition: all 0.3s ease;
}

.datepicker-container.hovered :deep(.el-input__suffix .el-icon),
.datepicker-container.focused :deep(.el-input__suffix .el-icon) {
    color: #409eff;
    transform: scale(1.1);
}

/* Full width cho datepicker */
.datepicker-container :deep(.el-date-editor) {
    width: 100% !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom styling cho picker panel khi mở */
:deep(.el-picker-panel) {
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border: 1px solid #e4e7ed;
}

/* Animation cho picker dropdown */
:deep(.el-picker__popper) {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Đảm bảo date cells hiển thị đúng */
:deep(.el-date-table td) {
    text-align: center;
    cursor: pointer;
    position: relative;
}

:deep(.el-date-table td span) {
    width: 24px;
    height: 24px;
    display: block;
    margin: 0 auto;
    line-height: 24px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 50%;
}

:deep(.el-date-table td.available) {
    color: #606266;
}

:deep(.el-date-table td.available:hover) {
    color: #409eff;
}

:deep(.el-date-table td.available:hover span) {
    background-color: rgba(64, 158, 255, 0.1);
}

/* Today highlight */
:deep(.el-date-table td.today span) {
    background-color: rgba(64, 158, 255, 0.2);
    color: #409eff;
    font-weight: 600;
}

/* Selected date styling */
:deep(.el-date-table td.selected span) {
    background-color: #409eff !important;
    color: #fff !important;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

/* Disabled dates */
:deep(.el-date-table td.disabled) {
    color: #c0c4cc;
    cursor: not-allowed;
}

/* Prev/Next month dates */
:deep(.el-date-table td.prev-month,
    .el-date-table td.next-month) {
    color: #c0c4cc;
}

/* Header styling */
:deep(.el-date-picker__header) {
    margin: 12px;
    text-align: center;
}

:deep(.el-date-picker__header-label) {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
}

/* Week header */
:deep(.el-date-table th) {
    padding: 5px;
    color: #606266;
    font-weight: 500;
    border-bottom: solid 1px #ebeef5;
}

/* Input focus state */
.datepicker-container :deep(.el-date-editor.is-active) {
    border-color: #409eff;
}

/* Clear button animation */
.datepicker-container :deep(.el-input__suffix .el-input__clear) {
    transition: all 0.2s ease;
}

.datepicker-container.hovered :deep(.el-input__suffix .el-input__clear:hover) {
    background-color: rgba(64, 158, 255, 0.1);
    color: #409eff;
}
</style>