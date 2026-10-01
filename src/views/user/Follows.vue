<template>
  <div class="follows-page">
    <UiCard>
      <template #header>
        <div class="follows-header">
          <span>我的关注</span>
          <span class="follow-count" v-if="followList.length > 0">
            共 {{ followList.length }} 位摊主
          </span>
        </div>
      </template>

      <!-- 空状态 -->
      <div v-if="followList.length === 0" class="empty-state">
        <UiEmpty description="还没有关注任何摊主">
          <UiButton type="primary" @click="$router.push('/markets')">
            去逛逛集市
          </UiButton>
        </UiEmpty>
      </div>

      <!-- 关注列表 -->
      <div v-else class="follow-list">
        <div
          v-for="item in followList"
          :key="item.vendorId"
          class="follow-item"
          :class="{ clickable: !!item.boothId }"
          @click="goToBooth(item)"
        >
          <div class="vendor-info">
            <!-- 头像 -->
            <UiImage
              v-if="item.avatar"
              :src="getFullUrl(item.avatar)"
              fit="cover"
              class="avatar"
            />
            <div v-else class="avatar-placeholder">
              {{ item.vendorName?.charAt(0) || 'V' }}
            </div>
            <div class="vendor-detail">
              <span class="vendor-name">{{ item.vendorName }}</span>
              <div class="booth-info" v-if="item.boothTitle">
                <span class="booth-title">{{ item.boothTitle }}</span>
                <span class="booth-position" v-if="item.boothPosition">
                  {{ item.boothPosition }}
                </span>
              </div>
              <div class="booth-info" v-else>
                <span class="booth-empty">暂无摊位</span>
              </div>
            </div>
          </div>
          <button class="btn-unfollow btn-sm" @click.stop="handleUnfollow(item.vendorId)">
            取消关注
          </button>
        </div>
      </div>
    </UiCard>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserMarketStore } from '@/store/modules/userMarket'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFullUrl } from '@/utils/urlHelper'

const router = useRouter()
const store = useUserMarketStore()
const followList = computed(() => store.followList)

onMounted(async () => {
  try {
    await store.fetchFollowList()
  } catch (e) {
    ElMessage.error('获取关注列表失败')
  }
})

const goToBooth = (item) => {
  if (item.boothId) {
    router.push(`/booth/${item.boothId}`)
  } else {
    ElMessage.info('该摊主暂无摊位')
  }
}

const handleUnfollow = (vendorId) => {
  ElMessageBox.confirm('确定要取消关注吗？', '提示', { type: 'warning' }).then(async () => {
    try {
      await store.unfollow(vendorId)
      ElMessage.success('已取消关注')
    } catch (e) {
      ElMessage.error(e.message || '操作失败')
    }
  })
}
</script>

<style scoped>
/* ============================================================
   1. 设计 Token
   ============================================================ */
.follows-page {
  --bg: var(--surface-page);
  --text: var(--ink-strong);
  --text-secondary: var(--ink);
  --text-muted: var(--ink-muted);
  --accent: var(--brand-primary);
  --accent-light: var(--brand-primary-soft);
  --red: var(--danger);
  --red-bg: #fdebea;
  --shadow: var(--shadow-sm);
  --shadow-hover: var(--shadow-md);
  --radius: var(--radius-md);

  padding: 20px;
  max-width: 820px;
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
   3. 头部
   ============================================================ */
.follows-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  color: var(--text);
}

.follow-count {
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
   5. 关注列表
   ============================================================ */
.follow-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ============================================================
   6. 关注项卡片
   ============================================================ */
.follow-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 14px;
  transition: all 0.3s ease;
  gap: 16px;
}

.follow-item.clickable {
  cursor: pointer;
}

.follow-item.clickable:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

.follow-item:active {
  transform: scale(0.99);
}

/* ============================================================
   7. 左侧信息区
   ============================================================ */
.vendor-info {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

/* 头像 */
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--line);
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent-light);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  flex-shrink: 0;
}

/* 摊主详情 */
.vendor-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.vendor-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.booth-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.booth-title {
  color: var(--text-secondary);
}

.booth-position {
  padding-left: 10px;
  border-left: 1px solid var(--line);
  color: var(--text-muted);
  font-size: 12px;
}

.booth-empty {
  color: var(--text-muted);
  font-size: 13px;
}

/* ============================================================
   8. 取消关注按钮
   ============================================================ */
.btn-unfollow {
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 100px;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s;
  padding: 6px 18px;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.btn-unfollow:hover {
  border-color: var(--red);
  color: var(--red);
  background: var(--red-bg);
}

.btn-unfollow:active {
  transform: scale(0.95);
}

.btn-sm {
  padding: 5px 16px;
  font-size: 0.7rem;
}

/* ============================================================
   9. 响应式适配
   ============================================================ */

/* ---- 移动端（< 768px） ---- */
@media (max-width: 767px) {
  .follows-page {
    padding: 8px;
  }

  :deep(.ui-card__header) {
    padding: 14px 16px;
  }

  :deep(.ui-card__body) {
    padding: 12px 8px;
  }

  .follows-header {
    font-size: 14px;
  }

  .follow-count {
    font-size: 12px;
  }

  .follow-list {
    gap: 10px;
  }

  .follow-item {
    padding: 14px 14px;
    flex-wrap: wrap;
    border-radius: 12px;
  }

  .vendor-info {
    gap: 12px;
    flex: 1 1 100%;
  }

  .avatar {
    width: 44px;
    height: 44px;
  }

  .avatar-placeholder {
    width: 44px;
    height: 44px;
    font-size: 16px;
  }

  .vendor-name {
    font-size: 14px;
  }

  .booth-info {
    font-size: 12px;
    gap: 6px;
  }

  .booth-position {
    padding-left: 6px;
    font-size: 11px;
  }

  .btn-unfollow {
    width: 100%;
    padding: 10px 16px;
    font-size: 14px;
    text-align: center;
    margin-top: 4px;
  }

  .btn-sm {
    padding: 8px 16px;
    font-size: 13px;
  }

  /* 点击反馈优化 */
  .follow-item.clickable:active {
    transform: scale(0.98);
  }
}

/* ---- 平板端（768px ~ 1024px） ---- */
@media (min-width: 768px) and (max-width: 1024px) {
  .follows-page {
    padding: 24px;
    max-width: 100%;
  }

  :deep(.ui-card__header) {
    padding: 18px 20px;
  }

  :deep(.ui-card__body) {
    padding: 20px;
  }

  .follow-item {
    padding: 14px 18px;
  }

  .btn-unfollow {
    padding: 5px 16px;
    font-size: 0.7rem;
  }
}

/* ---- 桌面端（≥ 1024px） ---- */
@media (min-width: 1025px) {
  .follows-page {
    padding: 32px 20px;
  }

  :deep(.ui-card__header) {
    padding: 24px 28px;
  }

  :deep(.ui-card__body) {
    padding: 28px;
  }

  .follow-item {
    padding: 18px 24px;
  }
}
</style>
