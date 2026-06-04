<template>
  <div class="forbidden-container">
    <div class="forbidden-card">
      <div class="icon-wrapper">
        <el-icon class="lock-icon">
          <Lock />
        </el-icon>
      </div>
      <h1>403</h1>
      <p class="title">访问被拒绝</p>
      <p class="description">抱歉，您没有权限访问该页面</p>
      <div class="actions">
        <el-button type="primary" @click="goBack">返回上一页</el-button>
        <el-button @click="goHome">返回首页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Lock } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.back()
}

function goHome() {
  const role = JSON.parse(localStorage.getItem('userRole') || '""')
  const homeMap = {
    admin: '/admin/dashboard',
    vendor: '/vendor/home',
    user: '/markets'
  }
  router.push(homeMap[role] || '/login')
}
</script>

<style scoped>
.forbidden-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.forbidden-card {
  text-align: center;
  padding: 60px 80px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.icon-wrapper {
  margin-bottom: 20px;
}

.lock-icon {
  font-size: 64px;
  color: #f56c6c;
}

h1 {
  font-size: 72px;
  color: #303133;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.title {
  font-size: 20px;
  color: #303133;
  margin: 0 0 8px 0;
}

.description {
  font-size: 14px;
  color: #909399;
  margin: 0 0 30px 0;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>