<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bell, Menu, Fold, ArrowLeft, ArrowRight, Refresh, User, QuestionFilled } from '@element-plus/icons-vue'
import BrandLogo from '@/components/BrandLogo.vue'
import { getRoleChildrenRoutes } from '@/router/asyncRoutes'
import { homePathForRole, isAdminRole } from '@/utils/roles'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import { useNotificationStore } from '@/store/modules/notification'
import { useUserMarketStore } from '@/store/modules/userMarket'
import { useAdminStore } from '@/store/modules/admin'
import { connectWebSocket, disconnectWebSocket } from '@/utils/websocket'
import { useDevice } from '@/composables/useDevice'
import { playBeep } from '@/utils/beep'

const route = useRoute()
const router = useRouter()
const app = useAppStore()
const user = useUserStore()
const notifications = useNotificationStore()
const cart = useUserMarketStore()
const admin = useAdminStore()
const { isDesktop } = useDevice()
const sidebarRef = ref(null)
const toggleRef = ref(null)
const closeNavRef = ref(null)
const trapNavFocus = event => {
  if (isDesktop.value) return
  const nodes = [...sidebarRef.value.querySelectorAll('a[href], button')].filter(node => node.getClientRects().length)
  if (event.shiftKey && document.activeElement === nodes[0]) { event.preventDefault(); nodes.at(-1)?.focus() }
  else if (!event.shiftKey && document.activeElement === nodes.at(-1)) { event.preventDefault(); nodes[0]?.focus() }
}
watch(() => app.sidebarCollapsed, async collapsed => {
  if (isDesktop.value) return
  await nextTick()
  if (!collapsed) closeNavRef.value?.focus()
  else toggleRef.value?.focus()
})
const role = computed(() => user.userInfo.role)
const roleLabel = computed(() => ({ user: '我的集市', vendor: '商户工作台', market_admin: '集市管理', super_admin: '平台管理' }[role.value]))
const home = computed(() => homePathForRole(role.value))
const messagePath = computed(() => isAdminRole(role.value) ? '/admin/messages' : '/messages')
const links = computed(() => getRoleChildrenRoutes(role.value).filter(item => !item.meta.hidden && !item.path.endsWith('messages')).map(item => ({ path: `/${item.path}`, title: item.meta.title, icon: item.meta.icon })))
const firstName = computed(() => (user.userInfo.nickname || user.userInfo.username || '我').slice(0, 1))
const mobileLinks = computed(() => role.value === 'user' ? links.value.filter(item => ['/markets','/cart','/orders'].includes(item.path)) : links.value.filter(item => ['/vendor/home','/vendor/goods','/vendor/orders'].includes(item.path)))
const detailPage = computed(() => route.meta.hidden)
const refreshUnread = () => notifications.fetchUnreadCount().catch(() => {})
let timer
watch(() => route.fullPath, () => { if (window.matchMedia('(max-width: 1024px)').matches) app.sidebarCollapsed = true })
const onEscape = event => { if (event.key === 'Escape' && window.matchMedia('(max-width: 1024px)').matches) app.sidebarCollapsed = true }
onMounted(() => {
  refreshUnread()
  timer = setInterval(refreshUnread, 30000)
  if (role.value === 'user') cart.fetchCart().catch(() => {})
  if (user.userInfo.id) connectWebSocket(user.userInfo.id, async () => {
    await refreshUnread()
    if (isAdminRole(role.value)) await admin.fetchApplies().catch(() => {})
    playBeep()
  })
  window.addEventListener('keydown', onEscape)
})
onUnmounted(() => { clearInterval(timer); disconnectWebSocket(); window.removeEventListener('keydown', onEscape) })
</script>

