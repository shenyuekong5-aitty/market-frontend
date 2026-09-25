<template>
  <div class="user-layout-body">
    <!-- ========== 顶部导航 ========== -->
    <header class="top-nav">
      <div class="brand">
        <span class="brand-mark">
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M4 32L24 10L44 32" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M24 10L24 38" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M14 32L34 32" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <rect x="18" y="26" width="12" height="6" rx="1" stroke="currentColor" stroke-width="2"/>
            <circle cx="21" cy="29" r="1" fill="currentColor"/>
            <circle cx="27" cy="29" r="1" fill="currentColor"/>
          </svg>
        </span>
        <span>智慧集市</span>
      </div>

      <div class="greeting">
        {{ greeting }}
      </div>

      <div class="nav-actions">
        <router-link to="/messages" class="nav-btn" title="消息">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span class="badge-num" v-if="notificationStore.unreadCount > 0">{{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}</span>
        </router-link>
        <router-link to="/cart" class="nav-btn" title="购物车">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path
              d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
            />
          </svg>
          <span class="badge-num" v-if="userMarketStore.cartCount > 0">{{ userMarketStore.cartCount > 99 ? '99+' : userMarketStore.cartCount }}</span>
        </router-link>
        <router-link to="/profile" class="avatar-btn" title="个人中心">
          <img v-if="userStore.avatarFullUrl" :src="userStore.avatarFullUrl" class="avatar-img" />
          <span v-else>{{ nickname }}</span>
        </router-link>
      </div>
    </header>

    <BackButton />

    <!-- ========== 主体 ========== -->
    <div class="main-wrap">
      <div class="content-area">
        <slot />
        <template v-if="route.path === '/'">
          <!-- Hero -->
          <section class="hero-section">
            <div class="hero-card hero-primary" @click="goToMarkets">
              <div class="hero-content">
                <span class="hero-tag">探索周边</span>
                <h2>发现附近的<br /><strong>有趣集市</strong></h2>
                <p class="hero-sub">{{ enabledCount }} 个集市正在营业</p>
              </div>
              <div class="hero-visual">
                <div class="hero-ornament"></div>
              </div>
            </div>
          </section>

          <!-- 全部集市 -->
          <div class="section-header">
            <h2>
              <span class="section-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
              </span>
              全部集市
            </h2>
          </div>

          <div class="market-grid">
            <div v-if="marketStore.loading" class="empty-state">加载中…</div>
            <div v-else-if="sortedMarkets.length === 0" class="empty-state">
              <p>暂无可用的集市</p>
            </div>
            <component
              :is="
                m.status === 1 || m.status === '启用' ? 'router-link' : 'div'
              "
              v-for="(m, i) in sortedMarkets.slice(0, 8)"
              :key="m.id"
              :to="
                m.status === 1 || m.status === '启用'
                  ? `/market/${m.id}`
                  : undefined
              "
              class="market-card"
              role="button"
              tabindex="0"
            >
              <div class="card-cover">
                <span class="card-number">{{
                  String(i + 1).padStart(2, "0")
                }}</span>
                <span
                  class="status-badge"
                  :class="
                    m.status === 1 || m.status === '启用'
                      ? 'badge-open'
                      : 'badge-closed'
                  "
                  >{{
                    m.status === 1 || m.status === "启用" ? "营业中" : "已停用"
                  }}</span
                >
              </div>
              <div class="card-body">
                <div class="card-name">{{ m.name }}</div>
                <div class="card-meta">{{ m.location }}</div>
              </div>
            </component>
          </div>

          <!-- 快捷入口 -->
          <div class="section-header" style="margin-top: 8px">
            <h2>
              <span class="section-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </span>
              快捷入口
            </h2>
          </div>
          <div class="quick-actions">
            <router-link to="/cart" class="quick-item">
              <span class="q-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </span>
              <span class="q-label">购物车</span>
            </router-link>
            <router-link to="/orders" class="quick-item">
              <span class="q-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </span>
              <span class="q-label">我的订单</span>
            </router-link>
            <router-link to="/reservations" class="quick-item">
              <span class="q-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                  <rect x="6" y="14" width="4" height="4" rx="1"/>
                </svg>
              </span>
              <span class="q-label">我的预定</span>
            </router-link>
            <router-link to="/follows" class="quick-item">
              <span class="q-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </span>
              <span class="q-label">我的关注</span>
            </router-link>
          </div>
        </template>
      </div>
    </div>

    <!-- ========== 底部导航 ========== -->
    <nav
      class="bottom-nav"
      v-if="['/', '/reservations', '/orders', '/profile'].includes($route.path)"
    >
      <div class="bottom-nav-inner">
        <router-link
          to="/"
          class="nav-item"
          :class="{ active: $route.path === '/' }"
        >
          <span class="nav-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </span>
          首页
        </router-link>
        <router-link
          to="/reservations"
          class="nav-item"
          :class="{ active: $route.path.startsWith('/reservations') }"
        >
          <span class="nav-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <rect x="6" y="14" width="4" height="4" rx="1" />
            </svg>
          </span>
          预定
        </router-link>
        <router-link
          to="/orders"
          class="nav-item"
          :class="{ active: $route.path.startsWith('/orders') }"
        >
          <span class="nav-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
              />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </span>
          订单
        </router-link>
        <router-link
          to="/profile"
          class="nav-item"
          :class="{ active: $route.path === '/profile' }"
        >
          <span class="nav-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          我的
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import { useMarketStore } from "@/store/modules/market";
import { useNotificationStore } from "@/store/modules/notification";
import { useUserMarketStore } from "@/store/modules/userMarket";
import BackButton from "@/components/BackButton.vue";
import { getGreetingPeriod } from "@/utils/timePeriod";
import { connectWebSocket, disconnectWebSocket } from "@/utils/websocket";
import { playBeep } from "@/utils/beep";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const marketStore = useMarketStore();
const notificationStore = useNotificationStore();
const userMarketStore = useUserMarketStore();

const nickname = computed(() => userStore.userInfo.nickname.charAt(0) || userStore.userInfo.username.charAt(0) || "我");

const greeting = computed(() => {
  const period = getGreetingPeriod()
  const name = userStore.userInfo.nickname || userStore.userInfo.username || ''
  return `${period}好${name ? `，${name}~` : '~'}`
})

const sortedMarkets = computed(() => {
  const list = marketStore.marketList;
  return [...list].sort((a, b) => {
    const aActive = a.status === 1 || a.status === "启用" ? 0 : 1;
    const bActive = b.status === 1 || b.status === "启用" ? 0 : 1;
    return aActive - bActive;
  });
});

const enabledCount = computed(() => {
  return marketStore.marketList.filter(
    (m) => m.status === 1 || m.status === "启用",
  ).length;
});

function goToMarkets() {
  router.push("/markets");
}

let unreadTimer = null

function initUnreadCount() {
  notificationStore.fetchUnreadCount()
}

onMounted(() => {
  if (marketStore.marketList.length === 0) {
    marketStore.fetchMarkets();
  }
  initUnreadCount();
  userMarketStore.fetchCart().catch(() => {});
  unreadTimer = setInterval(initUnreadCount, 30000);

  const userId = userStore.userInfo.id;
  if (userId) {
    connectWebSocket(userId, async () => {
      await notificationStore.fetchUnreadCount();
      playBeep();
    });
  }
});

onUnmounted(() => {
  if (unreadTimer) clearInterval(unreadTimer);
  disconnectWebSocket();
});
</script>

<style scoped>
/* ============================================================
   1.  全局变量 & 基础
   ============================================================ */
.user-layout-body {
  --bg: var(--surface-page);
  --card-bg: var(--surface-card);
  --text: var(--ink-strong);
  --text-secondary: var(--ink);
  --text-muted: var(--ink-muted);
  --accent: var(--brand-primary);
  --accent-light: var(--brand-primary-soft);
  --green: var(--success);
  --green-bg: #e8f5ef;
  --shadow: var(--shadow-sm);
  --shadow-hover: var(--shadow-md);
  --shadow-card: var(--shadow-sm);
  --radius: var(--radius-md);
  --radius-sm: 12px;
  --nav-height: 64px;
  --bottom-nav-height: 64px;

  background: var(--bg);
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "PingFang SC",
    "Microsoft YaHei",
    "Noto Sans SC",
    sans-serif;
  color: var(--text);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ============================================================
   2.  顶部导航
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
  padding: 0 20px;
  gap: 16px;
}

@media (min-width: 768px) {
  .top-nav {
    padding: 0 32px;
    gap: 20px;
  }
}
@media (min-width: 1025px) {
  .top-nav {
    padding: 0 48px;
    gap: 28px;
  }
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
  font-size: 1.15rem;
  color: var(--accent);
}

.greeting {
  flex: 1;
  font-size: 0.95rem;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (min-width: 768px) {
  .greeting {
    font-size: 1.05rem;
  }
}
@media (min-width: 1025px) {
  .greeting {
    font-size: 1.15rem;
  }
}

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
  right: -8px;
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
.avatar-btn:active {
  background: var(--accent-light);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* ============================================================
   3.  主体布局
   ============================================================ */
.main-wrap {
  display: flex;
  gap: 0;
  width: 100%;
  margin: 0 auto;
  padding: 0 16px 16px;
  flex: 1;
  overflow: hidden;
}

@media (min-width: 768px) {
  .main-wrap {
    padding: 0 32px 24px;
  }
}
@media (min-width: 1025px) {
  .main-wrap {
    padding: 0 48px 32px;
  }
}
@media (min-width: 1600px) {
  .main-wrap {
    padding: 0 80px 40px;
  }
}

.content-area {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
}

/* ============================================================
   4.  Hero 区域
   ============================================================ */
.hero-section {
  margin: 20px 0 32px;
}

@media (min-width: 768px) {
  .hero-section {
    margin: 28px 0 40px;
  }
}
@media (min-width: 1025px) {
  .hero-section {
    margin: 32px 0 48px;
  }
}

.hero-card {
  border-radius: var(--radius);
  padding: 32px 28px;
  background: #ffffff;
  box-shadow: var(--shadow-card);
  min-height: 160px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.35s ease,
    box-shadow 0.35s ease;
}

@media (min-width: 768px) {
  .hero-card {
    padding: 40px 44px;
    min-height: 200px;
  }
}
@media (min-width: 1025px) {
  .hero-card {
    padding: 48px 56px;
    min-height: 220px;
  }
}

.hero-card:active {
  transform: scale(0.99);
}
@media (hover: hover) {
  .hero-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-hover);
  }
}

.hero-card.hero-primary {
  background: var(--surface-card);
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-tag {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--accent);
  background: var(--accent-light);
  padding: 2px 14px;
  border-radius: 100px;
  display: inline-block;
  margin-bottom: 14px;
}

@media (min-width: 768px) {
  .hero-tag {
    font-size: 0.7rem;
    margin-bottom: 18px;
  }
}

.hero-content h2 {
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.25;
  color: var(--text);
  margin: 0 0 8px 0;
}
.hero-content h2 strong {
  font-weight: 600;
}

@media (min-width: 768px) {
  .hero-content h2 {
    font-size: 1.8rem;
  }
}
@media (min-width: 1025px) {
  .hero-content h2 {
    font-size: 2.1rem;
  }
}

.hero-sub {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0;
}

@media (min-width: 768px) {
  .hero-sub {
    font-size: 0.85rem;
  }
}

/* —— 装饰圆 —— */
.hero-visual {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 40%;
  pointer-events: none;
  overflow: hidden;
}

.hero-ornament {
  position: absolute;
  right: -30px;
  top: -40px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(201, 125, 74, 0.05);
}

.hero-ornament::after {
  content: "";
  position: absolute;
  right: 40px;
  bottom: 40px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(201, 125, 74, 0.08);
}

@media (min-width: 768px) {
  .hero-ornament {
    width: 280px;
    height: 280px;
    right: -40px;
    top: -60px;
  }
  .hero-ornament::after {
    width: 110px;
    height: 110px;
    right: 50px;
    bottom: 50px;
  }
}
@media (min-width: 1025px) {
  .hero-ornament {
    width: 360px;
    height: 360px;
    right: -50px;
    top: -80px;
  }
  .hero-ornament::after {
    width: 140px;
    height: 140px;
    right: 60px;
    bottom: 60px;
  }
}

/* ============================================================
   5.  区块标题
   ============================================================ */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

@media (min-width: 768px) {
  .section-header {
    margin-bottom: 18px;
  }
}

.section-header h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text);
  letter-spacing: -0.01em;
}

