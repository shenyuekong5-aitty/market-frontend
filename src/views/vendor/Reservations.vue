<template>
  <div class="reservations-page">
    <el-card>
      <template #header>
        <span>预定处理</span>
      </template>
      <el-table
        :data="store.vendorReservationList"
        border
        style="width: 100%"
        v-loading="store.vendorReservationLoading"
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
        <el-table-column prop="userName" label="预定用户" width="120" />
        <el-table-column prop="productName" label="商品" />
        <el-table-column prop="startTime" label="开始时间" width="180" />
        <el-table-column prop="endTime" label="结束时间" width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <template v-if="row.status === '待确认'">
              <el-button size="small" type="success" @click="handleConfirm(row.id)">确认</el-button>
              <el-button size="small" type="danger" @click="handleReject(row.id)">拒绝</el-button>
            </template>
            <span v-else style="color: #c0c4cc;">—</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useVendorStore } from '@/store/modules/vendor'
import { useNotificationStore } from '@/store/modules/notification'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFullUrl } from '@/utils/urlHelper'

const store = useVendorStore()
const notificationStore = useNotificationStore()

const statusTag = (status) => {
  const map = { '待确认': 'warning', '已确认': 'success', '已拒绝': 'danger', '已取消': 'info' }
  return map[status] || 'info'
}

const handleConfirm = (id) => {
  ElMessageBox.confirm('确认该预定并生成订单吗？', '确认预定', { type: 'info' }).then(async () => {
    try {
      await store.handleConfirmReservation(id)
      ElMessage.success('预定已确认，订单已生成')
    } catch (e) {
      ElMessage.error(e.message || '确认失败')
    }
  })
}

const handleReject = (id) => {
  ElMessageBox.confirm('确定要拒绝该预定吗？', '拒绝预定', { type: 'warning' }).then(async () => {
    try {
      await store.handleRejectReservation(id)
      ElMessage.success('预定已拒绝')
    } catch (e) {
      ElMessage.error(e.message || '拒绝失败')
    }
  })
}

onMounted(async () => {
  try {
    await store.fetchVendorReservations()
  } catch (e) {
    ElMessage.error('获取预定列表失败')
  }
})
watch(
  () => notificationStore.unreadCount,
  () => {
    store.fetchVendorReservations()
  }
)
</script>

<style scoped>
.reservations-page { padding: 20px; }
</style>