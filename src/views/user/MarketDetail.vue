<template>
  <div class="market-detail-page">
    <PageHeading title="集市里的小店" description="看看正在经营的摊位，走进每一家小店的日常。" eyebrow="MARKET / 摊位" />
    <CollectionToolbar v-model="searchQuery" :count="filteredRows.length" placeholder="搜索摊位名称、位置或状态…" />
    <UiEmpty v-if="searchQuery && !filteredRows.length" description="没有找到匹配的内容，试试其他关键词。" class="search-empty" />
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
            :data="filteredRows"
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
            v-for="booth in filteredRows"
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
import CollectionToolbar from '@/components/CollectionToolbar.vue'
import { useCollectionSearch } from '@/composables/useCollectionSearch'
import PageHeading from '@/components/PageHeading.vue'
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

const { searchQuery, filteredRows } = useCollectionSearch(() => marketStore.boothList, ['title', 'position', 'description', 'status'])
</script>
