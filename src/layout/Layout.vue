<template>
  <div class="layout">
    <Admin v-if="showAdmin"/>
    <Vendor v-else-if="showVendor">
      <router-view />
    </Vendor>
    <User v-else-if="showUser">
      <router-view />
    </User>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'
import Admin from "./admin/index.vue"
import Vendor from "./vendor/index.vue"
import User from "./user/index.vue"

const userStore = useUserStore()


// 根据不同的角色显示不同的面板
const showAdmin = computed(() => {
  return userStore.userInfo.role === 'admin'
})
const showVendor = computed(() => {
  return userStore.userInfo.role === 'vendor'
})
const showUser = computed(() => {
  return userStore.userInfo.role === 'user'
})

</script>

<style scoped>
.layout {
  display: flex;
  width: 100%;
  min-width: 0;
  height: 100vh;
  overflow: hidden;
}

</style>
