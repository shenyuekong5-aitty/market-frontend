<template>
  <div class="vendor-home">
    <UiSkeleton v-if="loading" animated :rows="8" />
    <template v-else>
        <div class="greeting-section">
          <p class="greeting-text">{{ greeting }}</p>
          <p class="greeting-sub">管理你的摊位和商品</p>
        </div>

        <div v-if="myBooth" class="booth-card">
          <div class="booth-header">
            <div>
              <div class="booth-name">{{ myBooth.title || '我的摊位' }}</div>
              <div class="booth-location">{{ myBooth.description || '暂无描述' }}</div>
            </div>
            <button class="btn-edit" @click="$router.push('/vendor/my-booth')">编辑</button>
          </div>

          <div class="booth-time">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>{{ myBooth.openTime || '营业时间未设置' }}</span>
            <span class="status-dot"></span>
            <span class="status-text">已入驻</span>
          </div>

          <div class="booth-stats">
            <div class="stat-item">
              <span class="stat-num">{{ productCount }}</span>
              <span class="stat-label">商品</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-num">{{ pendingOrderCount }}</span>
              <span class="stat-label">待处理订单</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-num">{{ pendingReservationCount }}</span>
              <span class="stat-label">待确认预定</span>
            </div>
          </div>
        </div>

        <div v-else class="empty-card">
          <div class="empty-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>
            </svg>
          </div>
          <p class="empty-title">还没有摊位</p>
          <p class="empty-desc">入驻一个集市，开始你的小生意</p>
          <button class="btn-primary" @click="$router.push('/vendor/markets')">去选择集市</button>
        </div>

        <div class="quick-section">
          <div class="quick-grid">
            <router-link to="/vendor/goods" class="quick-item">
              <span class="quick-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </span>
              <span>商品</span>
            </router-link>
            <router-link to="/vendor/orders" class="quick-item">
              <span class="quick-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </span>
              <span>订单</span>
            </router-link>
            <router-link to="/vendor/reservations" class="quick-item">
              <span class="quick-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                  <rect x="6" y="14" width="4" height="4" rx="1"/>
                </svg>
              </span>
              <span>预定</span>
            </router-link>
            <router-link to="/messages" class="quick-item">
              <span class="quick-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </span>
              <span>消息</span>
              <span v-if="unreadCount > 0" class="q-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
            </router-link>
          </div>
          <router-link to="/vendor/income-stats" class="income-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            收入统计
          </router-link>
        </div>

        <div v-if="recentActivities.length > 0" class="activity-section">
          <p class="activity-title">最近动态</p>
          <div class="activity-list">
            <div v-for="(item, idx) in recentActivities" :key="idx" class="activity-item">
              <span class="a-dot"></span>
              <span class="a-text">{{ item.text }}</span>
              <span class="a-time">{{ item.time }}</span>
            </div>
          </div>
        </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVendorStore } from '@/store/modules/vendor'
import { useNotificationStore } from '@/store/modules/notification'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import { getGreetingPeriod } from '@/utils/timePeriod'

const vendorStore = useVendorStore()
const notificationStore = useNotificationStore()
const userStore = useUserStore()
const loading = ref(true)

const myBooth = computed(() => vendorStore.myBooth)

const productCount = computed(() => vendorStore.productList?.length || 0)

const pendingOrderCount = computed(() => {
  return (vendorStore.vendorOrderList || []).filter(o => o.status === '待付款' || o.status === '已付款').length
})

const pendingReservationCount = computed(() => {
  return (vendorStore.vendorReservationList || []).filter(r => r.status === '待确认').length
})

const unreadCount = computed(() => notificationStore.unreadCount || 0)

const greeting = computed(() => {
  const period = getGreetingPeriod()
  const name = userStore.userInfo.nickname || userStore.userInfo.username || ''
  return `${period}好${name ? `，${name}` : ''}`
})