<template>
  <div class="workspace" :class="[{ 'is-collapsed': app.sidebarCollapsed }, role === 'user' ? 'user-layout-body' : role === 'vendor' ? 'vendor-layout-body' : 'admin-layout-body']">
    <a class="skip-link" href="#workspace-content">跳到主要内容</a>
    <button v-if="!app.sidebarCollapsed" class="workspace-backdrop" aria-label="关闭导航菜单" @click="app.sidebarCollapsed = true" />
    <aside ref="sidebarRef" @keydown.tab="trapNavFocus" class="workspace-sidebar" aria-label="工作区导航">
      <div class="workspace-brand"><BrandLogo light :to="home" /><span class="workspace-brand-mini"><BrandLogo light compact :to="home" /></span><button ref="closeNavRef" class="workspace-nav-close" aria-label="关闭导航" @click="app.sidebarCollapsed = true">×</button></div>
      <div class="workspace-switch"><span class="workspace-switch__icon">{{ roleLabel?.slice(0,1) }}</span><div><strong>{{ roleLabel }}</strong><small>智慧集市 · {{ role === 'user' ? '发现日常好物' : '让经营更有序' }}</small></div><span class="workspace-switch__dot" /></div>
      <span class="workspace-nav-label">{{ role === 'user' ? '探索与购物' : '工作空间' }}</span>
      <nav class="workspace-nav">
        <router-link v-for="link in links" :key="link.path" :to="link.path" :title="link.title"><component :is="link.icon" aria-hidden="true"/><span>{{ link.title }}</span><small v-if="link.path === '/cart' && cart.cartCount">{{ cart.cartCount }}</small></router-link>
      </nav>
      <span class="workspace-nav-label">账号与支持</span>
      <nav class="workspace-nav workspace-nav-secondary">
        <router-link :to="messagePath" title="消息中心"><Bell/><span>消息中心</span><small v-if="notifications.unreadCount">{{ notifications.unreadCount > 99 ? '99+' : notifications.unreadCount }}</small></router-link>
        <router-link to="/profile" title="个人中心"><User/><span>个人中心</span></router-link>
        <router-link to="/about" title="关于平台"><QuestionFilled/><span>关于平台</span></router-link>
      </nav>
      <router-link class="workspace-promo" to="/discover"><span>好物，值得被发现。</span><small>逛逛集市里的新鲜日常 <ArrowRight/></small></router-link>
      <router-link class="workspace-account" to="/profile"><span class="workspace-avatar"><img v-if="user.avatarFullUrl" :src="user.avatarFullUrl" alt="个人头像"/><span v-else>{{ firstName }}</span></span><span class="workspace-account-copy"><strong>{{ user.userInfo.nickname || user.userInfo.username }}</strong><small>{{ roleLabel }}</small></span><ArrowRight class="workspace-account-arrow"/></router-link>
    </aside>
    <div class="workspace-main" :inert="!isDesktop && !app.sidebarCollapsed">
      <header class="workspace-topbar">
        <div class="workspace-location"><button ref="toggleRef" class="workspace-icon-button" aria-label="切换导航菜单" :aria-expanded="!app.sidebarCollapsed" @click="app.toggleSidebar"><Menu v-if="app.sidebarCollapsed"/><Fold v-else/></button><span class="workspace-divider"/><router-link :to="home">{{ roleLabel }}</router-link><span class="workspace-crumb">/</span><strong>{{ route.meta.title || '集市' }}</strong></div>
        <div class="workspace-tools"><span class="workspace-date">{{ new Date().toLocaleDateString('zh-CN', {month:'long',day:'numeric',timeZone:'Asia/Shanghai'}) }}</span><button class="workspace-icon-button refresh-control" aria-label="刷新当前页面" title="刷新当前页面" @click="app.refresh"><Refresh/></button><router-link class="workspace-icon-button workspace-bell" :to="messagePath" aria-label="消息中心"><Bell/><i v-if="notifications.unreadCount"/></router-link><router-link class="workspace-avatar" to="/profile" aria-label="个人中心"><img v-if="user.avatarFullUrl" :src="user.avatarFullUrl" alt=""/><span v-else>{{ firstName }}</span></router-link></div>
      </header>
      <main id="workspace-content" class="workspace-content" tabindex="-1"><div class="workspace-canvas"><button v-if="detailPage" class="workspace-back" @click="router.back()"><ArrowLeft/>返回上一页</button><slot /></div><footer class="workspace-footer"><span>智慧集市 · 让每一份用心被看见</span><router-link to="/about">关于平台 ↗</router-link></footer></main>
      <nav v-if="!isAdminRole(role)" class="workspace-mobile-nav" aria-label="常用导航"><router-link v-for="link in mobileLinks" :key="link.path" :to="link.path"><component :is="link.icon"/><span>{{ link.title.replace('查看','').replace('管理','').replace('列表','') }}</span></router-link><router-link to="/profile"><User/><span>我的</span></router-link></nav>
    </div>
  </div>
