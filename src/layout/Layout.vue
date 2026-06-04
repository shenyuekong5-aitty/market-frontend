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
import Aside from './Aside/index.vue'
import TopBar from './TopBar/index.vue'
import Main from './Main/index.vue'
</script>

<style scoped>
.layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  --topbar-height: 160px;
  --aside-width: 220px;
}

.right-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

@media (max-width: 768px) {
  .layout {
    --aside-width: 0px; 
  }
}
</style>