
<script setup lang="ts">
import SidebarFilter from '~/components/widgets/SidebarFilter.vue'
import TripHeader from '~/components/widgets/TripHeader.vue'
import TripContent from '~/components/widgets/TripContent.vue'
definePageMeta({
    layout: 'default',
})

</script>

<template>
    <section>
        <el-container>
            <el-aside >
                <SidebarFilter />
            </el-aside>
            <el-container>
                <el-header>
                    <TripHeader />
                </el-header>
                <el-main>
                    <TripContent/>
                </el-main>
            </el-container>
        </el-container>
    </section>

</template>

<style scoped>
.el-header {
  padding: 0px;
  margin-left: 0.25rem;
}

.el-main {
  padding: 0px;
  margin-left: 0.25rem;
}

.icon-ele {
  margin: 0 8px 0 auto;
  color: #409eff;
}

.el-header {
  height: auto !important;
}

.el-collapse {
  border-top: none !important;
}
</style>