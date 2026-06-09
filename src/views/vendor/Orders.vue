<template>
  <div class="orders-page">
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>我的订单</span>
          <el-button type="primary" size="small" @click="refreshOrders">刷新订单</el-button>
        </div>
      </template>
      <el-table
        :data="store.vendorOrderList"
        border
        style="width: 100%"
        v-loading="store.vendorOrderLoading"
      >
        <el-table-column prop="orderNo" label="订单编号" width="180" />
        <el-table-column prop="customerUsername" label="客户" width="120" />
        <el-table-column prop="totalAmount" label="总金额" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="showDetail(row.id)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 订单明细弹窗 -->
    <el-dialog v-model="store.vendorOrderDetailVisible" title="订单明细" width="600px">
      <el-table :data="store.vendorOrderItems" border>
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
        <el-table-column prop="productName" label="商品" />
        <el-table-column prop="productPrice" label="单价" />
        <el-table-column prop="quantity" label="数量" />
        <el-table-column label="小计">
          <template #default="{ row }">
            ¥{{ (row.productPrice * row.quantity).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useVendorStore } from '@/store/modules/vendor'
import { useNotificationStore } from "@/store/modules/notification";
import { ElMessage } from 'element-plus'
import { getFullUrl } from '@/utils/urlHelper'

const store = useVendorStore()
const notificationStore = useNotificationStore();

const statusTag = (status) => {
  const map = { '待付款': 'warning', '已付款': 'success', '已完成': 'info', '已取消': 'danger' }
  return map[status] || 'info'
}

const showDetail = async (orderId) => {
  try {
    await store.fetchVendorOrderItems(orderId)
  } catch (e) {
    ElMessage.error('获取订单明细失败')
  }
}

// 手动刷新
const refreshOrders = () => {
  store.fetchVendorOrders()
}

onMounted(() => {
  store.fetchVendorOrders()
})

// 监听未读数量变化，自动刷新订单列表（增加调试日志）
watch(
  () => notificationStore.unreadCount,
  (newVal, oldVal) => {
    console.log(`[小贩订单页] 未读数量变化：${oldVal} -> ${newVal}`)
    store.fetchVendorOrders()
  }
)
</script>

<style scoped>
.orders-page { padding: 20px; }
</style>