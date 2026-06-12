<template>
  <div class="not-found">
    <div class="content">
      <h1 class="code">404</h1>
      <p class="message">抱歉，你访问的页面不存在</p>
      <router-link to="/" class="home-link">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
// 可根据需要添加逻辑，例如自动跳转等
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f7fa;
  font-family: system-ui, -apple-system, sans-serif;
}

.content {
  text-align: center;
}

.code {
  font-size: 6rem;
  font-weight: 800;
  color: #2c3e50;
  margin: 0;
  line-height: 1;
}

.message {
  font-size: 1.2rem;
  color: #666;
  margin: 16px 0 32px;
}

.home-link {
  display: inline-block;
  padding: 10px 24px;
  background: #409eff;
  color: #fff;
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.3s;
}

.home-link:hover {
  background: #337ecc;
}
</style>