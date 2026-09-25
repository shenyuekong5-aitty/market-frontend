<template>
  <div class="market-list-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>探索集市</h2>
      <p class="subtitle">选择一个集市，查看空闲摊位并申请入驻</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <UiSkeleton :rows="3" animated />
    </div>

    <!-- 集市卡片列表 -->
    <div v-else-if="marketStore.marketList.length > 0" class="market-grid">
      <div
        v-for="market in marketStore.marketList"
        :key="market.id"
        class="market-grid-item"
      >
        <UiCard
          shadow="hover"
          class="market-card"
          @click="goToDetail(market.id)"
        >
          <!-- 集市名称和状态 -->
          <div class="card-header">
            <h3 class="market-name">{{ market.name }}</h3>
            <UiTag
              :type="market.status === 1 ? 'success' : 'danger'"
              size="small"
              class="status-tag"
            >
              {{ market.status === 1 ? '营业中' : '已停用' }}
            </UiTag>
          </div>

          <!-- 位置信息 -->
          <div class="market-location">
            <el-icon class="location-icon"><LocationFilled /></el-icon>
            <span class="location-text" :title="market.location">
              {{ market.location }}
            </span>
          </div>

          <!-- 描述信息 -->
          <div class="market-desc" v-if="market.description">
            {{ market.description }}
          </div>
          <div class="market-desc" v-else>
            暂无描述信息
          </div>

          <!-- 底部操作提示 -->
          <div class="card-footer">
            <span>点击查看空闲摊位</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </UiCard>
      </div>
    </div>

    <!-- 空数据状态 -->
    <div v-else class="empty-container">
      <UiEmpty description="暂无可用集市">
        <template #image>
          <el-icon :size="80" class="empty-icon"><Shop /></el-icon>
        </template>
        <p class="empty-tip">管理员还没有创建或启用任何集市</p>
        <p class="empty-tip">您可以联系管理员创建一个集市</p>
      </UiEmpty>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '@/store/modules/market'
import { ElMessage } from 'element-plus'
import { LocationFilled, ArrowRight, Shop } from '@element-plus/icons-vue'

const router = useRouter()
const marketStore = useMarketStore()
const loading = ref(false)

const goToDetail = (marketId) => {
  router.push(`/market/${marketId}`)
}

