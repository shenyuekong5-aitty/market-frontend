<template>
  <div class="reservations-page">
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
            <span class="header-title">预定处理</span>
            <span v-if="store.vendorReservationList.length > 0" class="count-badge">
              {{ store.vendorReservationList.length }}
            </span>
            <span v-if="pendingCount > 0" class="pending-badge">
              待确认 {{ pendingCount }}
            </span>
          </div>
          <button class="btn-refresh" @click="refreshReservations">
            刷新
          </button>
        </div>
      </template>

      <!-- 加载状态 -->
      <div v-if="store.vendorReservationLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <!-- 空状态 -->
      <div
        v-else-if="store.vendorReservationList.length === 0"
        class="empty-state"
      >
        <div class="empty-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            <rect x="3" y="18" width="18" height="2" rx="1"/>
          </svg>
        </div>
        <p>暂无预定</p>
        <p class="empty-hint">来自用户的预定请求会在这里显示</p>
      </div>

      <!-- 非空状态 -->
      <div v-else>
        <!-- ===== 桌面/平板：表格 ===== -->
        <div class="table-wrapper">
          <UiTable
            :data="store.vendorReservationList"
            border
            style="width: 100%"
            class="reservation-table"
          >
            <UiTableColumn label="图片" width="80">
              <template #default="{ row }">
                <UiImage
                  v-if="row.productImageUrl"
                  :src="getFullUrl(row.productImageUrl)"
                  fit="cover"
                  style="width: 44px; height: 44px; border-radius: 8px;"
                />
                <span v-else class="image-placeholder">无</span>
              </template>
            </UiTableColumn>
            <UiTableColumn prop="userName" label="预定用户" width="120" />
            <UiTableColumn prop="productName" label="商品" min-width="120" />
            <UiTableColumn prop="startTime" label="开始时间" width="180" />
            <UiTableColumn prop="endTime" label="结束时间" width="180" />
            <UiTableColumn label="状态" width="100" align="center">
              <template #default="{ row }">
                <span class="status-badge" :class="statusClass(row.status)">
                  {{ row.status }}
                </span>
              </template>
            </UiTableColumn>
            <UiTableColumn label="操作" width="200" align="center">
              <template #default="{ row }">
                <div class="table-actions" v-if="row.status === '待确认'">
                  <button class="btn-success btn-xs" @click="handleConfirm(row.id)">确认</button>
                  <button class="btn-danger btn-xs" @click="handleReject(row.id)">拒绝</button>
                </div>
                <span v-else class="text-muted">—</span>
              </template>
            </UiTableColumn>
          </UiTable>
        </div>

        <!-- ===== 移动端：卡片列表 ===== -->
        <div class="reservation-card-list">
          <div
            v-for="reservation in store.vendorReservationList"
            :key="reservation.id"
            class="reservation-card"
          >
            <div class="reservation-card-row">
              <div class="reservation-card-image">
                <UiImage
                  v-if="reservation.productImageUrl"
                  :src="getFullUrl(reservation.productImageUrl)"
                  fit="cover"
                  style="width: 56px; height: 56px; border-radius: 10px;"
                />
                <span v-else class="image-placeholder">无图</span>
              </div>
              <div class="reservation-card-info">
                <div class="reservation-card-name">{{ reservation.productName }}</div>
                <div class="reservation-card-user">{{ reservation.userName }}</div>
                <div class="reservation-card-time">
                  <span>{{ reservation.startTime }}</span>
                  <span class="time-arrow">→</span>
                  <span>{{ reservation.endTime }}</span>
                </div>
              </div>
              <span class="status-badge" :class="statusClass(reservation.status)">
                {{ reservation.status }}
              </span>
            </div>
            <div class="reservation-card-actions" v-if="reservation.status === '待确认'">
              <button class="btn-success btn-xs" @click="handleConfirm(reservation.id)">确认</button>
              <button class="btn-danger btn-xs" @click="handleReject(reservation.id)">拒绝</button>
            </div>
            <div v-else class="reservation-card-actions">
              <span class="text-muted">暂无可操作项</span>
            </div>
          </div>
        </div>
      </div>
    </UiCard>
  </div>
