<template>
  <div class="market-detail-page">
    <!-- 集市信息卡片 -->
    <UiCard v-if="marketStore.currentMarket" class="market-info-card">
      <template #header>
        <div class="market-header">
          <div class="header-left">
            <h3>{{ marketStore.currentMarket.name }}</h3>
            <span class="location-tag">
              <el-icon><LocationFilled /></el-icon>
              {{ marketStore.currentMarket.location }}
            </span>
          </div>
          <UiTag
            :type="marketStore.currentMarket.status === 1 ? 'success' : 'danger'"
            class="status-tag"
          >
            {{ marketStore.currentMarket.status === 1 ? '营业中' : '已停用' }}
          </UiTag>
        </div>
      </template>

      <!-- 摊位列表 -->
      <div v-loading="marketStore.loading">
        <!-- ===== 桌面/平板：表格 ===== -->
        <div class="table-wrapper">
          <UiTable
            :data="marketStore.boothList"
            border
            style="width: 100%"
            class="booth-table"
          >
            <UiTableColumn prop="id" label="ID" width="60" />
            <UiTableColumn prop="title" label="摊位名称" min-width="120" />
            <UiTableColumn prop="position" label="位置" width="120" />
            <UiTableColumn prop="description" label="描述" min-width="140" />
            <UiTableColumn label="状态" width="100" align="center">
              <template #default="{ row }">
                <span
                  class="status-badge"
                  :class="row.status === '空闲' ? 'status-free' : 'status-occupied'"
                >
                  {{ row.status }}
                </span>
              </template>
            </UiTableColumn>
            <UiTableColumn label="操作" width="200" align="center">
              <template #default="{ row }">
                <!-- 空闲摊位：申请入住 / 等待审批 -->
                <template v-if="row.status === '空闲'">
                  <button
                    v-if="!row.hasPendingApply"
                    class="btn-primary btn-sm"
                    @click="handleApply(row.id)"
                  >
                    申请入住
                  </button>
                  <button
                    v-else
                    class="btn-disabled btn-sm"
                    disabled
                  >
                    等待审批
                  </button>
                </template>

                <!-- 已占用摊位：查看商品 -->
                <template v-else-if="row.status === '已占用'">
                  <button
                    class="btn-outline btn-sm"
                    @click="goToBooth(row.id)"
                  >
                    查看商品
                  </button>
                </template>

                <!-- 其他状态 -->
                <span v-else class="text-muted">-</span>
              </template>
            </UiTableColumn>
          </UiTable>
        </div>

        <!-- ===== 移动端：卡片列表 ===== -->
        <div class="booth-card-list">
          <div
            v-for="booth in marketStore.boothList"
            :key="booth.id"
            class="booth-card"
          >
            <div class="booth-card-row">
              <div class="booth-card-info">
                <div class="booth-card-title">{{ booth.title }}</div>
                <div class="booth-card-meta">
                  <span class="meta-item">#{{ booth.id }}</span>
                  <span class="meta-divider">·</span>
                  <span class="meta-item">{{ booth.position }}</span>
                </div>
              </div>
              <span
                class="status-badge"
                :class="booth.status === '空闲' ? 'status-free' : 'status-occupied'"
              >
                {{ booth.status }}
              </span>
            </div>

            <div class="booth-card-desc" v-if="booth.description">
              {{ booth.description }}
            </div>

            <div class="booth-card-actions">
              <template v-if="booth.status === '空闲'">
                <button
                  v-if="!booth.hasPendingApply"
                  class="btn-primary btn-sm"
                  @click="handleApply(booth.id)"
                >
                  申请入住
                </button>
                <button
                  v-else
                  class="btn-disabled btn-sm"
                  disabled
                >
                  等待审批
                </button>
              </template>
              <template v-else-if="booth.status === '已占用'">
                <button
                  class="btn-outline btn-sm"
                  @click="goToBooth(booth.id)"
                >
                  查看商品
                </button>
              </template>
              <span v-else class="text-muted">-</span>
            </div>
          </div>
        </div>
      </div>
    </UiCard>

    <!-- 空状态 -->
    <UiCard v-else class="empty-card">
      <div class="empty-tip">
        <el-icon :size="48" class="empty-icon"><Shop /></el-icon>
        <p>集市不存在或已停用</p>
      </div>
    </UiCard>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMarketStore } from '@/store/modules/market'
