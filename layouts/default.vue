<script setup lang="ts">
import Header from '~/components/layout/Header.vue';
definePageMeta({
  middleware: ['auth'],
})
const useUserStore = userStore();
const officeStore = useOfficeStore();
onMounted(async () => {
    await useUserStore.loadUserInfo();
    await officeStore.loadOfficeStore();
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
