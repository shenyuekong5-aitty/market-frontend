<script setup>
import BrandLogo from '@/components/BrandLogo.vue'
import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { homePathForRole } from '@/utils/roles'

const userStore = useUserStore()
const entryPath = computed(() => userStore.isLoggedIn ? homePathForRole(userStore.userInfo.role) : '/login')
</script>

<template>
  <header class="public-header">
    <div class="public-header__inner">
      <BrandLogo />
      <nav aria-label="公共页面导航">
        <router-link to="/welcome">首页</router-link>
        <router-link to="/discover">发现好物</router-link>
        <router-link to="/about">关于集市</router-link>
      </nav>
      <router-link class="public-header__entry" :to="entryPath">{{ userStore.isLoggedIn ? '进入集市' : '登录 / 注册' }}<span aria-hidden="true">↗</span></router-link>
    </div>
  </header>
</template>

<style scoped>
.public-header { background: #fcfdf9; border-bottom: 1px solid var(--line); }
.public-header__inner { width: min(100% - 96px, 1200px); min-height: 80px; margin: auto; display: flex; align-items: center; gap: 48px; }
nav { display: flex; align-self: stretch; align-items: stretch; gap: 32px; margin: auto; }
nav a { display: flex; align-items: center; position: relative; font-size: 14px; color: var(--ink-muted); }
nav a:hover, nav a.router-link-exact-active { color: var(--brand-primary); }
nav a.router-link-exact-active::after { content: ''; position: absolute; bottom: -1px; height: 2px; left: 0; right: 0; background: var(--brand-primary); }
.public-header__entry { display: inline-flex; align-items: center; justify-content: center; gap: 18px; min-height: 40px; padding: 0 18px; border: 1px solid var(--brand-primary); background: var(--brand-primary); border-radius: 7px; font-size: 12px; color: #fff; white-space: nowrap; }
.public-header__entry:hover { background: var(--brand-primary-hover); border-color: var(--brand-primary-hover); }
@media (max-width: 767px) { .public-header__inner { width: calc(100% - 40px); min-height: 68px; padding-top: 16px; flex-wrap: wrap; gap: 0; justify-content: space-between; } .public-header__entry { gap: 8px; padding: 0 12px; min-height: 36px; font-size: 12px; } nav { order: 3; width: 100%; gap: 28px; margin-top: 12px; } nav a { padding: 0 0 14px; font-size: 13px; } }
</style>
