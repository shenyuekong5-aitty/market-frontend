<template>
  <div class="market-list-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>探索集市</h2>
      <p class="subtitle">选择一个集市，查看空闲摊位并申请入驻</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 集市卡片列表 -->
    <el-row v-else-if="marketStore.marketList.length > 0" :gutter="20">
      <el-col
        v-for="market in marketStore.marketList"
        :key="market.id"
        :xs="24"
        :sm="12"
        :lg="8"
      >
        <el-card
          shadow="hover"
          class="market-card"
          @click="goToDetail(market.id)"
        >
          <!-- 集市名称和状态 -->
          <div class="card-header">
            <h3 class="market-name">{{ market.name }}</h3>
            <el-tag
              :type="market.status === 1 ? 'success' : 'danger'"
              size="small"
            >
              {{ market.status === 1 ? '营业中' : '已停用' }}
            </el-tag>
          </div>

          <!-- 位置信息 -->
          <div class="market-location">
            <el-icon><LocationFilled /></el-icon>
            <span>{{ market.location }}</span>
          </div>

          <!-- 描述信息（如果有） -->
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
        </el-card>
      </el-col>
    </el-row>

    <!-- 空数据状态 -->
    <div v-else class="empty-container">
      <el-empty description="暂无可用集市">
        <template #image>
          <el-icon :size="80" color="#909399"><Shop /></el-icon>
        </template>
        <p class="empty-tip">管理员还没有创建或启用任何集市</p>
        <p class="empty-tip">您可以联系管理员创建一个集市</p>
      </el-empty>
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
.market-list-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 28px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.loading-container {
  padding: 40px 0;
}

/* 集市卡片样式 */
.market-card {
  cursor: pointer;
  margin-bottom: 20px;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.market-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border-color: #d9ecff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.market-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.market-location {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 14px;
  margin-bottom: 12px;
}

.market-location .el-icon {
  color: #409eff;
}

.market-desc {
  color: #909399;
  font-size: 13px;
  margin-bottom: 16px;
  line-height: 1.5;
  min-height: 20px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
  font-size: 13px;
  color: #409eff;
}

.empty-container {
  padding: 60px 0;
  text-align: center;
}

.empty-tip {
  color: #909399;
  font-size: 14px;
  margin: 4px 0;
}
</style>