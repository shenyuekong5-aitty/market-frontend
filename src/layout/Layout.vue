<template>
  <div class="layout">
    <Aside />
    <div class="right-container">
      <TopBar />
      <Main />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import Aside from './Aside/index.vue'
import TopBar from './TopBar/index.vue'
import Main from './Main/index.vue'

const appStore = useAppStore()

// 根据折叠状态选择宽度
const asideWidth = computed(() => {
  return appStore.sidebarCollapsed ? 'var(--aside-collapsed-width)' : 'var(--aside-width)'
})
</script>

<style scoped>
.layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.right-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), margin-left 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@media (max-width: 768px) {
  .layout {
    --aside-width: 0px; 
  }
}
</style>