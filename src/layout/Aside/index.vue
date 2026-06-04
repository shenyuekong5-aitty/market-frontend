<template>
  <aside class="aside">侧边栏</aside>
</template>

<style scoped>
.aside {
  width: var(--aside-width); 
  
  background-color: #2c3e50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  transition: width 0.3s ease; 
  overflow: hidden; 
}
</style>