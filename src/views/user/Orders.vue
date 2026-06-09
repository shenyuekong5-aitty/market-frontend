<template>
  <div class="orders-page">
    <el-card>
      <template #header>
        <span>我的订单</span>
      </template>

      <!-- 超时提示横幅 -->
      <el-alert
        title="订单提交后请在30分钟内完成付款，超时系统将自动取消订单。"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 16px;"
      />

      <!-- 空状态 -->
      <div v-if="store.orderList.length === 0 && !store.orderLoading" class="empty-state">
        <el-empty description="暂无订单">
          <el-button type="primary" @click="$router.push('/markets')">去逛逛集市</el-button>
        </el-empty>
      </div>

      <!-- 订单列表 -->
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
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <div class="status-cell">
              <el-tag :type="statusTagType(row.status)" size="small">{{ row.status }}</el-tag>
              <el-tooltip
                v-if="row.status === '已取消'"
                content="您已手动取消订单或超时未付款，系统自动取消"
                placement="top"
              >
                <el-icon class="cancel-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
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
  v-if="row.status === '已付款'"
  size="small"
  type="primary"
  @click="handleConfirmReceive(row.id)"
>
  确认收货
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

    <!-- 订单明细弹窗 -->
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
import { QuestionFilled } from '@element-plus/icons-vue'

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
//收获
const handleConfirmReceive = (orderId) => {
  ElMessageBox.confirm('确认已收到商品吗？', '确认收货', { type: 'info' }).then(async () => {
    try {
      await store.handleConfirmReceive(orderId)
      ElMessage.success('已确认收货，订单完成')
    } catch (e) {
      ElMessage.error(e.message || '操作失败')
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
.status-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}
.cancel-icon {
  font-size: 14px;
  color: #909399;
  cursor: help;
}
.detail-total {
  text-align: right;
  margin-top: 15px;
  font-size: 16px;
  font-weight: bold;
}
</style>