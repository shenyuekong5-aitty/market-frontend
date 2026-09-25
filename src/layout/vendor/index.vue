<template>
  <div class="vendor-layout-body">
    <!-- ===== 顶部导航 ===== -->
    <header class="top-nav">
      <div class="brand">
        <span class="brand-mark">
          <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
            <path d="M4 32L24 10L44 32" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M24 10L24 38" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M14 32L34 32" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <rect x="18" y="26" width="12" height="6" rx="1" stroke="currentColor" stroke-width="2"/>
            <circle cx="21" cy="29" r="1" fill="currentColor"/>
            <circle cx="27" cy="29" r="1" fill="currentColor"/>
          </svg>
        </span>
        <span>智慧集市</span>
        <span class="brand-badge">小贩</span>
      </div>

      <div class="nav-spacer"></div>

      <div class="nav-actions">
        <router-link to="/messages" class="nav-btn" title="消息">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span class="badge-num" v-if="notificationStore.unreadCount > 0">{{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}</span>
        </router-link>
        <router-link to="/profile" class="avatar-btn" title="个人中心">
          <img v-if="userStore.avatarFullUrl" :src="userStore.avatarFullUrl" class="avatar-img" />
          <span v-else class="avatar-text">{{ nickname }}</span>
        </router-link>
      </div>
    </header>

    <BackButton :mobileNames="vendorMobileNames" />

    <!-- ===== 主体内容 ===== -->
    <div class="main-wrap">
      <div class="content-area">
        <!-- 欢迎横幅 - 仅在首页显示 -->
        <div v-if="route.name === 'VendorHome'" class="welcome-banner">
          <div class="welcome-content">
            <div class="welcome-text">
              <h2>{{ greeting }}</h2>
              <p>管理你的摊位和商品，经营好你的小生意</p>
            </div>
            <div class="welcome-stats">
              <div class="stat-item">
                <span class="stat-number">{{ storeStats.products }}</span>
                <span class="stat-label">在售商品</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-number">{{ storeStats.orders }}</span>
                <span class="stat-label">待处理订单</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-number">{{ storeStats.reservations }}</span>
                <span class="stat-label">待确认预定</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 子页面内容 -->
        <slot />
      </div>
    </div>

    <!-- ===== 底部导航 ===== -->
    <nav class="bottom-nav" v-if="['/vendor/home', '/vendor/goods', '/vendor/orders', '/profile'].includes($route.path)">
      <div class="bottom-nav-inner">
        <router-link to="/vendor/home" class="nav-item" :class="{ active: $route.path === '/vendor/home' }">
          <span class="nav-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </span>
          首页
        </router-link>
        <router-link to="/vendor/goods" class="nav-item" :class="{ active: $route.path.startsWith('/vendor/goods') }">
          <span class="nav-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </span>
          商品
        </router-link>
        <router-link to="/vendor/orders" class="nav-item" :class="{ active: $route.path.startsWith('/vendor/orders') }">
          <span class="nav-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </span>
          订单
        </router-link>
        <router-link to="/profile" class="nav-item" :class="{ active: $route.path === '/profile' }">
          <span class="nav-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
          我的
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import { useNotificationStore } from "@/store/modules/notification";
import { getGreetingPeriod } from "@/utils/timePeriod";
import { connectWebSocket, disconnectWebSocket } from "@/utils/websocket";
import { playBeep } from "@/utils/beep";
import BackButton from "@/components/BackButton.vue";

const route = useRoute();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

const nickname = computed(() => userStore.userInfo.nickname?.charAt(0) || userStore.userInfo.username?.charAt(0) || "我");

const vendorMobileNames = [
  'VendorMyBooth', 'VendorReservations', 'VendorIncomeStats',
  'VendorMarketSelect', 'SharedMessages'
]

const greeting = computed(() => {
  const period = getGreetingPeriod();
  const name = userStore.userInfo.nickname || userStore.userInfo.username || '';
  return `${period}好${name ? `，${name}` : ''}`;
});

// 统计数据（示例，实际应从 store 获取）
const storeStats = ref({
  products: 0,
  orders: 0,
  reservations: 0
});

let unreadTimer = null;

function initUnreadCount() {
  notificationStore.fetchUnreadCount();
}

onMounted(() => {
  initUnreadCount();
  unreadTimer = setInterval(initUnreadCount, 30000);

  const userId = userStore.userInfo.id;
  if (userId) {
    connectWebSocket(userId, async () => {
      await notificationStore.fetchUnreadCount();
      playBeep();
    });
  }

  // TODO: 从 API 获取实际统计数据
  // 这里仅做演示
  storeStats.value = {
    products: 12,
    orders: 3,
    reservations: 2
  };
});

onUnmounted(() => {
  if (unreadTimer) clearInterval(unreadTimer);
  disconnectWebSocket();
});
</script>

<style scoped>
/* ============================================================
   1. 设计 Token
   ============================================================ */
.vendor-layout-body {
  --bg: var(--surface-page);
  --card-bg: var(--surface-card);
  --text: var(--ink-strong);
  --text-secondary: var(--ink);
  --text-muted: var(--ink-muted);
  --accent: var(--brand-primary);
  --accent-light: var(--brand-primary-soft);
  --shadow: var(--shadow-sm);
  --shadow-hover: var(--shadow-md);
  --radius: var(--radius-md);
  --nav-height: 60px;
  --bottom-nav-height: 64px;

  background: var(--bg);
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif;
  color: var(--text);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .vendor-layout-body { --nav-height: 68px; }
}
@media (min-width: 1025px) {
  .vendor-layout-body { --nav-height: 72px; }
}

/* ============================================================
   2. 顶部导航
   ============================================================ */
.top-nav {
  position: sticky;
  top: 0;
  z-index: 30;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: saturate(180%) blur(16px);
  -webkit-backdrop-filter: saturate(180%) blur(16px);
  border-bottom: none;
  box-shadow: 0 1px 0 var(--line);
  height: var(--nav-height);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
}

@media (min-width: 768px) {
  .top-nav { padding: 0 32px; gap: 20px; }
}
@media (min-width: 1025px) {
  .top-nav { padding: 0 48px; gap: 28px; }
}

.brand {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 400;
  font-size: 1rem;
  letter-spacing: 0.04em;
  color: var(--text);
  flex-shrink: 0;
}

.brand-mark {
  display: flex;
  color: var(--accent);
}

@media (min-width: 768px) {
  .brand-mark svg { width: 18px; height: 18px; }
}
@media (min-width: 1025px) {
  .brand-mark svg { width: 20px; height: 20px; }
}

.brand-badge {
  font-size: 0.55rem;
  font-weight: 500;
  color: #fff;
  background: var(--accent);
  padding: 1px 10px;
  border-radius: 100px;
  letter-spacing: 0.04em;
  margin-left: 2px;
}

.nav-spacer {
  flex: 1;
}

/* ============================================================
   3. 导航操作区
   ============================================================ */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: var(--text-secondary);
  transition: background 0.2s;
  text-decoration: none;
}

