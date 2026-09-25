<template>
  <div class="reservations-page">
    <UiCard>
      <template #header>
        <div class="reservations-header">
          <span>我的预定</span>
          <span class="reservation-count" v-if="store.reservationList.length > 0">
            共 {{ store.reservationList.length }} 条预定
          </span>
        </div>
      </template>

      <!-- 空状态 -->
      <div
        v-if="store.reservationList.length === 0 && !store.reservationLoading"
        class="empty-state"
      >
        <UiEmpty description="暂无预定">
          <UiButton type="primary" @click="$router.push('/markets')">
            去逛逛集市
          </UiButton>
        </UiEmpty>
      </div>

      <!-- 非空状态 -->
      <div v-else>
        <!-- ===== 桌面/平板：表格 ===== -->
        <div class="table-wrapper">
          <UiTable
            :data="store.reservationList"
            border
            style="width: 100%"
            v-loading="store.reservationLoading"
            class="reservation-table"
          >
            <UiTableColumn label="图片" width="80">
              <template #default="{ row }">
                <UiImage
                  v-if="row.productImageUrl"
                  :src="getFullUrl(row.productImageUrl)"
                  fit="cover"
                  style="width: 50px; height: 50px; border-radius: 8px;"
                />
                <span v-else class="muted-placeholder">暂无</span>
              </template>
            </UiTableColumn>
            <UiTableColumn prop="productName" label="商品" min-width="140" />
            <UiTableColumn prop="startTime" label="开始时间" width="180" />
            <UiTableColumn prop="endTime" label="结束时间" width="180" />
            <UiTableColumn label="状态" width="100" align="center">
              <template #default="{ row }">
                <span
                  class="status-badge"
                  :class="statusClass(row.status)"
                >
                  {{ row.status }}
                </span>
              </template>
            </UiTableColumn>
            <UiTableColumn label="操作" width="120" align="center">
              <template #default="{ row }">
                <button
                  v-if="row.status === '待确认'"
                  class="btn-danger btn-sm"
                  @click="handleCancel(row.id)"
                >
                  取消
                </button>
                <span v-else class="text-muted">—</span>
              </template>
            </UiTableColumn>
          </UiTable>
        </div>

        <!-- ===== 移动端：卡片列表 ===== -->
        <div class="reservation-card-list">
          <div
            v-for="reservation in store.reservationList"
            :key="reservation.id"
            class="reservation-card"
          >
            <!-- 第一行：图片 + 名称 + 状态 -->
            <div class="reservation-card-row">
              <div class="reservation-card-image">
                <UiImage
                  v-if="reservation.productImageUrl"
                  :src="getFullUrl(reservation.productImageUrl)"
                  fit="cover"
                  style="width: 60px; height: 60px; border-radius: 10px;"
                />
                <span v-else class="image-placeholder">无图</span>
              </div>
              <div class="reservation-card-info">
                <div class="reservation-card-name">{{ reservation.productName }}</div>
                <div class="reservation-card-time">
                  <span>{{ reservation.startTime }}</span>
                  <span class="time-divider">→</span>
                  <span>{{ reservation.endTime }}</span>
                </div>
              </div>
              <span
                class="status-badge"
                :class="statusClass(reservation.status)"
              >
                {{ reservation.status }}
              </span>
            </div>

            <!-- 第二行：操作按钮 -->
            <div class="reservation-card-actions">
              <button
                v-if="reservation.status === '待确认'"
                class="btn-danger btn-sm"
                @click="handleCancel(reservation.id)"
              >
                取消预定
              </button>
              <span v-else class="text-muted">暂无可操作项</span>
            </div>
          </div>
        </div>
      </div>
    </UiCard>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useUserMarketStore } from '@/store/modules/userMarket'
import { useNotificationStore } from '@/store/modules/notification'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFullUrl } from '@/utils/urlHelper'

const store = useUserMarketStore()
const notificationStore = useNotificationStore()

// 状态样式映射
const statusClass = (status) => {
  const map = {
    '待确认': 'status-pending',
    '已确认': 'status-confirmed',
    '已拒绝': 'status-rejected',
    '已取消': 'status-cancelled',
  }
  return map[status] || 'status-pending'
}

const handleCancel = (id) => {
  ElMessageBox.confirm('确定要取消该预定吗？', '提示', { type: 'warning' }).then(async () => {
    try {
      await store.cancelUserReservation(id)
      ElMessage.success('预定已取消')
    } catch (e) {
      ElMessage.error(e.message || '取消失败')
    }
  })
}

