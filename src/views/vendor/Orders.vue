<template>
  <div class="orders-page">
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
            <span class="header-title">我的订单</span>
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
            :data="store.vendorOrderList"
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
            <UiTableColumn label="操作" width="120" align="center">
              <template #default="{ row }">
                <button class="btn-outline btn-xs" @click="showDetail(row.id)">
                  详情
                </button>
              </template>
            </UiTableColumn>
          </UiTable>
        </div>

        <!-- ===== 移动端：卡片列表 ===== -->
        <div class="order-card-list">
          <div
            v-for="order in store.vendorOrderList"
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
      :class="{ 'is-mobile': windowWidth < 768 }"
    >
      <UiTable :data="store.vendorOrderItems" border class="detail-table">
        <UiTableColumn label="商品图片" width="80">
          <template #default="{ row }">
            <UiImage
              v-if="row.productImageUrl"
              :src="getFullUrl(row.productImageUrl)"
              fit="cover"
              style="width: 44px; height: 44px; border-radius: 8px;"
            />
            <span v-else class="muted-placeholder">暂无</span>
          </template>
        </UiTableColumn>
        <UiTableColumn prop="productName" label="商品" min-width="120" />
        <UiTableColumn prop="productPrice" label="单价" width="80" align="center" />
        <UiTableColumn prop="quantity" label="数量" width="60" align="center" />
        <UiTableColumn label="小计" width="90" align="right">
          <template #default="{ row }">
            ¥{{ (row.productPrice * row.quantity).toFixed(2) }}
          </template>
        </UiTableColumn>
      </UiTable>
      </UiDialog>
  </div>
</template>

<script setup>
import { onMounted, watch, ref } from 'vue'
import { useVendorStore } from '@/store/modules/vendor'
import { useNotificationStore } from "@/store/modules/notification";
import { ElMessage } from 'element-plus'
import { getFullUrl } from '@/utils/urlHelper'

const store = useVendorStore()
const notificationStore = useNotificationStore();

const windowWidth = ref(window.innerWidth)

// 状态样式映射
const statusClass = (status) => {
  const map = {
    '待付款': 'status-pending',
    '已付款': 'status-paid',
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

// 窗口尺寸变化
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  store.fetchVendorOrders()
  window.addEventListener('resize', handleResize)
})

// 监听未读数量变化，自动刷新订单列表
watch(
  () => notificationStore.unreadCount,
  (newVal, oldVal) => {
    console.log(`[小贩订单页] 未读数量变化：${oldVal} -> ${newVal}`)
    store.fetchVendorOrders()
  }
)
</script>

<style scoped>
/* ============================================================
   1. 设计 Token
   ============================================================ */
.orders-page {
  --text: var(--ink-strong);
  --text-secondary: var(--ink);
  --text-muted: var(--ink-muted);
  --accent: var(--brand-primary);
  --accent-light: var(--brand-primary-soft);
  --green: var(--success);
  --green-bg: #e8f5ef;
  --red: var(--danger);
  --red-bg: #fdebea;
  --shadow: var(--shadow-sm);
  --radius: var(--radius-md);

  padding: 20px;
  max-width: 1100px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: var(--text);
}

/* ============================================================
   2. 卡片样式
   ============================================================ */
:deep(.el-card) {
  border: none !important;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

:deep(.el-card__header) {
  border-bottom: 1px solid var(--line);
  padding: 18px 24px;
  background: var(--surface-card);
}

:deep(.el-card__body) {
  padding: 24px;
}

/* ============================================================
   3. 页面头部
   ============================================================ */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  font-size: 1.1rem;
}

.header-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
}

.count-badge {
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--line);
  padding: 0 10px;
  border-radius: 10px;
  line-height: 20px;
  min-width: 20px;
  text-align: center;
}

.btn-refresh {
  padding: 4px 16px;
  border-radius: 100px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s;
}

.btn-refresh:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

/* ============================================================
   4. 加载 & 空状态
   ============================================================ */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--line);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 2.4rem;
  opacity: 0.4;
}

.empty-state p {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0;
}

.empty-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  opacity: 0.7;
}

/* ============================================================
   5. 表格样式
   ============================================================ */
.table-wrapper {
  overflow-x: auto;
  margin: 0 -4px;
}

.order-table {
  border: none !important;
  font-size: 14px;
}

:deep(.order-table.el-table) {
  border: none !important;
}

:deep(.order-table th.el-table__cell) {
  background: var(--surface-subtle) !important;
  color: var(--text-secondary);
  font-weight: 500;
  border-bottom: none;
  padding: 10px 0;
}

:deep(.order-table td.el-table__cell) {
  border-bottom: 1px solid var(--line);
  padding: 12px 0;
}

:deep(.order-table--border) {
  border: none;
}

:deep(.order-table--border .el-table__cell) {
  border-right: none;
}

:deep(.order-table--border .el-table__cell:last-child) {
  border-right: none;
}

:deep(.order-table .cell) {
  padding: 0 8px;
}

:deep(.order-table .el-table__body-wrapper) {
  color: var(--text);
}

/* ============================================================
   6. 状态标签
   ============================================================ */
.status-badge {
  display: inline-block;
  padding: 2px 14px;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 500;
}

.status-pending {
  background-color: #fdf6e8;
  color: #d4a24e;
}

.status-paid {
  background-color: var(--green-bg);
  color: var(--green);
}