@media (min-width: 768px) {
  .section-header h2 {
    font-size: 1.15rem;
  }
}
@media (min-width: 1025px) {
  .section-header h2 {
    font-size: 1.25rem;
  }
}

.section-icon {
  font-size: 0.85rem;
  color: var(--accent);
  opacity: 0.6;
}

.view-all {
  font-size: 0.7rem;
  color: var(--text-secondary);
  cursor: pointer;
  font-weight: 400;
  text-decoration: none;
  transition: color 0.2s;
  letter-spacing: 0.02em;
}
.view-all:hover {
  color: var(--accent);
}

@media (min-width: 768px) {
  .view-all {
    font-size: 0.75rem;
  }
}

/* ============================================================
   6.  集市网格
   ============================================================ */
.market-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  padding-bottom: 8px;
}

@media (min-width: 768px) {
  .market-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }
}
@media (min-width: 1025px) {
  .market-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 22px;
  }
}

.market-card {
  background: var(--card-bg);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  border: none;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
}

.market-card:active {
  transform: scale(0.98);
}
@media (hover: hover) {
  .market-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-hover);
  }
}

.card-cover {
  height: 76px;
  background: #f5f0ea !important;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 10px 14px;
}

@media (min-width: 768px) {
  .card-cover {
    height: 90px;
    padding: 12px 16px;
  }
}
@media (min-width: 1025px) {
  .card-cover {
    height: 100px;
    padding: 14px 18px;
  }
}

