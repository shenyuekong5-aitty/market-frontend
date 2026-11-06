<template>
  <div class="orders-page">
    <PageHeading title="订单管理" description="查看交易状态与商品明细，有序跟进每一笔订单。" eyebrow="ORDERS / 交易" />
    <CollectionToolbar v-model="searchQuery" :count="filteredRows.length" placeholder="搜索订单编号或交易状态…" />
    <UiEmpty v-if="searchQuery && !filteredRows.length" description="没有找到匹配的内容，试试其他关键词。" class="search-empty" />
    <UiCard>
      <template #header>
        <div class="page-header">
          <div class="header-left">
            <span class="header-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <rect x="6" y="14" width="4" height="4" rx="1"/>
            </svg>
          </span>
            <span class="header-title">交易记录</span>
            <span v-if="store.vendorOrderList.length > 0" class="count-badge">
              {{ store.vendorOrderList.length }}
            </span>
          </div>
          <button class="btn-refresh" @click="refreshOrders">
            刷新
          </button>
        </div>
      </template>

      <!-- 加载状态 -->
      <div v-if="store.vendorOrderLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <!-- 空状态 -->
      <div
        v-else-if="store.vendorOrderList.length === 0"
        class="empty-state"
      >
        <div class="empty-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            <rect x="3" y="18" width="18" height="2" rx="1"/>
          </svg>
        </div>
        <p>暂无订单</p>
        <p class="empty-hint">新订单会在这里显示</p>
      </div>

      <!-- 非空状态 -->
      <div v-else>
        <!-- ===== 桌面/平板：表格 ===== -->
        <div class="table-wrapper">
          <UiTable
            :data="filteredRows"
            border
            style="width: 100%"
            class="order-table"
          >
            <UiTableColumn prop="orderNo" label="订单编号" width="180" />
            <UiTableColumn prop="customerUsername" label="客户" width="120" />
            <UiTableColumn prop="totalAmount" label="总金额" width="100" align="center" />
            <UiTableColumn label="状态" width="100" align="center">
              <template #default="{ row }">
                <span class="status-badge" :class="statusClass(row.status)">
                  {{ row.status }}
                </span>
              </template>
            </UiTableColumn>
            <UiTableColumn prop="createTime" label="下单时间" width="180" />
            <UiTableColumn label="操作" width="210" align="center">
              <template #default="{ row }">
                <div class="table-actions">
                  <button class="btn-outline btn-xs" @click="showDetail(row.id)">详情</button>
                  <button v-if="row.status === '已付款'" class="btn-success btn-xs" @click="handleReady(row.id)">备货完成</button>
                </div>
              </template>
            </UiTableColumn>
          </UiTable>
        </div>

        <!-- ===== 移动端：卡片列表 ===== -->
        <div class="order-card-list">
          <div
            v-for="order in filteredRows"
            :key="order.id"
            class="order-card"
          >
            <div class="order-card-row">
              <span class="order-card-no">{{ order.orderNo }}</span>
              <span class="status-badge" :class="statusClass(order.status)">
                {{ order.status }}
              </span>
            </div>
            <div class="order-card-info">
              <div class="info-item">
                <span class="info-label">客户</span>
                <span class="info-value">{{ order.customerUsername }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">总金额</span>
                <span class="info-value price">¥{{ Number(order.totalAmount).toFixed(2) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">下单时间</span>
                <span class="info-value">{{ order.createTime }}</span>
              </div>
            </div>
            <div class="order-card-actions">
              <button class="btn-outline btn-xs" @click="showDetail(order.id)">
                查看详情
              </button>
              <button v-if="order.status === '已付款'" class="btn-success btn-xs" @click="handleReady(order.id)">备货完成</button>
            </div>
          </div>
        </div>
      </div>
    </UiCard>

    <!-- 订单明细弹窗 -->
    <UiDialog
      v-model="store.vendorOrderDetailVisible"
      title="订单明细"
      width="600px"
      class="detail-dialog"
      :class="{ 'is-mobile': isMobile }"
    >
      <OrderItemsDetail :items="store.vendorOrderItems" />
      </UiDialog>
  </div>
</template>

<script setup>
import CollectionToolbar from '@/components/CollectionToolbar.vue'
import { useCollectionSearch } from '@/composables/useCollectionSearch'
import PageHeading from '@/components/PageHeading.vue'
import { onMounted, watch, ref } from 'vue'
import { useVendorStore } from '@/store/modules/vendor'
import { useNotificationStore } from "@/store/modules/notification";
import { ElMessage } from 'element-plus'
import OrderItemsDetail from '@/components/OrderItemsDetail.vue'
import { useDevice } from '@/composables/useDevice'

const store = useVendorStore()
const notificationStore = useNotificationStore();

const { isMobile } = useDevice()

// 状态样式映射
const statusClass = (status) => {
  const map = {
    '待付款': 'status-pending',
    '已付款': 'status-paid',
    '待取货': 'status-ready',
    '已完成': 'status-done',
    '已取消': 'status-cancelled'
  }
  return map[status] || 'status-pending'
}

const showDetail = async (orderId) => {
  try {
    await store.fetchVendorOrderItems(orderId)
  } catch (e) {
    ElMessage.error('获取订单明细失败')
  }
}

// 手动刷新
const refreshOrders = () => {
  store.fetchVendorOrders()
}

const handleReady = async (orderId) => {
  try {
    await store.handleMarkOrderReady(orderId)
    ElMessage.success('已通知用户前来取货')
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  }
}

onMounted(() => {
  store.fetchVendorOrders()
})

// 监听未读数量变化，自动刷新订单列表
watch(
  () => notificationStore.unreadCount,
  () => {
    store.fetchVendorOrders()
  }
)

const { searchQuery, filteredRows } = useCollectionSearch(() => store.vendorOrderList, ['orderNo', 'productNames', 'status'])
</script>
