<template>
  <div class="vendor-home">
    <!-- 加载状态 -->
    <el-skeleton :loading="loading" animated :rows="10">
      <template #default>
        <!-- 摊位状态卡片 -->
        <el-card class="booth-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>摊位状态</span>
              <el-tag v-if="myBooth" type="success">已入驻</el-tag>
              <el-tag v-else type="info">未入驻</el-tag>
            </div>
          </template>
          <div v-if="myBooth" class="booth-content">
            <div class="booth-title">{{ myBooth.title || '我的摊位' }}</div>
            <div class="booth-desc">{{ myBooth.description || '暂无描述' }}</div>
            <div class="booth-meta">
              <span><el-icon><Clock /></el-icon> {{ myBooth.openTime || '未设置' }}</span>
            </div>
            <div class="booth-actions">
              <el-button type="primary" size="small" @click="$router.push('/vendor/my-booth')">
                管理摊位
              </el-button>
              <el-button size="small" @click="$router.push('/vendor/goods')">
                商品管理
              </el-button>
            </div>
          </div>
          <div v-else class="empty-booth">
            <el-empty description="你还没有入驻集市" :image-size="80">
              <el-button type="primary" @click="$router.push('/vendor/markets')">
                去选择集市入驻
              </el-button>
            </el-empty>
          </div>
        </el-card>

        <!-- 统计卡片 -->
        <el-row :gutter="20" class="stats-row">
          <el-col :xs="12" :sm="6" v-for="item in statsCards" :key="item.label">
            <el-card shadow="hover" class="stat-card" @click="item.link && $router.push(item.link)">
              <div class="stat-content">
                <div class="stat-icon" :style="{ color: item.color }">
                  <el-icon size="28"><component :is="item.icon" /></el-icon>
                </div>
                <div class="stat-text">
                  <div class="stat-label">{{ item.label }}</div>
                  <div class="stat-value" :style="{ color: item.color }">{{ item.value }}</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 快捷入口 -->
        <el-card class="quick-actions-card" shadow="hover">
          <template #header>
            <span>快捷入口</span>
          </template>
          <el-row :gutter="20">
            <el-col :xs="12" :sm="8" v-for="action in quickActions" :key="action.label">
              <div class="quick-action-item" @click="$router.push(action.path)">
                <el-icon size="24"><component :is="action.icon" /></el-icon>
                <span>{{ action.label }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 最近订单（可选） -->
        <el-card class="recent-orders-card" shadow="hover" v-if="recentOrders.length > 0">
          <template #header>
            <div class="card-header">
              <span>最近成交订单</span>
              <el-button text size="small" @click="$router.push('/vendor/orders')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentOrders" size="small">
            <el-table-column prop="orderNo" label="订单编号" width="180" />
            <el-table-column prop="totalAmount" label="金额" width="100">
              <template #default="{ row }">¥{{ row.totalAmount }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="时间" min-width="140" />
          </el-table>
        </el-card>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVendorStore } from '@/store/modules/vendor'
import { useNotificationStore } from '@/store/modules/notification' // 假设已有
import { ElMessage } from 'element-plus'
import { Clock, ShoppingCart, Money, List, Bell, Shop, Tickets, DataLine, Collection } from '@element-plus/icons-vue'

const vendorStore = useVendorStore()
const notificationStore = useNotificationStore()
const loading = ref(true)

// 我的摊位
const myBooth = computed(() => vendorStore.myBooth)

// 收入数据
const income = computed(() => vendorStore.incomeStats)

// 待确认预定数
const pendingReservations = computed(() => {
  return vendorStore.vendorReservationList.filter(r => r.status === '待确认').length
})

// 未读消息数（从全局通知 store 获取）
const unreadCount = computed(() => notificationStore.unreadCount || 0)

// 统计卡片配置
const statsCards = computed(() => [
  {
    label: '今日收入',
    value: '¥' + (income.value?.todayIncome || 0).toFixed(2),
    icon: Money,
    color: '#67c23a',
    link: '/vendor/income-stats'
  },
  {
    label: '总订单数',
    value: income.value?.totalOrders || 0,
    icon: Tickets,
    color: '#409eff',
    link: '/vendor/orders'
  },
  {
    label: '待确认预定',
    value: pendingReservations.value,
    icon: Collection,
    color: '#e6a23c',
    link: '/vendor/reservations'
  },
  {
    label: '未读消息',
    value: unreadCount.value,
    icon: Bell,
    color: '#f56c6c',
    link: '/vendor/messages'
  }
])

// 快捷入口
const quickActions = [
  { label: '摊位管理', icon: Shop, path: '/vendor/my-booth' },
  { label: '商品管理', icon: ShoppingCart, path: '/vendor/goods' },
  { label: '订单列表', icon: List, path: '/vendor/orders' },
  { label: '收入统计', icon: DataLine, path: '/vendor/income-stats' },
  { label: '预定处理', icon: Collection, path: '/vendor/reservations' },
  { label: '消息中心', icon: Bell, path: '/vendor/messages' }
]

// 最近 3 条已完成订单
const recentOrders = computed(() => {
  const completed = (vendorStore.vendorOrderList || []).filter(o => o.status === '已完成')
  return completed.slice(0, 3)
})

// 订单状态标签颜色
const statusType = (status) => {
  const map = {
    '待付款': 'warning',
    '已付款': 'primary',
    '已完成': 'success',
    '已取消': 'info'
  }
  return map[status] || 'info'
}

onMounted(async () => {
  loading.value = true
  try {
    // 初始化：摊位、商品、预定、订单、收入、未读消息
    await Promise.all([
      vendorStore.init(),                 // 摊位+商品
      vendorStore.fetchVendorReservations(),
      vendorStore.fetchVendorOrders(),
      vendorStore.fetchIncomeStats(),
      notificationStore.fetchUnreadCount?.() // 如果 notificationStore 有该方法
    ])
  } catch (e) {
    ElMessage.error('加载首页数据失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.vendor-home {
  padding: 20px;
}

.booth-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.booth-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.booth-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.booth-desc {
  color: #606266;
}

.booth-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

.booth-actions {
  margin-top: 8px;
}

.empty-booth {
  padding: 10px 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  flex-shrink: 0;
}

.stat-text {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

.stat-value {
  font-size: 22px;
  font-weight: bold;
}

.quick-actions-card {
  margin-bottom: 20px;
}

.quick-action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 8px;
  background: #f5f7fa;
  cursor: pointer;
  transition: background 0.3s;
  margin-bottom: 12px;
}

.quick-action-item:hover {
  background: #ecf5ff;
}

.quick-action-item span {
  font-size: 13px;
  color: #606266;
}

.recent-orders-card {
  margin-bottom: 20px;
}
</style>