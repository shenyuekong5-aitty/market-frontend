<template>
  <aside class="aside">
    <el-menu
      :default-active="activeMenu"
      :collapse="appStore.sidebarCollapsed"
      background-color="#2c3e50"
      text-color="#bfcbd9"
      active-text-color="#409eff"
      router
      class="aside-menu"
    >
      <MenuItem
        v-for="route in menuRoutes"
        :key="route.path"
        :item="route"
      />
    </el-menu>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'
import { getRoleChildrenRoutes } from '@/router/asyncRoutes'
import MenuItem from './MenuItem.vue'

const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

const menuRoutes = computed(() => {
  const role = userStore.userInfo.role
  return getRoleChildrenRoutes(role)
})

const activeMenu = computed(() => route.path)
</script>

<style scoped>
/* 原有样式基础上修改 */
.aside {
  width: var(--aside-width, 220px);
  background-color: #2c3e50;
  color: white;
  flex-shrink: 0;
  transition: width 0.3s ease;
  overflow: hidden;
  /* 移除原来的居中布局，改为让 el-menu 自然填充 */
  display: block;
  height: 100vh;
}

.aside-menu {
  height: 100%;
  border-right: none;
}

/* Element Plus 折叠后的宽度默认是 64px */
.aside-menu.el-menu--collapse {
  width: 64px;
}
</style>