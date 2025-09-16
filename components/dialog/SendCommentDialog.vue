<script setup lang="ts">
import { ref } from 'vue'
import { Checked } from '@element-plus/icons-vue'
const visible = ref(false)
const comment = ref('')

const handleClose = () => {
    visible.value = false
}

const handleSendComment = () => {
    console.log('Sending comment:', comment.value)
    // Add your send comment logic here
}

</script>
<template>
    <el-dialog v-model="visible" width="500" @close="handleClose" style="padding: 0px;">
        <template #header>
            <div class="pt-[10px] pl-2">
                <span class="text-[16px] font-semibold text-white">Gửi ý kiến đóng góp</span>
            </div>
        </template>
        <div class="px-2 pt-2">
            <h3 class="text-[15px] font-semibold">Bạn có góp ý gì thêm cho VinaHome không?</h3>
            <el-input
                type="textarea"
                v-model="comment"
                placeholder="Góp ý cải thiện trải nghiệm trên phần mềm..."
                :rows="6"
                class="w-full mt-2"
            />
        </div>
        <template #footer>
            <div class="flex justify-end p-2">
                <el-button color="#0072bc" :icon="Checked" @click="handleSendComment" :disabled="!comment">
                   Gửi góp ý
                </el-button>

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