</template>

<script setup>
import { onMounted, watch, computed } from 'vue'
import { useVendorStore } from '@/store/modules/vendor'
import { useNotificationStore } from '@/store/modules/notification'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFullUrl } from '@/utils/urlHelper'

const store = useVendorStore()
const notificationStore = useNotificationStore()

// 待确认数量
const pendingCount = computed(() => {
  return store.vendorReservationList.filter(r => r.status === '待确认').length
})

// 状态样式映射
const statusClass = (status) => {
  const map = {
    '待确认': 'status-pending',
    '已确认': 'status-confirmed',
    '已拒绝': 'status-rejected',
    '已取消': 'status-cancelled'
  }
  return map[status] || 'status-pending'
}

const handleConfirm = (id) => {
  ElMessageBox.confirm('确认该预定并生成订单吗？', '确认预定', { type: 'info' }).then(async () => {
    try {
      await store.handleConfirmReservation(id)
      ElMessage.success('预定已确认，订单已生成')
    } catch (e) {
      ElMessage.error(e.message || '确认失败')
    }
  })
}

const handleReject = (id) => {
  ElMessageBox.confirm('确定要拒绝该预定吗？', '拒绝预定', { type: 'warning' }).then(async () => {
    try {
      await store.handleRejectReservation(id)
      ElMessage.success('预定已拒绝')
    } catch (e) {
      ElMessage.error(e.message || '拒绝失败')
    }
  })
}

// 手动刷新
const refreshReservations = () => {
  store.fetchVendorReservations()
}

onMounted(async () => {
  try {
    await store.fetchVendorReservations()
  } catch (e) {
    ElMessage.error('获取预定列表失败')
  }
})

watch(
  () => notificationStore.unreadCount,
  () => {
    store.fetchVendorReservations()
  }
)
</script>

<style scoped>
/* ============================================================
   1. 设计 Token
   ============================================================ */