</template>

<style scoped>
.workspace { --bg: var(--surface-page); --card-bg: #fff; --text: var(--ink-strong); --text-secondary: var(--ink); --text-muted: var(--ink-muted); --accent: var(--brand-primary); --accent-light: var(--brand-primary-soft); --border: var(--line); --green: var(--success); --green-bg: #edf6f0; --shadow: var(--shadow-sm); --shadow-hover: var(--shadow-md); --radius: var(--radius-md); display: flex; width: 100%; height: 100dvh; overflow: hidden; background: var(--surface-page); }
.workspace-sidebar { width: 236px; flex: none; display: flex; flex-direction: column; background: #172b26; padding: 30px 16px 0; color: #c6d3cd; overflow-y: auto; scrollbar-width: thin; transition: width .2s; }
.workspace-brand { padding: 0 8px 28px; }.workspace-brand-mini { display: none; }
.workspace-switch { display: flex; align-items: center; gap: 10px; padding: 13px 12px; border: 1px solid #ffffff13; border-radius: 10px; margin-bottom: 28px; background: #ffffff05; }
.workspace-switch__icon { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 7px; background: #ffffff12; color: #dbe8e1; font-size: 12px; flex: none; }.workspace-switch strong { display: block; font-size: 12px; font-weight: 500; color: #eef5f0; }.workspace-switch small { display: block; margin-top: 5px; font-size: 9px; color: #7f9b8f; }.workspace-switch__dot { width: 5px; height: 5px; margin-left: auto; background: #a7dfb9; border-radius: 50%; }
.workspace-nav-label { font-size: 10px; letter-spacing: .1em; padding: 0 12px; margin-bottom: 12px; color: #789387; }
.workspace-nav { display: grid; gap: 4px; margin-bottom: 27px; }.workspace-nav a { display: flex; align-items: center; gap: 12px; min-height: 43px; padding: 0 12px; border-radius: 8px; font-size: 13px; color: #b0c2b8; white-space: nowrap; }.workspace-nav a svg { width: 17px; height: 17px; flex: none; color: #8da99a; }.workspace-nav a:hover { background: #ffffff09; color: #fff; }.workspace-nav a.router-link-active { color: #e5f7ed; background: #315246; }.workspace-nav a.router-link-active svg { color: #b9e7cd; }.workspace-nav small { display: grid; place-items: center; margin-left: auto; min-width: 20px; padding: 3px 5px; border-radius: 4px; color: #d6eee0; background: #ffffff10; font-size: 10px; }
.workspace-nav-secondary { margin-bottom: 20px; }.workspace-promo { display: grid; gap: 9px; margin-top: auto; padding: 18px 13px; border: 1px solid #ffffff12; border-radius: 9px; color: #bdcec4; font-size: 12px; }.workspace-promo small { font-size: 10px; color: #7f9b8f; display: flex; align-items: center; justify-content: space-between; }.workspace-promo svg { width: 13px; height: 13px; }
.workspace-account { display: flex; align-items: center; gap: 11px; padding: 21px 4px; margin-top: 18px; border-top: 1px solid #ffffff12; }.workspace-avatar { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: #e3eee6; color: #355d47; flex: none; overflow: hidden; font-size: 12px; font-weight: 600; }.workspace-avatar img { width: 100%; height: 100%; object-fit: cover; }.workspace-account-copy { display: grid; gap: 5px; min-width: 0; }.workspace-account-copy strong { font-size: 12px; font-weight: 500; color: #dde9e1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.workspace-account-copy small { font-size: 10px; color: #789387; }.workspace-account-arrow { width: 13px; height: 13px; color: #789387; margin-left: auto; }
.workspace-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }.workspace-topbar { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 0 32px; min-height: 68px; background: #fff; border-bottom: 1px solid var(--line); flex: none; }.workspace-location { display: flex; align-items: center; gap: 16px; min-width: 0; font-size: 12px; }.workspace-location a, .workspace-crumb { color: var(--ink-muted); white-space: nowrap; }.workspace-location strong { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }.workspace-divider { width: 1px; height: 16px; background: var(--line); }
.workspace-icon-button { display: grid; place-items: center; width: 32px; height: 32px; padding: 7px; color: var(--ink-muted); border: 0; background: transparent; border-radius: 7px; cursor: pointer; flex: none; }.workspace-icon-button svg { width: 18px; height: 18px; }.workspace-icon-button:hover { color: var(--ink-strong); background: var(--surface-subtle); }.workspace-tools { display: flex; align-items: center; gap: 14px; }.workspace-date { font-size: 11px; color: var(--ink-muted); white-space: nowrap; }.workspace-bell { position: relative; }.workspace-bell i { position: absolute; width: 5px; height: 5px; top: 5px; right: 5px; border-radius: 50%; background: #bc8059; }
.workspace-content { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; padding: 34px 36px 0; outline: none; }.workspace-canvas { width: 100%; max-width: 1320px; margin: auto; min-height: calc(100% - 76px); }.workspace-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; max-width: 1320px; margin: 30px auto 0; padding: 23px 0; border-top: 1px solid var(--line); color: #98a29c; font-size: 10px; }.workspace-back { display: inline-flex; align-items: center; gap: 8px; border: 0; background: transparent; padding: 0; margin-bottom: 22px; font-size: 12px; color: var(--ink-muted); }.workspace-back svg { width: 14px; height: 14px; }
.workspace-backdrop, .workspace-mobile-nav, .workspace-nav-close { display: none; }.skip-link { position: fixed; top: -60px; left: 20px; z-index: 3000; background: #fff; color: var(--brand-primary); padding: 12px; border-radius: 6px; }.skip-link:focus { top: 12px; }
@media(min-width:1025px) { .is-collapsed .workspace-sidebar { width: 76px; padding-inline: 12px; }.is-collapsed .workspace-brand { padding-inline: 7px; }.is-collapsed .workspace-brand > .brand-logo { display: none; }.is-collapsed .workspace-brand-mini { display: block; }.is-collapsed .workspace-switch, .is-collapsed .workspace-nav-label, .is-collapsed .workspace-nav a span, .is-collapsed .workspace-nav a small, .is-collapsed .workspace-promo, .is-collapsed .workspace-account-copy, .is-collapsed .workspace-account-arrow { display: none; }.is-collapsed .workspace-nav a { justify-content: center; padding: 0; }.is-collapsed .workspace-account { margin-top: auto; justify-content: center; } }
@media(max-width:1024px) { .workspace-brand { display: flex; align-items: center; justify-content: space-between; gap: 20px; }.workspace-nav-close { display: grid; place-items: center; width: 26px; height: 26px; padding: 0; border: 0; background: #ffffff0c; color: #b9ccbc; border-radius: 5px; font-size: 21px; } .workspace-sidebar { position: fixed; inset: 0 auto 0 0; z-index: 1201; width: 250px; box-shadow: 20px 0 60px #10251e30; }.is-collapsed .workspace-sidebar { display: none; }.workspace-backdrop { display: block; position: fixed; inset: 0; border: 0; background: #15251f66; z-index: 1200; }.workspace-topbar { padding-inline: 24px; }.workspace-content { padding: 28px 24px 0; } }
@media(max-width:767px) { .workspace-topbar { min-height: 60px; gap: 10px; padding: 0 16px; }.workspace-location { gap: 10px; }.workspace-location > a, .workspace-crumb, .workspace-date, .refresh-control { display: none; }.workspace-tools { gap: 10px; }.workspace-content { padding: 24px 18px 0; }.workspace-footer { font-size: 9px; margin-top: 24px; gap: 10px; }.workspace-mobile-nav { display: flex; flex: none; justify-content: space-around; padding: 10px 10px max(10px, env(safe-area-inset-bottom)); border-top: 1px solid var(--line); background: #fff; }.workspace-mobile-nav a { display: grid; justify-items: center; gap: 5px; color: var(--ink-muted); font-size: 10px; padding: 2px 10px; }.workspace-mobile-nav svg { width: 19px; height: 19px; }.workspace-mobile-nav a.router-link-active { color: var(--brand-primary); } }
</style>
