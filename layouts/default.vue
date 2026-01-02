<script setup lang="ts">
import Header from '~/components/layout/Header.vue';
definePageMeta({
  middleware: ['auth'],
})
const useUserStore = userStore();
const useOfficeStore = officeStore();
onMounted(async () => {
    await useUserStore.loadUserInfo();
    await useOfficeStore.loadOfficeStore();
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