onMounted(async () => {
  loading.value = true
  try {
    await marketStore.fetchMarkets()
  } catch (e) {
    ElMessage.error('获取集市列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* ============================================================
   1. 设计 Token
   ============================================================ */
.market-list-page {
  --bg: var(--surface-page);
  --text: var(--ink-strong);
  --text-secondary: var(--ink);
  --text-muted: var(--ink-muted);
  --accent: var(--brand-primary);
  --green: var(--success);
  --green-bg: #e8f5ef;
  --shadow: var(--shadow-sm);
  --shadow-hover: var(--shadow-md);
  --radius: var(--radius-md);

  background: var(--bg);
  /* 关键修复：改用 min-height: 100% 或直接移除固定高度 */
  min-height: 100%;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: var(--text);
  /* 确保不会产生额外的滚动容器 */
  overflow: visible;
}

/* ============================================================
   2. 页面头部
   ============================================================ */
.page-header {
  margin-bottom: 32px;
}

.page-header h2 {
  font-size: 1.75rem;
  font-weight: 500;
  color: var(--text);
  margin: 0 0 6px 0;
  letter-spacing: -0.01em;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin: 0;
  font-weight: 400;
}

/* ============================================================
   3. 加载状态
   ============================================================ */
.loading-container {
  padding: 40px 0;
}

:deep(.el-skeleton__item) {
  background: var(--line);
  border-radius: 8px;
}

/* ============================================================
   4. CSS Grid 布局
   ============================================================ */
.market-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;
}

.market-grid-item {
  display: flex;
  min-width: 0;
}

/* ---- 平板端（≥ 768px）：两列 ---- */
@media (min-width: 768px) {
  .market-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

/* ---- 桌面端（≥ 1024px）：三列 ---- */
@media (min-width: 1024px) {
  .market-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}

/* ---- 大桌面端（≥ 1400px）：四列 ---- */
@media (min-width: 1400px) {
  .market-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 28px;
  }
}

/* ============================================================
   5. 卡片样式
   ============================================================ */
:deep(.el-card) {
  border: none !important;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  background: #ffffff;
  width: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-card:hover) {
  transform: translateY(-6px);
  box-shadow: var(--shadow-hover);
}

:deep(.el-card__body) {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
}

.market-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
  line-height: 1.3;
  word-break: break-word;
}

.status-tag {
  flex-shrink: 0;
  margin-top: 2px;
  border-radius: 100px;
  font-weight: 500;
  border: none;
  padding: 2px 14px;
  font-size: 0.7rem;
}

:deep(.el-tag--success.status-tag) {
  background-color: var(--green-bg);
  color: var(--green);
}

:deep(.el-tag--danger.status-tag) {
  background-color: var(--line);
  color: var(--text-muted);
}

.market-location {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-bottom: 12px;
  min-height: 2.4em;
}

.location-icon {
  flex-shrink: 0;
  color: var(--accent);
  font-size: 1rem;
  line-height: 1.4;
  margin-top: 1px;
}

.location-text {
  flex: 1;
  min-width: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.market-desc {
  color: var(--text-secondary);
  font-size: 0.85rem;
  line-height: 1.5;
  margin-bottom: 16px;
  min-height: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-shrink: 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  margin-top: auto;
  border-top: 1px solid var(--line);
  font-size: 0.8rem;
  color: var(--accent);
  font-weight: 500;
  letter-spacing: 0.02em;
}

.card-footer .el-icon {
  font-size: 1rem;
  transition: transform 0.2s ease;
}

:deep(.el-card:hover) .card-footer .el-icon {
  transform: translateX(4px);
}

/* ============================================================
   6. 空状态
   ============================================================ */
.empty-container {
  padding: 80px 20px;
  text-align: center;
}

:deep(.el-empty__image) {
  width: 120px;
}

:deep(.el-empty__description p) {
  color: var(--text-secondary);
}

.empty-tip {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 4px 0;
}

/* ============================================================
   7. 响应式微调
   ============================================================ */

/* ---- 移动端（< 768px） ---- */
@media (max-width: 767px) {
  .market-list-page {
    padding: 12px;
  }

  .page-header {
    margin-bottom: 20px;
  }

  .page-header h2 {
    font-size: 1.3rem;
  }

  .subtitle {
    font-size: 0.85rem;
  }

  .market-grid {
    gap: 12px;
  }

  :deep(.el-card__body) {
    padding: 16px;
  }

  .market-name {
    font-size: 0.95rem;
  }

  .market-location {
    font-size: 0.8rem;
    margin-bottom: 8px;
    min-height: 2.2em;
  }

  .location-icon {
    font-size: 0.9rem;
  }

  .market-desc {
    font-size: 0.8rem;
    margin-bottom: 12px;
  }

  .card-footer {
    font-size: 0.75rem;
    padding-top: 12px;
  }

  .status-tag {
    font-size: 0.6rem;
    padding: 1px 10px;
  }
}

/* ---- 平板端（768px ~ 1023px） ---- */
@media (min-width: 768px) and (max-width: 1023px) {
  .market-list-page {
    padding: 20px 24px;
  }

  .market-grid {
    gap: 16px;
  }

  :deep(.el-card__body) {
    padding: 20px;
  }

  .market-name {
    font-size: 1rem;
  }

  .market-location {
    min-height: 2.2em;
  }
}

/* ---- 桌面端（≥ 1024px） ---- */
@media (min-width: 1024px) {
  .market-list-page {
    padding: 32px 24px;
  }

  :deep(.el-card__body) {
    padding: 28px;
  }
}
</style>
