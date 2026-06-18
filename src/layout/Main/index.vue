<template>
  <main class="main">
    <div class="content">
      <!-- 二级路由 -->
      <router-view />
    </div>
  </main>
</template>

<style scoped>
.main {
  flex: 1; 
  
  padding: 20px;
  box-sizing: border-box; 
  overflow-y: auto; 
}

.content {
  width: 100%;
  height: 100%;
}
</style>