.nav-btn:active {
  background: var(--accent-light);
}

.badge-num {
  position: absolute;
  top: -5px;
  right:-5px;
  min-width: 16px;
  height: 16px;
  padding: 0 5px;
  background: var(--danger);
  color: #fff;
  border-radius: 8px;
  font-size: 0.6rem;
  font-weight: 600;
  line-height: 16px;
  text-align: center;
  border: 1.5px solid #fff;
}

.avatar-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--accent);
  cursor: pointer;
  flex-shrink: 0;
  text-decoration: none;
  overflow: hidden;
  transition: background 0.2s;
  background: var(--accent-light);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-text {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--accent);
}

/* ============================================================
   4. 主体
   ============================================================ */
.main-wrap {
  display: flex;
  gap: 0;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px 16px;
  flex: 1;
  overflow: hidden;
}

@media (min-width: 768px) {
  .main-wrap { padding: 0 32px 24px; }
}
@media (min-width: 1025px) {
  .main-wrap { padding: 0 48px 32px; }
}
@media (min-width: 1600px) {
  .main-wrap { padding: 0 80px 40px; }
}

.content-area {
  flex: 1;
  min-width: 0;
  padding-top: 12px;
  overflow-y: auto;
}

@media (min-width: 768px) {
  .content-area { padding-top: 16px; }
}
@media (min-width: 1025px) {
  .content-area { padding-top: 20px; }
}