const recentActivities = ref([])

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = (now - date) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  return time.substring(5, 16)
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      vendorStore.init(),
      vendorStore.fetchVendorReservations(),
      vendorStore.fetchVendorOrders(),
      notificationStore.fetchUnreadCount?.()
    ])

    const items = []
    const orders = vendorStore.vendorOrderList || []
    orders.slice(0, 3).forEach(o => {
      items.push({
        text: `新订单 #${o.orderNo?.slice(-6) || '****'}`,
        time: formatTime(o.createTime)
      })
    })
    const reservations = vendorStore.vendorReservationList || []
    reservations.filter(r => r.status === '待确认').slice(0, 2).forEach(r => {
      items.push({
        text: `预定请求：${r.productName || '商品'}`,
        time: formatTime(r.createTime)
      })
    })
    recentActivities.value = items.slice(0, 5)
  } catch (e) {
    ElMessage.error('加载首页数据失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.vendor-home {
  --text: var(--ink-strong);
  --text-secondary: var(--ink);
  --text-muted: var(--ink-muted);
  --accent: var(--brand-primary);
  --accent-light: var(--brand-primary-soft);
  --border: var(--line);
  --radius: var(--radius-md);
  --card-bg: var(--surface-card);
  --shadow: var(--shadow-sm);
  padding: 0 4px 20px;
  max-width: 640px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Microsoft YaHei", sans-serif;
  color: var(--text);
}

.greeting-section {
  padding: 16px 4px 8px;
}

.greeting-text {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 2px 0;
  letter-spacing: -0.02em;
}

.greeting-sub {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
}

.booth-card {
  background: var(--card-bg);
  border-radius: var(--radius);
  padding: 18px 20px 16px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  margin-bottom: 20px;
}

.booth-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.booth-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
}

.booth-location {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.btn-edit {
  padding: 2px 16px;
  border-radius: 100px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-top: 2px;
}
.btn-edit:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

.booth-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--line);
}

.booth-time svg { color: var(--text-muted); flex-shrink: 0; }

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--success);
  margin-left: 4px;
  flex-shrink: 0;
}

.status-text {
  color: var(--success);
  font-size: 0.7rem;
}

.booth-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.stat-num {
  font-size: 1.2rem;
  font-weight: 600;
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

.empty-card {
  background: var(--card-bg);
  border-radius: var(--radius);
  padding: 40px 20px;
  text-align: center;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  margin-bottom: 20px;
}

.empty-icon {
  color: var(--text-muted);
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
}

.empty-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text);
  margin: 0 0 2px 0;
}

.empty-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0 0 16px 0;
}

.btn-primary {
  padding: 8px 28px;
  border-radius: 100px;
  background: var(--text);
  border: none;
  font-weight: 500;
  font-size: 0.85rem;
  color: #fff;
  cursor: pointer;
  transition: background 0.25s;
}
.btn-primary:hover { background: var(--accent); }

.quick-section {
  margin-bottom: 24px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 6px 12px;
  border-radius: var(--radius);
  background: var(--card-bg);
  border: 1px solid var(--border);
  text-decoration: none;
  color: var(--text);
  transition: border-color 0.2s, transform 0.15s;
  position: relative;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--text-secondary);
}
.quick-item:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}
.quick-item:active { transform: scale(0.97); }

.quick-icon { display: flex; color: var(--text); }

.q-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  padding: 0 5px;
  background: var(--danger);
  color: #fff;
  border-radius: 8px;
  font-size: 0.5rem;
  font-weight: 600;
  line-height: 16px;
  text-align: center;
}

.income-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 10px;
  padding: 10px;
  border-radius: 100px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  text-decoration: none;
  font-size: 0.8rem;
  color: var(--text-secondary);
  transition: border-color 0.2s, color 0.2s;
}
.income-link:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.activity-section {
  margin-bottom: 12px;
}

.activity-title {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 10px 0;
}

.activity-list {
  background: var(--card-bg);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  overflow: hidden;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid #f5f2ec;
}
.activity-item:last-child { border-bottom: none; }

.a-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
}

.a-text {
  flex: 1;
  font-size: 0.8rem;
  color: var(--text);
}

.a-time {
  font-size: 0.65rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .vendor-home { padding: 0 0 16px; max-width: 100%; }
  .greeting-section { padding: 12px 4px 4px; }
  .greeting-text { font-size: 1.1rem; }
  .booth-card { padding: 14px 14px 12px; border-radius: 14px; }
  .booth-stats { gap: 6px; }
  .stat-num { font-size: 1rem; }
  .quick-grid { gap: 6px; }
  .quick-item { padding: 12px 4px 10px; font-size: 0.6rem; }
  .quick-icon svg { width: 18px; height: 18px; }
  .empty-card { padding: 28px 16px; }
  .activity-item { padding: 8px 12px; flex-wrap: wrap; }
  .a-text { font-size: 0.75rem; order: 2; flex-basis: 100%; margin-left: 18px; margin-top: -2px; }
  .a-time { font-size: 0.6rem; order: 1; }
  .a-dot { order: 0; }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .vendor-home { padding: 0 12px 24px; max-width: 100%; }
  .booth-card { padding: 20px 24px 18px; }
  .quick-grid { gap: 10px; }
}

@media (min-width: 1025px) {
  .vendor-home { padding: 4px 0 32px; }
  .booth-card { padding: 22px 26px 20px; }
}
</style>