.card-number {
  font-size: 1.1rem;
  font-weight: 300;
  color: rgba(44, 37, 32, 0.1);
  letter-spacing: -0.02em;
  line-height: 1;
}

@media (min-width: 768px) {
  .card-number {
    font-size: 1.3rem;
  }
}
@media (min-width: 1025px) {
  .card-number {
    font-size: 1.5rem;
  }
}

.status-badge {
  font-size: 0.55rem;
  font-weight: 500;
  padding: 2px 12px;
  border-radius: 100px;
  letter-spacing: 0.02em;
}

@media (min-width: 768px) {
  .status-badge {
    font-size: 0.6rem;
    padding: 3px 14px;
  }
}
@media (min-width: 1025px) {
  .status-badge {
    font-size: 0.65rem;
    padding: 3px 16px;
  }
}

.badge-open {
  background: var(--green-bg);
  color: var(--green);
}
.badge-closed {
  background: var(--line);
  color: var(--text-muted);
}

.card-body {
  padding: 12px 14px 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

@media (min-width: 768px) {
  .card-body {
    padding: 14px 16px 16px;
    gap: 4px;
  }
}
@media (min-width: 1025px) {
  .card-body {
    padding: 16px 18px 18px;
    gap: 5px;
  }
}

.card-body .card-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text);
}

