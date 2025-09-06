<template>
  <div class="">
    <!-- Display Mode -->
    <div v-if="!isEditing" @click="startEditing"
      class="w-fit flex items-center gap-2 px-2 cursor-pointer hover:bg-yellow-50 hover:border-yellow-300 border border-transparent rounded-lg transition-all duration-200 group">
      <el-icon color="#E6A23C" class="group-hover:!text-yellow-700 transition-colors">
        <InfoFilled />
      </el-icon>
      <span class="text-[#0072bc] group-hover:text-yellow-700 transition-colors select-none text-[14px] font-medium">
        {{ savedNote || 'Thêm ghi chú' }}
      </span>
    </div>


    <!-- Edit Mode -->
    <div v-else class="flex items-center p-1 border border-yellow-300 rounded-lg bg-yellow-50">
      <el-icon color="#E6A23C" class="flex-shrink-0 mr-1">
        <InfoFilled />
      </el-icon>

      <el-input ref="inputRef" v-model="noteText" placeholder="Nhập ghi chú..." size="default" class="flex-1 mr-2"
        @keydown.enter="saveNote" @keydown.esc="cancelEdit" />


      <el-button type="success" :icon="Check" circle @click="saveNote" />
      <el-button type="danger" :icon="Close" circle @click="cancelEdit" />

    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { InfoFilled, Check, Close } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  note: {
    type: [String, null],
    default: ''
  }
})

// Emits
const emit = defineEmits(['update'])

const isEditing = ref(false)
const noteText = ref('')
const savedNote = ref(props.note || '')
const inputRef = ref()

// Watch for prop changes
watch(() => props.note, (newNote) => {
  savedNote.value = newNote || ''
  // Tự động thoát khỏi chế độ editing khi prop note thay đổi (chuyển trip)
  if (isEditing.value) {
    isEditing.value = false
    noteText.value = savedNote.value
  }
}, { immediate: true })

const startEditing = () => {
  noteText.value = savedNote.value
  isEditing.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const saveNote = () => {
  savedNote.value = noteText.value.trim()
  isEditing.value = false
  // Emit update event to parent
  emit('update', savedNote.value)
}

const cancelEdit = () => {
  noteText.value = savedNote.value
  isEditing.value = false
}
</script>

<style scoped>
/* Custom styles để override Element Plus khi cần */
:deep(.el-input__wrapper) {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
}

:deep(.el-button.is-circle) {
  border: none !important;
}

/* Đảm bảo icon color được áp dụng đúng */
:deep(.el-icon) {
  transition: color 0.2s ease;
}
</style>