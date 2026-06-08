<template>
  <div class="orders-page">
    <el-card>
      <template #header>
        <span>我的订单</span>
      </template>

      <div v-if="store.orderList.length === 0 && !store.orderLoading" class="empty-state">
        <el-empty description="暂无订单">
          <el-button type="primary" @click="$router.push('/markets')">去逛逛集市</el-button>
        </el-empty>
      </div>

      <el-table
        v-else
        :data="store.orderList"
        border
        style="width: 100%"
        v-loading="store.orderLoading"
      >
        <el-table-column prop="orderNo" label="订单编号" width="180" />
        <el-table-column prop="vendorUsername" label="摊主" width="120" />
        <el-table-column prop="totalAmount" label="总金额" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180" />
        <el-table-column label="操作" width="240">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="showDetail(row.id)">详情</el-button>
            <el-button
              v-if="row.status === '待付款'"
              size="small"
              type="success"
              @click="handlePay(row.id)"
            >
              付款
            </el-button>
            <el-button
              v-if="row.status === '待付款'"
              size="small"
              type="danger"
              @click="handleCancel(row.id)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="detailVisible" title="订单明细" width="650px">
      <el-table :data="store.currentOrderItems" border>
        <el-table-column label="商品图片" width="80">
          <template #default="{ row }">
            <el-image
              v-if="row.productImageUrl"
              :src="getFullUrl(row.productImageUrl)"
              fit="cover"
              style="width: 50px; height: 50px; border-radius: 4px;"
            />
            <span v-else style="color: #c0c4cc;">暂无</span>
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="productPrice" label="单价" width="80" />
        <el-table-column prop="quantity" label="数量" width="60" />
        <el-table-column label="小计" width="80">
          <template #default="{ row }">
            ¥{{ (row.productPrice * row.quantity).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
      <div class="detail-total" v-if="store.currentOrderItems.length > 0">
        订单总金额：¥{{ detailTotal }}
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserMarketStore } from '@/store/modules/userMarket'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFullUrl } from '@/utils/urlHelper'

const store = useUserMarketStore()
const detailVisible = ref(false)

const statusTagType = (status) => {
  const map = { '待付款': 'warning', '已付款': 'success', '已完成': 'info', '已取消': 'danger' }
  return map[status] || 'info'
}

const detailTotal = computed(() => {
  return store.currentOrderItems.reduce((sum, item) => {
    return sum + (item.productPrice || 0) * (item.quantity || 0)
  }, 0).toFixed(2)
})

onMounted(async () => {
  try {
    await store.fetchOrders()
  } catch (e) {
    ElMessage.error('获取订单列表失败')
  }
})

const showDetail = async (orderId) => {
  try {
    await store.fetchOrderDetail(orderId)
    detailVisible.value = true
  } catch (e) {
    ElMessage.error('获取明细失败')
  }
}

const handlePay = (orderId) => {
  ElMessageBox.confirm('确认支付该订单吗？', '付款', { type: 'info' }).then(async () => {
    try {
      await store.handlePayOrder(orderId)
      ElMessage.success('支付成功')
    } catch (e) {
      ElMessage.error(e.message || '支付失败')
    }
  })
}

const handleCancel = (orderId) => {
  ElMessageBox.confirm('确定要取消该订单吗？库存将恢复。', '取消订单', { type: 'warning' }).then(async () => {
    try {
      await store.handleCancelOrder(orderId)
      ElMessage.success('订单已取消')
    } catch (e) {
      ElMessage.error(e.message || '取消失败')
    }
  })
}
</script>

<style scoped>
.orders-page {
  padding: 20px;
}
.empty-state {
  text-align: center;
  padding: 40px;
}
.detail-total {
  text-align: right;
  margin-top: 15px;
  font-size: 16px;
  font-weight: bold;
}
</style>