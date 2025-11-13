<script setup lang="ts">
import { computed, ref, nextTick } from 'vue';
import {
    Edit
} from '@element-plus/icons-vue'
const props = defineProps<{
    modelValue: string | null | undefined;
    prop: string;
    label: string;
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>()

const isFocused = ref(false);
const isHovered = ref(false);
const textareaRef = ref();

const inputValue = computed({
    get: () => props.modelValue,
    set: (val: string | null) => {
        if (val !== null) {
            emit('update:modelValue', val);
        } else {
            emit('update:modelValue', '');
        }
    }
});

const handleFocus = async () => {
    isFocused.value = true;
    // Auto focus vào textarea sau khi render
    await nextTick();
    if (textareaRef.value) {
        textareaRef.value.focus();
    }
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

        <div class="input-container" :class="{
            'hovered': isHovered,
            'focused': isFocused
        }" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
            <!-- Input hiển thị khi không focus -->
            <el-input size="large" v-if="!isFocused" v-model="inputValue" @focus="handleFocus"
                class="transition-all duration-300 ease-in-out" placeholder="Vui lòng nhập">
                <!-- Custom prefix icon slot nếu cần -->
                <template #prefix>
                    <el-icon class="input-icon">
                        <Edit />
                    </el-icon>
                </template>
            </el-input>

            <!-- Textarea hiển thị khi focus (không có icon) -->
            <el-input v-else v-model="inputValue" placeholder="Vui lòng nhập" type="textarea" :autosize="{ minRows: 3, maxRows: 6 }"
                @blur="handleBlur" ref="textareaRef" class="transition-all duration-300 ease-in-out" />
        </div>
    </el-form-item>
</template>

<style scoped>
.input-container {
    position: relative;
    width: 100%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-container.hovered {
    transform: translateY(-1px);
}

.input-container.hovered :deep(.el-input__wrapper) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #409eff;
}

.input-container.focused :deep(.el-input__wrapper),
.input-container.focused :deep(.el-textarea__inner) {
    box-shadow: 0 6px 20px rgba(64, 158, 255, 0.2);
    border-color: #409eff;
    transform: scale(1.02);
}

/* Hover effect cho input */
.input-container :deep(.el-input__wrapper) {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-container :deep(.el-textarea__inner) {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Glow effect khi hover */
.input-container.hovered::before {
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

.input-container:not(.hovered)::before {
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
.input-icon {
    color: #a8abb2;
    transition: color 0.3s ease;
}

.input-container.hovered .input-icon,
.input-container.focused .input-icon {
    color: #409eff;
}

/* Prefix icon animation */
.input-container :deep(.el-input__prefix) {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-container.hovered :deep(.el-input__prefix) {
    transform: scale(1.1);
}

/* Full width cho input và textarea */
.input-container :deep(.el-input),
.input-container :deep(.el-textarea) {
    width: 100%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-container :deep(.el-input__wrapper),
.input-container :deep(.el-textarea__inner) {
    width: 100%;
}
</style>