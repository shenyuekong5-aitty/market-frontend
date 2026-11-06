<template><StatusPage code="404" title="走错路了，换个方向吧。" description="这个页面不存在或已经移走。回到集市，继续发现身边的好物。"><router-link to="/" class="btn-primary">返回集市</router-link><button @click="goBack">返回上一页</button></StatusPage></template>
<script setup>
import StatusPage from '@/components/StatusPage.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.back()
}
</script>