onMounted(async () => {
  try {
    await store.fetchUserReservations()
  } catch (e) {
    ElMessage.error('获取预定列表失败')
  }
})

watch(
  () => notificationStore.unreadCount,
  () => {
    store.fetchUserReservations()
  }
)
</script>

<style scoped>
/* ============================================================
   1. 设计 Token
   ============================================================ */
.reservations-page {
  --bg: var(--surface-page);
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
  padding: 20px 24px;
  background: var(--surface-card);
}

:deep(.el-card__body) {
  padding: 24px;
}

/* ============================================================
   3. 头部
   ============================================================ */
.reservations-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  color: var(--text);
}

.reservation-count {
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--text-secondary);
}

/* ============================================================
   4. 空状态
   ============================================================ */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state .el-button--primary {
  background: var(--text);
  border: none;
  border-radius: 100px;
  padding: 10px 28px;
  font-weight: 500;
}
.empty-state .el-button--primary:hover {
  background: var(--accent);
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
  padding: 12px 0;
}

:deep(.reservation-table td.el-table__cell) {
  border-bottom: 1px solid var(--line);
  padding: 14px 0;
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
.btn-danger {
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 100px;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.25s, color 0.25s, background 0.25s;
  padding: 5px 18px;
  font-size: 0.75rem;
}
.btn-danger:hover {
  border-color: var(--red);
  color: var(--red);
  background: var(--red-bg);
}
.btn-danger:active {
  transform: scale(0.96);
}

.btn-sm {
  padding: 4px 14px;
  font-size: 0.7rem;
}

.text-muted {
  color: var(--text-muted);
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

  :deep(.el-card__header) {
    padding: 14px 16px;
  }

  :deep(.el-card__body) {
    padding: 12px 8px;
  }

  .reservations-header {
    font-size: 14px;
  }

  .reservation-count {
    font-size: 12px;
  }

  /* ---- 隐藏表格 ---- */
  .table-wrapper {
    display: none;
  }

  /* ---- 显示卡片列表 ---- */
  .reservation-card-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 4px 0;
  }

  .reservation-card {
    background: #ffffff;
    border-radius: 14px;
    padding: 14px 16px;
    box-shadow: 0 2px 12px rgba(44, 37, 32, 0.04);
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
    width: 60px !important;
    height: 60px !important;
    border-radius: 10px;
    object-fit: cover;
  }
  .image-placeholder {
    width: 60px;
    height: 60px;
    border-radius: 10px;
    background: var(--line);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: var(--text-muted);
  }

  .reservation-card-info {
    flex: 1;
    min-width: 0;
  }

  .reservation-card-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text);
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .reservation-card-time {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 4px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
  }

  .time-divider {
    color: var(--text-muted);
    margin: 0 2px;
  }

  .reservation-card .status-badge {
    flex-shrink: 0;
    font-size: 0.6rem;
    padding: 2px 12px;
    margin-top: 2px;
  }

  .reservation-card-actions {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--line);
  }

  .reservation-card-actions .btn-danger {
    width: 100%;
    padding: 10px 16px;
    font-size: 14px;
    text-align: center;
  }

  .reservation-card-actions .text-muted {
    display: block;
    text-align: center;
    font-size: 13px;
    padding: 4px 0;
  }
}

/* ---- 平板端（768px ~ 1024px） ---- */
@media (min-width: 768px) and (max-width: 1024px) {
  .reservations-page {
    padding: 24px;
    max-width: 100%;
  }

  :deep(.el-card__header) {
    padding: 18px 20px;
  }

  :deep(.el-card__body) {
    padding: 20px;
  }

  .reservation-table {
    font-size: 13px;
  }

  :deep(.reservation-table th.el-table__cell) {
    padding: 10px 0;
  }

  :deep(.reservation-table td.el-table__cell) {
    padding: 12px 0;
  }

  .btn-sm {
    padding: 4px 12px;
    font-size: 0.65rem;
  }
}

/* ---- 桌面端（≥ 1024px） ---- */
@media (min-width: 1025px) {
  .reservations-page {
    padding: 32px 20px;
  }

  :deep(.el-card__header) {
    padding: 24px 28px;
  }

  :deep(.el-card__body) {
    padding: 28px;
  }
}
</style>