@media (min-width: 768px) {
  .card-body .card-name {
    font-size: 0.9rem;
  }
}
@media (min-width: 1025px) {
  .card-body .card-name {
    font-size: 0.95rem;
  }
}

.card-body .card-meta {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

@media (min-width: 768px) {
  .card-body .card-meta {
    font-size: 0.75rem;
  }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
  grid-column: 1 / -1;
}

/* ============================================================
   7.  快捷入口
   ============================================================ */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 20px;
  margin-bottom: 12px;
}

@media (min-width: 768px) {
  .quick-actions {
    gap: 14px;
    margin-top: 26px;
  }
}
@media (min-width: 1025px) {
  .quick-actions {
    gap: 18px;
    margin-top: 32px;
  }
}

.quick-item {
  background: transparent;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 14px 6px;
  text-align: center;
  cursor: pointer;
  box-shadow: none;
  transition:
    border-color 0.25s,
    background 0.25s,
    transform 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: inherit;
}

@media (min-width: 768px) {
  .quick-item {
    padding: 18px 8px;
    gap: 8px;
  }
}
@media (min-width: 1025px) {
  .quick-item {
    padding: 22px 10px;
    gap: 10px;
  }
}

.quick-item:active {
  transform: scale(0.96);
}
@media (hover: hover) {
  .quick-item:hover {
    border-color: var(--accent);
    background: var(--accent-light);
  }
}

.quick-item .q-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  height: auto;
  background: transparent !important;
  color: var(--text);
  font-size: 1.4rem;
  line-height: 1;
}

@media (min-width: 768px) {
  .quick-item .q-icon {
    font-size: 1.6rem;
  }
}
@media (min-width: 1025px) {
  .quick-item .q-icon {
    font-size: 1.8rem;
  }
}

.quick-item .q-label {
  font-size: 0.65rem;
  font-weight: 400;
  color: var(--text-secondary);
}

@media (min-width: 768px) {
  .quick-item .q-label {
    font-size: 0.7rem;
  }
}
@media (min-width: 1025px) {
  .quick-item .q-label {
    font-size: 0.75rem;
  }
}

/* ============================================================
   8.  底部导航
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
  .user-layout-body {
    padding-bottom: 0;
  }
}

@media (max-width: 767px) {
  .user-layout-body {
    padding-bottom: var(--bottom-nav-height);
  }
}
@media (min-width: 768px) and (max-width: 1024px) {
  .user-layout-body {
    padding-bottom: 76px;
  }
}

/* ============================================================
   9.  字体回退（无 Google Fonts 时使用系统字体）
   ============================================================ */
@supports (font-variation-settings: normal) {
  .user-layout-body {
    font-family:
      "Inter var",
      system-ui,
      -apple-system,
      sans-serif;
  }
}
</style>
