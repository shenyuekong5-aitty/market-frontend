<template>
  <div class="market-list-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <span class="page-eyebrow">AROUND YOU / 逛逛身边</span>
        <h2>今天，去逛集市。</h2>
        <p class="subtitle">走进正在营业的集市，发现摊主们认真准备的好物。</p>
      </div>
      <router-link class="discover-link" to="/discover">先看看在售商品 <ArrowRight aria-hidden="true" /></router-link>
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
          role="link"
          tabindex="0"
          @click="goToDetail(market.id)"
          @keydown.enter="goToDetail(market.id)"
          @keydown.space.prevent="goToDetail(market.id)"
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
            <span>进入集市，看看摊位</span>
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
  width: 100%;
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
  grid-template-columns: minmax(0, 1fr);
  align-items: stretch;
}

.market-grid-item {
  display: flex;
  min-width: 0;
  width: 100%;
}

/* ---- 平板端（≥ 768px）：两列 ---- */
@media (min-width: 768px) {
  .market-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }
}

/* ---- 桌面端（≥ 1024px）：三列 ---- */
@media (min-width: 1024px) {
  .market-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
  }
}

/* ---- 大桌面端（≥ 1400px）：四列 ---- */
@media (min-width: 1400px) {
  .market-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 28px;
  }
}

/* ============================================================
   5. 卡片样式
   ============================================================ */
.market-card {
  width: 100%;
  min-width: 0;
  height: 100%;
  border-radius: var(--radius);
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.market-card :deep(.ui-card__body) {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
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

.status-tag.is-success {
  background-color: var(--green-bg);
  color: var(--green);
}

.status-tag.is-danger {
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

.market-card:hover .card-footer .el-icon {
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

  .market-card :deep(.ui-card__body) {
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

  .market-card :deep(.ui-card__body) {
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

  .market-card :deep(.ui-card__body) {
    padding: 28px;
  }
}
.page-header { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 28px; padding: 28px 32px; border-radius: 27px; background: linear-gradient(110deg, #173d3a, #176b68); color: #fff; }
.page-eyebrow { display: inline-block; margin-bottom: 13px; color: #b9e6d8; font-size: 10px; font-weight: 800; letter-spacing: .16em; }
.page-header h2 { margin: 0 0 9px; color: #fff; font-family: 'Noto Serif SC','Songti SC',serif; font-size: clamp(28px, 3vw, 40px); font-weight: 750; }
.page-header .subtitle { color: #d6ebe5; font-size: 13px; line-height: 1.65; }
.discover-link { display: inline-flex; align-items: center; gap: 10px; padding: 11px 13px; flex: none; border: 1px solid #ffffff63; border-radius: 999px; color: #fff; font-size: 12px; font-weight: 750; }
.discover-link svg { width: 16px; height: 16px; }
.market-card { overflow: hidden; border: 1px solid #dce8e1; border-radius: 22px; box-shadow: 0 12px 26px rgba(23,61,58,.06); }
.market-card :deep(.ui-card__body) { padding: 25px; }
.market-name { font-size: 19px; font-weight: 800; }
.card-footer { font-weight: 750; }
@media (min-width: 1025px) { .market-list-page { max-width: 1370px; padding: 20px 0 40px; } .page-header { min-height: 230px; padding: 38px 44px; } .market-grid { grid-template-columns: repeat(3,minmax(0,1fr)); gap: 20px; } .market-card :deep(.ui-card__body) { padding: 29px; } }
@media (max-width: 767px) { .market-list-page { padding: 4px 8px 34px; background: transparent; } .page-header { align-items: flex-start; flex-direction: column; gap: 15px; padding: 24px 21px; border-radius: 22px; } .page-header h2 { font-size: 29px; } .discover-link { background: #ffffff18; } .market-grid { gap: 13px; } .market-card :deep(.ui-card__body) { padding: 21px; } .market-name { font-size: 18px; } }
</style>
