<template>
  <main class="main">
    <div class="content">
      <router-view />
    </div>
  </main>
</template>

<style scoped>
.main {
  flex: 1; 
  
  background-color: pink;
  padding: 20px;
  box-sizing: border-box; 
  overflow-y: auto; 
}

.content {
  width: 100%;
  height: 100%;
}
</style>