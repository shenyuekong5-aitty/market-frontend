<template>
  <div class="market-detail-page">
    <el-card v-if="marketStore.currentMarket">
      <template #header>
        <div class="market-header">
          <h3>{{ marketStore.currentMarket.name }}</h3>
          <el-tag>{{ marketStore.currentMarket.location }}</el-tag>
        </div>
      </template>

      <el-table
        :data="marketStore.boothList"
        border
        style="width: 100%"
        v-loading="marketStore.loading"
      >
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="title" label="摊位名称" />
        <el-table-column prop="position" label="位置" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === '空闲' ? 'success' : 'warning'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <!-- 空闲摊位：申请入住 / 等待审批 -->
            <template v-if="row.status === '空闲'">
              <el-button
                v-if="!row.hasPendingApply"
                type="primary"
                size="small"
                @click="handleApply(row.id)"
              >
                申请入住
              </el-button>
              <el-button
                v-else
                type="info"
                size="small"
                disabled
              >
                等待审批
              </el-button>
            </template>

            <!-- 已占用摊位：查看商品 -->
            <template v-else-if="row.status === '已占用'">
              <el-button
                type="success"
                size="small"
                @click="goToBooth(row.id)"
              >
                查看商品
              </el-button>
            </template>

            <!-- 其他状态（如停用）不显示按钮 -->
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card v-else class="empty-card">
      <div class="empty-tip">集市不存在或已停用</div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMarketStore } from '@/store/modules/market'
import { useVendorStore } from '@/store/modules/vendor'
import { ElMessage, ElMessageBox } from 'element-plus'

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
.market-detail-page {
  padding: 20px;
}
.market-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.market-header h3 {
  margin: 0;
}
.empty-card {
  margin-top: 20px;
}
.empty-tip {
  text-align: center;
  color: #909399;
  padding: 40px;
}
</style>