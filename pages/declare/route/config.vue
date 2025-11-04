<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus'

const ruleFormRef = ref<FormInstance>()
const route = useRoute();
const routeId = route.query.route_id as string;
const routeName = route.query.route_name as string;

const dialogVisible = ref(false)
const handleOpenDialog = () => {
    dialogVisible.value = true
}
const handleClose = (done: () => void) => {
    done()
}
const ruleForm = reactive({
  pass: '',
  checkPass: '',
  age: '',
})
</script>
<template>
    <section>
        <div class="flex justify-between items-center mb-4">
            <!-- <h3 class="text-xl font-semibold">Cấu hình tuyến: {{ decodeURIComponent(routeName) }}</h3> -->
            <el-button type="primary" :icon="Plus" @click="handleOpenDialog">Thêm cấu hình</el-button>
        </div>
        <div>
            <el-table style="width: 100%">
                <el-table-column>
                    <template #header>
                        <span>Tên cấu hình</span>
                    </template>
                </el-table-column>
                <el-table-column>
                    <template #header>
                        <span>Thời gian</span>
                    </template>
                </el-table-column>
                <el-table-column>
                    <template #header>
                        <span>Sơ đồ ghế</span>
                    </template>
                </el-table-column>
                <el-table-column>
                    <template #header>
                        <span>Thông tin</span>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <el-dialog v-model="dialogVisible" width="800" :before-close="handleClose" style="padding: 0px;">
            <template #header>
                <div class="pt-[10px] pl-2">
                    <span class="text-[16px] font-semibold text-white">
                        Cấu hình
                    </span>
                </div>
            </template>
            <div>
                <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" status-icon
                    label-width="auto" class="demo-ruleForm">
                    <h3 class="text-base font-medium">PHẠM VI ÁP DỤNG</h3>
                    <el-form-item label="Password" prop="pass">
                        <el-input v-model="ruleForm.pass" type="password" autocomplete="off" />
                    </el-form-item>
                    <h3 class="text-base font-medium">THỜI GIAN ÁP DỤNG</h3>
                    <el-form-item label="Confirm" prop="checkPass">
                        <el-input v-model="ruleForm.checkPass" type="password" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="Age" prop="age">
                        <el-input v-model.number="ruleForm.age" />
                    </el-form-item>
                </el-form>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogVisible = false">Thoát</el-button>
                    <el-button type="primary" @click="dialogVisible = false">
                        Xác nhận
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </section>
</template>