/* ============================================================
   5. 欢迎横幅（仅首页显示）
   ============================================================ */
.welcome-banner {
  margin-bottom: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, var(--surface-card) 0%, var(--surface-subtle) 100%);
  border-radius: var(--radius);
  border: 1px solid var(--line);
}

@media (min-width: 768px) {
  .welcome-banner {
    padding: 28px 32px;
    margin-bottom: 28px;
  }
}

.welcome-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.welcome-text h2 {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 4px 0;
}

.welcome-text p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
}

@media (min-width: 768px) {
  .welcome-text h2 { font-size: 1.3rem; }
  .welcome-text p { font-size: 0.9rem; }
}

.welcome-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  background: #fff;
  padding: 10px 18px;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(44, 37, 32, 0.04);
}

@media (max-width: 550px) {
  .welcome-stats {
    width: 100%;
    justify-content: space-around;
    padding: 12px 12px;
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.stat-number {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
}

.stat-label {
  font-size: 0.6rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: var(--line);
}

/* ============================================================
   6. 底部导航
   ============================================================ */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--bottom-nav-height);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: saturate(180%) blur(12px);
  -webkit-backdrop-filter: saturate(180%) blur(12px);
  border-top: none;
  box-shadow: 0 -1px 0 var(--line);
  z-index: 30;
  padding-bottom: env(safe-area-inset-bottom, 0);
  display: flex;
}

.bottom-nav-inner {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}

.bottom-nav .nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 0.58rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: color 0.2s;
  text-decoration: none;
  font-weight: 400;
  letter-spacing: 0.02em;
}

.bottom-nav .nav-item.active {
  color: var(--text);
  font-weight: 500;
}

.bottom-nav .nav-item .nav-icon {
  display: flex;
  align-items: center;
}

.bottom-nav .nav-item .nav-icon svg {
  stroke-width: 1.8;
}

@media (min-width: 768px) and (max-width: 1024px) {
  .bottom-nav {
    height: 76px;
  }
  .bottom-nav .nav-item {
    font-size: 0.7rem;
    gap: 4px;
    padding: 6px 12px;
  }
  .bottom-nav .nav-item .nav-icon svg {
    width: 26px;
    height: 26px;
  }
}

@media (min-width: 1025px) {
  .bottom-nav {
    display: none;
  }
  .vendor-layout-body {
    padding-bottom: 0;
  }
}

@media (max-width: 767px) {
  .vendor-layout-body {
    padding-bottom: var(--bottom-nav-height);
  }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .vendor-layout-body {
    padding-bottom: 76px;
  }
}

/* ============================================================
   7. 滚动条美化
   ============================================================ */
.content-area::-webkit-scrollbar {
  width: 4px;
}

.content-area::-webkit-scrollbar-track {
  background: transparent;
}

.content-area::-webkit-scrollbar-thumb {
  background: var(--line);
  border-radius: 4px;
}

.content-area::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* ============================================================
   8. 字体回退
   ============================================================ */
@supports (font-variation-settings: normal) {
  .vendor-layout-body {
    font-family: "Inter var", system-ui, -apple-system, sans-serif;
  }
}
</style>
