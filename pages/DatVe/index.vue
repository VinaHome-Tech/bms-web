
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
    <el-container class="trip-layout">
      <el-aside class="sidebar">
        <SidebarFilter />
      </el-aside>

      <el-container class="content">
        <el-header>
          <TripHeader />
        </el-header>
        <el-main>
          <TripContent />
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
/* Desktop mặc định */
.trip-layout {
  display: flex;
  flex-direction: row;
}

/* Sidebar */
.sidebar {
  width: 300px;
  min-width: 300px;
}

/* Content */
.content {
  flex: 1;
}

/* 📱 Mobile */
@media (max-width: 768px) {
  .trip-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
  }

  .el-aside {
    width: 100% !important;
  }

  .content {
    width: 100%;
  }
}

</style>