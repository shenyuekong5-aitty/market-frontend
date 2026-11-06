<template><StatusPage code="403" title="这个空间暂时无法进入。" description="当前账号没有此页面的访问权限，请返回你的集市空间。"><button class="btn-primary" @click="goHome">返回我的空间</button><button @click="goBack">返回上一页</button></StatusPage></template>
<script setup>
import StatusPage from '@/components/StatusPage.vue'
import { Lock } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.back()
}

function goHome() {
  const role = JSON.parse(localStorage.getItem('userInfo') || '{}').role
  const homeMap = {
    super_admin: '/admin/manage',
    market_admin: '/admin/dashboard',
    vendor: '/vendor/home',
    user: '/markets'
  }
  router.push(homeMap[role] || '/login')
}
</script>
