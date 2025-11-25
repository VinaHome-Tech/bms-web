<script setup lang="ts">
import { computed, ref } from 'vue';
import {
    Edit
} from '@element-plus/icons-vue'

interface Option {
    label: string;
    value: string | number;
}

const props = defineProps<{
    modelValue: string | number | null | undefined;
    prop: string;
    label: string;
    options: Option[];
    multiple?: boolean;
    clearable?: boolean;
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number | null): void;
}>()

const isFocused = ref(false);
const isHovered = ref(false);

const inputValue = computed<string | number | undefined>({
    get: () => (props.modelValue === null ? undefined : props.modelValue),
    set: (val: string | number | undefined) => {
        emit('update:modelValue', val === undefined ? '' : val);
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

        <div class="select-container" :class="{
            'hovered': isHovered,
            'focused': isFocused
        }" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
            <el-select 
                v-model="inputValue" 
                placeholder="Vui lòng chọn"
                size="large"
                :multiple="multiple"
                :clearable="clearable"
                @focus="handleFocus"
                @blur="handleBlur"
                class="transition-all duration-300 ease-in-out w-full"
            >
                <!-- Custom prefix icon slot -->
                <template #prefix>
                    <el-icon class="select-icon">
                        <Edit />
                    </el-icon>
                </template>
                
                <el-option
                    v-for="option in options"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                />
            </el-select>
        </div>
    </el-form-item>
</template>

<style scoped>
.select-container {
    position: relative;
    width: 100%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.select-container.hovered {
    transform: translateY(-1px);
}

.select-container.hovered :deep(.el-select__wrapper) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #409eff;
}

.select-container.focused :deep(.el-select__wrapper) {
    box-shadow: 0 6px 20px rgba(64, 158, 255, 0.2);
    border-color: #409eff;
    transform: scale(1.02);
}

/* Hover effect cho select */
.select-container :deep(.el-select__wrapper) {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Glow effect khi hover */
.select-container.hovered::before {
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

.select-container:not(.hovered)::before {
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
.select-icon {
    color: #a8abb2;
    transition: color 0.3s ease;
}

.select-container.hovered .select-icon,
.select-container.focused .select-icon {
    color: #409eff;
}

/* Prefix icon animation */
.select-container :deep(.el-select__prefix) {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.select-container.hovered :deep(.el-select__prefix) {
    transform: scale(1.1);
}

/* Full width cho select */
.select-container :deep(.el-select) {
    width: 100%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.select-container :deep(.el-select__wrapper) {
    width: 100%;
}

/* Custom styling cho dropdown */
.select-container :deep(.el-select-dropdown) {
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border: 1px solid #e4e7ed;
}

.select-container :deep(.el-select-dropdown__item) {
    transition: all 0.2s ease;
}

.select-container :deep(.el-select-dropdown__item:hover) {
    background-color: rgba(64, 158, 255, 0.1);
    color: #409eff;
}

/* Animation cho arrow icon */
.select-container.focused :deep(.el-select__caret) {
    transform: rotate(180deg);
    transition: transform 0.3s ease;
}

.select-container :deep(.el-select__caret) {
    transition: transform 0.3s ease;
}
</style>