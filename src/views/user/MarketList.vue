<template>
  <div class="market-list-page">
    <PageHeading title="逛逛身边的集市" description="从一座集市出发，找到今天喜欢的好物。" eyebrow="EXPLORE / 集市" />
    <CollectionToolbar v-model="searchQuery" :count="filteredRows.length" placeholder="搜索集市名称或位置…" />
    <UiEmpty v-if="searchQuery && !filteredRows.length" description="没有找到匹配的内容，试试其他关键词。" class="search-empty" />
    <!-- 页面标题 -->
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <UiSkeleton :rows="3" animated />
    </div>

    <!-- 集市卡片列表 -->
    <div v-else-if="marketStore.marketList.length > 0" class="market-grid">
      <div
        v-for="market in filteredRows"
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
import CollectionToolbar from '@/components/CollectionToolbar.vue'
import { useCollectionSearch } from '@/composables/useCollectionSearch'
import PageHeading from '@/components/PageHeading.vue'
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

const { searchQuery, filteredRows } = useCollectionSearch(() => marketStore.marketList, ['name', 'location', 'description'])
</script>
