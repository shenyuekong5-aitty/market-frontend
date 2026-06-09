<template>
  <div class="reservations-page">
    <el-card>
      <template #header>
        <span>我的预定</span>
      </template>
      <el-table
        :data="store.reservationList"
        border
        style="width: 100%"
        v-loading="store.reservationLoading"
      >
        <!-- 新增商品图片列 -->
        <el-table-column label="图片" width="80">
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
        <el-table-column prop="startTime" label="开始时间" width="180" />
        <el-table-column prop="endTime" label="结束时间" width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
              v-if="row.status === '待确认'"
              size="small"
              type="danger"
              @click="handleCancel(row.id)"
            >
              取消
            </el-button>
            <span v-else style="color: #c0c4cc;">—</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useUserMarketStore } from '@/store/modules/userMarket'
import { useNotificationStore } from '@/store/modules/notification'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFullUrl } from '@/utils/urlHelper'

const store = useUserMarketStore()
const notificationStore = useNotificationStore()

const statusTag = (status) => {
  const map = { '待确认': 'warning', '已确认': 'success', '已拒绝': 'danger', '已取消': 'info' }
  return map[status] || 'info'
}

const handleCancel = (id) => {
  ElMessageBox.confirm('确定要取消该预定吗？', '提示', { type: 'warning' }).then(async () => {
    try {
      await store.cancelUserReservation(id)
      ElMessage.success('预定已取消')
    } catch (e) {
      ElMessage.error(e.message || '取消失败')
    }
  })
}

onMounted(async () => {
  try {
    await store.fetchUserReservations()
  } catch (e) {
    ElMessage.error('获取预定列表失败')
  }
})
watch(
  () => notificationStore.unreadCount,
  () => {
    store.fetchUserReservations()
  }
)
</script>

<style scoped>
.reservations-page { padding: 20px; }
</style>