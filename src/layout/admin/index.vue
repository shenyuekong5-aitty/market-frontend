<template>
    <div class="container">
        <Aside />
        <div class="right-container">
            <TopBar />
            <Main />
        </div>
    </div>
</template>

<script setup>
import Aside from '../Aside/index.vue'
import TopBar from '../TopBar/index.vue'
import Main from '../Main/index.vue'
</script>

<style scoped>
.container {
  display: flex;
  width: 100%;
  min-width: 0;
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

</style>
