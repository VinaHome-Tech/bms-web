<script setup lang="ts">
import Header from '~/components/layout/Header.vue';
const useUserStore = userStore();
const officeStore = useOfficeStore();
const companyStore = useCompanyStore();
onMounted(async () => {
    await useUserStore.loadUserInfo();
    await officeStore.loadOfficeStore();
    await companyStore.loadCompanyStore();
});
</script>
<template>
    <div class=" bg-gray-100">
        <Header/>

        <section class="p-2 mt-[60px]">
            <slot />
        </section>
    </div>
</template>
