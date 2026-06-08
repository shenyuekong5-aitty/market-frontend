<template>
  <div class="orders-page">
    <el-card>
      <template #header>
        <span>我的订单</span>
      </template>
      <el-table :data="store.orderList" border style="width: 100%" v-loading="store.orderLoading">
        <el-table-column prop="orderNo" label="订单编号" width="180" />
        <el-table-column prop="vendorUsername" label="摊主" width="100" />
        <el-table-column prop="totalAmount" label="总金额" width="100" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="showDetail(row.id)">详情</el-button>
            <el-button v-if="row.status === '待付款'" size="small" type="success" @click="handlePay(row.id)">付款</el-button>
            <el-button v-if="row.status === '待付款' || row.status === '已付款'" size="small" type="danger" @click="handleCancel(row.id)">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 订单明细弹窗 -->
    <el-dialog v-model="detailVisible" title="订单明细" width="600px">
      <el-table :data="store.currentOrderItems" border>
        <el-table-column prop="productName" label="商品名" />
        <el-table-column prop="productPrice" label="单价" />
        <el-table-column prop="quantity" label="数量" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserMarketStore } from '@/store/modules/userMarket'
import { ElMessage, ElMessageBox } from 'element-plus'

const store = useUserMarketStore()
const detailVisible = ref(false)

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

const handlePay = async (orderId) => {
  ElMessageBox.confirm('确认支付吗？', '付款', { type: 'info' }).then(async () => {
    try {
      await store.handlePayOrder(orderId)
      ElMessage.success('支付成功')
    } catch (e) {
      ElMessage.error(e.message || '支付失败')
    }
  })
}

const handleCancel = async (orderId) => {
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
.orders-page { padding: 20px; }
</style>