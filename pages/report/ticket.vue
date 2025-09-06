<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import RP1 from '@/components/reports/RP1.vue'
import RP2 from '@/components/reports/RP2.vue'
const useUserStore = userStore();
const reportComponents: Record<string, any> = {
    RP1,
    RP2,
}
const currentComponent = computed(() => {
    return reportComponents[ value.value ] || null
})
const value = ref('')

const options = [
    {
        value: 'RP1',
        label: 'RP 1: Báo cáo vé theo chuyến',
    },
    {
        value: 'RP2',
        label: 'RP 2: Báo cáo vé theo tháng',
    }
]
onMounted(() => {
    useUserStore.loadUserInfo();
})
</script>
<template>
    <section>
        <div class="flex items-center gap-4">
            <h3 class="text-base font-medium pb-1">Mẫu báo cáo vé:</h3>
            <el-select v-model="value" placeholder="Chọn báo cáo" style="width: 20%" clearable>
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
        </div>
        <div class="mt-4">
            <component :is="currentComponent" v-if="currentComponent" :company-id="useUserStore.company_id"/>
        </div>
    </section>
</template>