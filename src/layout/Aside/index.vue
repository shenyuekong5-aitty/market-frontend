<template>
  <div
    v-if="!appStore.sidebarCollapsed"
    class="aside-backdrop"
    aria-hidden="true"
    @click="appStore.toggleSidebar"
  />
  <aside class="aside" :class="{ 'is-open': !appStore.sidebarCollapsed }">
    <el-menu
      :default-active="activeMenu"
      :collapse="appStore.sidebarCollapsed"
      background-color="var(--ink-strong)"
      text-color="#b9cbd0"
      active-text-color="#ffffff"
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
import { useAdminStore } from '@/store/modules/admin'  // 新增
import { getRoleChildrenRoutes } from '@/router/asyncRoutes'
import MenuItem from './MenuItem.vue'
import { isAdminRole } from '@/utils/roles'

const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()
const adminStore = useAdminStore()  

const menuRoutes = computed(() => {
  const role = userStore.userInfo.role
  //获取动态路由辅助函数
  let roleRoutes = getRoleChildrenRoutes(role)

  // 1. 过滤掉 hidden: true 的菜单项
  roleRoutes = roleRoutes.filter(item => !item.meta?.hidden)

  // 2. 如果是管理员，将「集市详情」的路径替换为实际集市ID
  if (isAdminRole(role)) {
    const marketId = adminStore.market?.id
    roleRoutes = roleRoutes.map(route => {
      if (route.name === 'AdminMarketDetail' && marketId) {
        return {
          ...route,
          path: `admin/market/${marketId}`  // 替换动态参数
        }
      }
      return route
    })
  }

  // 追加所有角色共有的 Profile 路由
  const profileRoute = {
    path: 'profile',
    name: 'Profile',
    meta: { title: '个人信息', icon: 'User' }
  }

  return [...roleRoutes, profileRoute]
})

const activeMenu = computed(() => route.path)
</script>

<style scoped>
.aside {
  width: v-bind('appStore.sidebarCollapsed ? "64px" : "var(--aside-width, 220px)"');
  background-color: #2c3e50;
  color: white;
  flex-shrink: 0;
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  /* 移除原来的居中布局，改为让 el-menu 自然填充 */
  display: block;
  height: 100vh;
}

.aside-menu {
  height: 100%;
  border-right: none;
  /* 解决 el-menu 折叠动画时文字卡顿突变的问题 */
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.aside-menu:not(.el-menu--collapse) {
  width: var(--aside-width, 220px);
}

/* Element Plus 折叠后的宽度默认是 64px */
.aside-menu.el-menu--collapse {
  width: 64px;
}

.aside-backdrop {
  display: none;
}

@media (max-width: 1024px) {
  .aside {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 1100;
    width: 248px !important;
    height: 100dvh;
    transform: translateX(-102%);
    box-shadow: 18px 0 45px rgba(14, 39, 45, .18);
    transition: transform .24s ease;
  }

  .aside.is-open {
    transform: translateX(0);
  }

  .aside-menu,
  .aside-menu:not(.el-menu--collapse),
  .aside-menu.el-menu--collapse {
    width: 248px !important;
  }

  .aside-menu.el-menu--collapse .el-menu-item,
  .aside-menu.el-menu--collapse .el-sub-menu__title {
    padding-left: 22px !important;
  }

  .aside-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 1099;
    background: rgba(24, 49, 59, .38);
    backdrop-filter: blur(2px);
  }
}
</style>