import { useVendorStore } from '@/store/modules/vendor'
import { ElMessage, ElMessageBox } from 'element-plus'
import { LocationFilled, Shop } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const marketStore = useMarketStore()
const vendorStore = useVendorStore()
const marketId = Number(route.params.id)

// 加载集市信息和所有摊位（包括空闲和已占用）
const loadData = async () => {
  try {
    await marketStore.fetchMarkets()
    marketStore.setCurrentMarketById(marketId)
    if (!marketStore.currentMarket) {
      ElMessage.error('集市不存在')
      return
    }
    await marketStore.fetchAllBooths(marketId)
  } catch (e) {
    ElMessage.error('加载集市信息失败')
  }
}

// 跳转到摊位商品详情页
const goToBooth = (boothId) => {
  router.push(`/booth/${boothId}`)
}

// 申请入住（带确认提示）
const handleApply = async (boothId) => {
  try {
    await ElMessageBox.confirm(
      '申请入住后，您的身份将从普通用户转变为小贩，此操作不可逆。确定要继续吗？',
      '确认身份转变',
      { confirmButtonText: '确定申请', cancelButtonText: '取消', type: 'warning' }
    )
    await vendorStore.submitBoothApplication(boothId)
    ElMessage.success('申请已提交，请等待管理员审批')
    // 刷新摊位列表
    await marketStore.fetchAllBooths(marketId)
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error(e.message || '申请失败')
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* ============================================================
   1. 设计 Token
   ============================================================ */
.market-detail-page {
  --bg: var(--surface-page);
  --text: var(--ink-strong);
  --text-secondary: var(--ink);
  --text-muted: var(--ink-muted);
  --accent: var(--brand-primary);
  --accent-light: var(--brand-primary-soft);
  --green: var(--success);
  --green-bg: #e8f5ef;
  --shadow: var(--shadow-sm);
  --shadow-hover: var(--shadow-md);
  --radius: var(--radius-md);

  padding: 20px;
  max-width: 1000px;
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
  padding: 20px 24px;
  background: var(--surface-card);
}

:deep(.ui-card__body) {
  padding: 24px;
}

/* ============================================================
   3. 集市头部
   ============================================================ */
.market-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.market-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.location-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  font-size: 0.85rem;
  background: var(--line);
  padding: 4px 14px;
  border-radius: 100px;
}

.location-tag .el-icon {
  color: var(--accent);
  font-size: 0.9rem;
}

.status-tag {
  flex-shrink: 0;
  border-radius: 100px;
  font-weight: 500;
  border: none;
  padding: 4px 16px;
  font-size: 0.75rem;
}

:deep(.ui-tag.is-success.status-tag) {
  background-color: var(--green-bg);
  color: var(--green);
}

:deep(.ui-tag.is-danger.status-tag) {
  background-color: var(--line);
  color: var(--text-muted);
}

/* ============================================================
   4. 表格样式
   ============================================================ */
.table-wrapper {
  overflow-x: auto;
  margin: 0 -4px;
}

.booth-table {
  border: none !important;
  font-size: 14px;
}

:deep(.booth-table.el-table) {
  border: none !important;
}

:deep(.booth-table th.el-table__cell) {
  background: var(--surface-subtle) !important;
  color: var(--text-secondary);
  font-weight: 500;
  border-bottom: none;
  padding: 12px 0;
}

:deep(.booth-table td.el-table__cell) {
  border-bottom: 1px solid var(--line);
  padding: 14px 0;
}

:deep(.booth-table--border) {
  border: none;
}

:deep(.booth-table--border .el-table__cell) {
  border-right: none;
}

:deep(.booth-table--border .el-table__cell:last-child) {
  border-right: none;
}

:deep(.booth-table .cell) {
  padding: 0 8px;
}

:deep(.booth-table .el-table__body-wrapper) {
  color: var(--text);
}

/* ============================================================
   5. 状态标签
   ============================================================ */
.status-badge {
  display: inline-block;
  padding: 2px 14px;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 500;
}

.status-free {
  background-color: var(--green-bg);
  color: var(--green);
}

.status-occupied {
  background-color: var(--line);
  color: var(--text-muted);
}

/* ============================================================
   6. 按钮
   ============================================================ */
.btn-primary {
  background: var(--text);
  border: none;
  border-radius: 100px;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.25s, transform 0.2s;
  padding: 6px 18px;
  font-size: 0.75rem;
}

.btn-primary:hover {
  background: var(--accent);
}

.btn-primary:active {
  transform: scale(0.96);
}

.btn-outline {
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

.btn-outline:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

.btn-disabled {
  background: var(--line);
  border: none;
  border-radius: 100px;
  color: var(--text-muted);
  font-weight: 500;
  padding: 6px 18px;
  font-size: 0.75rem;
  cursor: not-allowed;
}

.btn-sm {
  padding: 5px 16px;
  font-size: 0.7rem;
}

.text-muted {
  color: var(--text-muted);
}

/* ============================================================
   7. 移动端卡片列表（默认隐藏）
   ============================================================ */
.booth-card-list {
  display: none;
}

/* ============================================================
   8. 空状态
   ============================================================ */
.empty-card {
  margin-top: 20px;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-muted);
  padding: 40px 20px;
  text-align: center;
}

.empty-tip p {
  margin: 0;
  font-size: 0.95rem;
}

/* ============================================================
   9. 响应式适配
   ============================================================ */

/* ---- 移动端（< 768px） ---- */
@media (max-width: 767px) {
  .market-detail-page {
    padding: 8px;
  }

  :deep(.ui-card__header) {
    padding: 14px 16px;
  }

  :deep(.ui-card__body) {
    padding: 12px 8px;
  }

  .market-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-left {
    width: 100%;
  }

  .market-header h3 {
    font-size: 1.05rem;
    width: 100%;
  }

  .location-tag {
    font-size: 0.75rem;
    padding: 3px 12px;
  }

  /* ---- 隐藏表格 ---- */
  .table-wrapper {
    display: none;
  }

  /* ---- 显示卡片列表 ---- */
  .booth-card-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 4px 0;
  }

  .booth-card {
    background: #ffffff;
    border-radius: 14px;
    padding: 14px 16px;
    box-shadow: 0 2px 12px rgba(44, 37, 32, 0.04);
    border: 1px solid var(--line);
  }

  .booth-card-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }

  .booth-card-info {
    flex: 1;
    min-width: 0;
  }

  .booth-card-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text);
    line-height: 1.3;
  }

  .booth-card-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .meta-divider {
    color: #d5cdc2;
  }

  .booth-card-desc {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--line);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .booth-card-actions {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--line);
  }

  .booth-card-actions .btn-primary,
  .booth-card-actions .btn-outline,
  .booth-card-actions .btn-disabled {
    width: 100%;
    padding: 10px 16px;
    font-size: 0.85rem;
    text-align: center;
  }

  /* 状态标签在卡片中的位置 */
  .booth-card .status-badge {
    flex-shrink: 0;
    font-size: 0.65rem;
    padding: 2px 12px;
  }
}

/* ---- 平板端（768px ~ 1024px） ---- */
@media (min-width: 768px) and (max-width: 1024px) {
  .market-detail-page {
    padding: 24px;
    max-width: 100%;
  }

  :deep(.ui-card__header) {
    padding: 18px 20px;
  }

  :deep(.ui-card__body) {
    padding: 20px;
  }

  .booth-table {
    font-size: 13px;
  }

  :deep(.booth-table th.el-table__cell) {
    padding: 10px 0;
  }

  :deep(.booth-table td.el-table__cell) {
    padding: 12px 0;
  }

  .btn-sm {
    padding: 4px 14px;
    font-size: 0.65rem;
  }
}

/* ---- 桌面端（≥ 1024px） ---- */
@media (min-width: 1025px) {
  .market-detail-page {
    padding: 32px 20px;
  }

  :deep(.ui-card__header) {
    padding: 24px 28px;
  }

  :deep(.ui-card__body) {
    padding: 28px;
  }
}
</style>