.status-done {
  background-color: var(--line);
  color: var(--text-muted);
}

.status-cancelled {
  background-color: var(--red-bg);
  color: var(--red);
}

/* ============================================================
   7. 按钮
   ============================================================ */
.btn-outline {
  border-radius: 100px;
  background: transparent;
  border: 1px solid var(--line);
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.25s;
  padding: 4px 14px;
  font-size: 0.7rem;
}

.btn-outline:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

.btn-outline:active {
  transform: scale(0.97);
}

.btn-xs {
  padding: 3px 12px;
  font-size: 0.65rem;
}

/* ============================================================
   8. 移动端卡片列表（默认隐藏）
   ============================================================ */
.order-card-list {
  display: none;
}

/* ============================================================
   9. 明细弹窗
   ============================================================ */
.detail-dialog :deep(.el-dialog) {
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.detail-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid var(--line);
  padding: 18px 24px;
  background: var(--surface-card);
}

.detail-dialog :deep(.el-dialog__title) {
  color: var(--text);
  font-weight: 600;
  font-size: 1rem;
}

.detail-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.detail-table {
  border: none !important;
}

:deep(.detail-table.el-table) {
  border: none !important;
}

:deep(.detail-table th.el-table__cell) {
  background: var(--surface-subtle) !important;
  color: var(--text-secondary);
  font-weight: 500;
  border-bottom: none;
  padding: 8px 0;
}

:deep(.detail-table td.el-table__cell) {
  border-bottom: 1px solid var(--line);
  padding: 10px 0;
}

:deep(.detail-table--border) {
  border: none;
}

:deep(.detail-table--border .el-table__cell) {
  border-right: none;
}

:deep(.detail-table--border .el-table__cell:last-child) {
  border-right: none;
}

/* ============================================================
   10. 响应式适配
   ============================================================ */

/* ---- 移动端（< 768px） ---- */
@media (max-width: 767px) {
  .orders-page {
    padding: 8px;
  }

  :deep(.el-card__header) {
    padding: 12px 14px;
  }

  :deep(.el-card__body) {
    padding: 12px 8px;
  }

  .header-title {
    font-size: 0.9rem;
  }

  .header-icon {
    font-size: 0.95rem;
  }

  .btn-refresh {
    padding: 3px 12px;
    font-size: 0.7rem;
  }

  /* ---- 隐藏表格 ---- */
  .table-wrapper {
    display: none;
  }

  /* ---- 显示卡片列表 ---- */
  .order-card-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 4px 0;
  }

  .order-card {
    background: #ffffff;
    border-radius: 14px;
    padding: 14px 14px 12px;
    border: 1px solid var(--line);
  }

  .order-card-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--line);
  }

  .order-card-no {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text);
    font-family: 'SF Mono', 'Menlo', monospace;
    letter-spacing: 0.02em;
    word-break: break-all;
  }

  .order-card .status-badge {
    font-size: 0.6rem;
    padding: 1px 12px;
    flex-shrink: 0;
  }

  .order-card-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 16px;
    padding: 10px 0;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .info-item:nth-child(3) {
    grid-column: 1 / -1;
  }

  .info-label {
    font-size: 0.6rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .info-value {
    font-size: 0.85rem;
    color: var(--text);
  }

  .info-value.price {
    font-weight: 600;
  }

  .order-card-actions {
    padding-top: 10px;
    border-top: 1px solid var(--line);
  }

  .order-card-actions .btn-outline {
    width: 100%;
    padding: 8px 12px;
    font-size: 0.85rem;
    text-align: center;
  }

  /* ---- 弹窗移动端 ---- */
  .detail-dialog :deep(.el-dialog) {
    width: 95% !important;
    margin: 10px auto !important;
  }

  .detail-dialog :deep(.el-dialog__header) {
    padding: 14px 16px;
  }

  .detail-dialog :deep(.el-dialog__body) {
    padding: 12px 8px;
  }

  .detail-table {
    font-size: 12px;
  }

  :deep(.detail-table th.el-table__cell) {
    padding: 6px 0;
    font-size: 11px;
  }

  :deep(.detail-table td.el-table__cell) {
    padding: 8px 0;
  }

  :deep(.detail-table .el-image) {
    width: 36px !important;
    height: 36px !important;
  }

  .empty-state {
    padding: 40px 16px;
  }
}

/* ---- 平板端（768px ~ 1024px） ---- */
@media (min-width: 768px) and (max-width: 1024px) {
  .orders-page {
    padding: 24px;
    max-width: 100%;
  }

  :deep(.el-card__header) {
    padding: 16px 20px;
  }

  :deep(.el-card__body) {
    padding: 20px;
  }

  .order-table {
    font-size: 13px;
  }

  :deep(.order-table th.el-table__cell) {
    padding: 8px 0;
  }

  :deep(.order-table td.el-table__cell) {
    padding: 10px 0;
  }

  .btn-xs {
    padding: 3px 10px;
    font-size: 0.6rem;
  }

  .detail-dialog :deep(.el-dialog) {
    width: 90% !important;
  }
}

/* ---- 桌面端（≥ 1024px） ---- */
@media (min-width: 1025px) {
  .orders-page {
    padding: 28px 20px;
  }

  :deep(.el-card__header) {
    padding: 20px 28px;
  }

  :deep(.el-card__body) {
    padding: 28px;
  }
}
</style>
