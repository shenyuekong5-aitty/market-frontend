<template>
  <div class="reservations-page">
    <PageHeading title="我的预订" description="提前留住心仪的好物，查看预约时间与处理进度。" eyebrow="RESERVATIONS / 预订" />
    <CollectionToolbar v-model="searchQuery" :count="filteredRows.length" placeholder="搜索商品名称或预订状态…" />
    <UiEmpty v-if="searchQuery && !filteredRows.length" description="没有找到匹配的内容，试试其他关键词。" class="search-empty" />
    <UiCard>
      <template #header>
        <div class="reservations-header">
          <span>预订记录</span>
          <span class="reservation-count" v-if="store.reservationList.length > 0">
            共 {{ store.reservationList.length }} 条预定
          </span>
        </div>
      </template>

      <!-- 空状态 -->
      <div
        v-if="store.reservationList.length === 0 && !store.reservationLoading"
        class="empty-state"
      >
        <UiEmpty description="暂无预定">
          <UiButton type="primary" @click="$router.push('/markets')">
            去逛逛集市
          </UiButton>
        </UiEmpty>
      </div>

      <!-- 非空状态 -->
      <div v-else>
        <!-- ===== 桌面/平板：表格 ===== -->
        <div class="table-wrapper">
          <UiTable
            :data="filteredRows"
            border
            style="width: 100%"
            v-loading="store.reservationLoading"
            class="reservation-table"
          >
            <UiTableColumn label="图片" width="80">
              <template #default="{ row }">
                <UiImage
                  v-if="row.productImageUrl"
                  :src="getFullUrl(row.productImageUrl)"
                  fit="cover"
                  style="width: 50px; height: 50px; border-radius: 8px;"
                />
                <span v-else class="muted-placeholder">暂无</span>
              </template>
            </UiTableColumn>
            <UiTableColumn prop="productName" label="商品" min-width="140" />
            <UiTableColumn prop="startTime" label="开始时间" width="180" />
            <UiTableColumn prop="endTime" label="结束时间" width="180" />
            <UiTableColumn label="状态" width="100" align="center">
              <template #default="{ row }">
                <span
                  class="status-badge"
                  :class="statusClass(row.status)"
                >
                  {{ row.status }}
                </span>
              </template>
            </UiTableColumn>
            <UiTableColumn label="操作" width="120" align="center">
              <template #default="{ row }">
                <button
                  v-if="row.status === '待确认'"
                  class="btn-danger btn-sm"
                  @click="handleCancel(row.id)"
                >
                  取消
                </button>
                <span v-else class="text-muted">—</span>
              </template>
            </UiTableColumn>
          </UiTable>
        </div>

        <!-- ===== 移动端：卡片列表 ===== -->
        <div class="reservation-card-list">
          <div
            v-for="reservation in filteredRows"
            :key="reservation.id"
            class="reservation-card"
          >
            <!-- 第一行：图片 + 名称 + 状态 -->
            <div class="reservation-card-row">
              <div class="reservation-card-image">
                <UiImage
                  v-if="reservation.productImageUrl"
                  :src="getFullUrl(reservation.productImageUrl)"
                  fit="cover"
                  style="width: 60px; height: 60px; border-radius: 10px;"
                />
                <span v-else class="image-placeholder">无图</span>
              </div>
              <div class="reservation-card-info">
                <div class="reservation-card-name">{{ reservation.productName }}</div>
                <div class="reservation-card-time">
                  <span>{{ reservation.startTime }}</span>
                  <span class="time-divider">→</span>
                  <span>{{ reservation.endTime }}</span>
                </div>
              </div>
              <span
                class="status-badge"
                :class="statusClass(reservation.status)"
              >
                {{ reservation.status }}
              </span>
            </div>

            <!-- 第二行：操作按钮 -->
            <div class="reservation-card-actions">
              <button
                v-if="reservation.status === '待确认'"
                class="btn-danger btn-sm"
                @click="handleCancel(reservation.id)"
              >
                取消预定
              </button>
              <span v-else class="text-muted">暂无可操作项</span>
            </div>
          </div>
        </div>
      </div>
    </UiCard>
  </div>
</template>

<script setup>
import CollectionToolbar from '@/components/CollectionToolbar.vue'
import { useCollectionSearch } from '@/composables/useCollectionSearch'
import PageHeading from '@/components/PageHeading.vue'
import { onMounted, watch } from 'vue'
import { useUserMarketStore } from '@/store/modules/userMarket'
import { useNotificationStore } from '@/store/modules/notification'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFullUrl } from '@/utils/urlHelper'

const store = useUserMarketStore()
const notificationStore = useNotificationStore()

// 状态样式映射
const statusClass = (status) => {
  const map = {
    '待确认': 'status-pending',
    '已确认': 'status-confirmed',
    '已拒绝': 'status-rejected',
    '已取消': 'status-cancelled',
  }
  return map[status] || 'status-pending'
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

const { searchQuery, filteredRows } = useCollectionSearch(() => store.reservationList, ['productName', 'status'])
</script>