.reservations-page {
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
:deep(.ui-card) {
  border: none !important;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

:deep(.ui-card__header) {
  border-bottom: 1px solid var(--line);
  padding: 18px 24px;
  background: var(--surface-card);
}

:deep(.ui-card__body) {
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
  flex-wrap: wrap;
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

.pending-badge {
  font-size: 0.6rem;
  font-weight: 500;
  color: #d4a24e;
  background: #fdf6e8;
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

.reservation-table {
  border: none !important;
  font-size: 14px;
}

:deep(.reservation-table.el-table) {
  border: none !important;
}

:deep(.reservation-table th.el-table__cell) {
  background: var(--surface-subtle) !important;
  color: var(--text-secondary);
  font-weight: 500;
  border-bottom: none;
  padding: 10px 0;
}

:deep(.reservation-table td.el-table__cell) {
  border-bottom: 1px solid var(--line);
  padding: 12px 0;
}

:deep(.reservation-table--border) {
  border: none;
}

:deep(.reservation-table--border .el-table__cell) {
  border-right: none;
}

:deep(.reservation-table--border .el-table__cell:last-child) {
  border-right: none;
}

:deep(.reservation-table .cell) {
  padding: 0 8px;
}

:deep(.reservation-table .el-table__body-wrapper) {
  color: var(--text);
}

.table-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
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

.status-confirmed {
  background-color: var(--green-bg);
  color: var(--green);
}

.status-rejected {
  background-color: var(--red-bg);
  color: var(--red);
}

.status-cancelled {
  background-color: var(--line);
  color: var(--text-muted);
}

/* ============================================================
   7. 按钮
   ============================================================ */
.btn-success {
  border-radius: 100px;
  background: var(--green-bg);
  border: 1px solid transparent;
  font-weight: 500;
  color: var(--green);
  cursor: pointer;
  transition: all 0.25s;
  padding: 4px 14px;
  font-size: 0.7rem;
}

.btn-success:hover {
  background: var(--green);
  color: #fff;
}

.btn-danger {
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

.btn-danger:hover {
  border-color: var(--red);
  color: var(--red);
  background: var(--red-bg);
}

.btn-xs {
  padding: 3px 12px;
  font-size: 0.65rem;
}

.text-muted {
  color: var(--text-muted);
}

.image-placeholder {
  color: var(--text-muted);
  font-size: 0.7rem;
}

/* ============================================================
   8. 移动端卡片列表（默认隐藏）
   ============================================================ */
.reservation-card-list {
  display: none;
}

/* ============================================================
   9. 响应式适配
   ============================================================ */

/* ---- 移动端（< 768px） ---- */
@media (max-width: 767px) {
  .reservations-page {
    padding: 8px;
  }

  :deep(.ui-card__header) {
    padding: 12px 14px;
  }

  :deep(.ui-card__body) {
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

  .pending-badge {
    font-size: 0.55rem;
    padding: 0 8px;
    line-height: 18px;
  }

  /* ---- 隐藏表格 ---- */
  .table-wrapper {
    display: none;
  }

  /* ---- 显示卡片列表 ---- */
  .reservation-card-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 4px 0;
  }

  .reservation-card {
    background: #ffffff;
    border-radius: 14px;
    padding: 14px 14px 12px;
    border: 1px solid var(--line);
  }

  .reservation-card-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .reservation-card-image {
    flex-shrink: 0;
  }
  .reservation-card-image .el-image {
    width: 56px !important;
    height: 56px !important;
    border-radius: 10px;
    object-fit: cover;
  }

  .reservation-card-info {
    flex: 1;
    min-width: 0;
  }

  .reservation-card-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text);
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .reservation-card-user {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 2px;
  }

  .reservation-card-time {
    font-size: 0.7rem;
    color: var(--text-muted);
    margin-top: 4px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
  }

  .time-arrow {
    color: var(--text-muted);
    font-size: 0.6rem;
  }

  .reservation-card .status-badge {
    flex-shrink: 0;
    font-size: 0.6rem;
    padding: 1px 12px;
    margin-top: 2px;
  }

  .reservation-card-actions {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--line);
    display: flex;
    gap: 8px;
  }

  .reservation-card-actions .btn-success,
  .reservation-card-actions .btn-danger {
    flex: 1;
    padding: 8px 12px;
    font-size: 0.85rem;
    text-align: center;
  }

  .reservation-card-actions .text-muted {
    display: block;
    text-align: center;
    font-size: 0.8rem;
    padding: 4px 0;
    width: 100%;
  }

  .empty-state {
    padding: 40px 16px;
  }
}

/* ---- 平板端（768px ~ 1024px） ---- */
@media (min-width: 768px) and (max-width: 1024px) {
  .reservations-page {
    padding: 24px;
    max-width: 100%;
  }

  :deep(.ui-card__header) {
    padding: 16px 20px;
  }

  :deep(.ui-card__body) {
    padding: 20px;
  }

  .reservation-table {
    font-size: 13px;
  }

  :deep(.reservation-table th.el-table__cell) {
    padding: 8px 0;
  }

  :deep(.reservation-table td.el-table__cell) {
    padding: 10px 0;
  }

  .btn-xs {
    padding: 3px 10px;
    font-size: 0.6rem;
  }

  .table-actions {
    gap: 4px;
  }
}

/* ---- 桌面端（≥ 1024px） ---- */
@media (min-width: 1025px) {
  .reservations-page {
    padding: 28px 20px;
  }

  :deep(.ui-card__header) {
    padding: 20px 28px;
  }

  :deep(.ui-card__body) {
    padding: 28px;
  }
}
</style>
