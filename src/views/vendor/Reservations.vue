<template>
  <div class="reservations-page">
    <PageHeading title="预订管理" description="查看顾客的预约安排，及时确认或处理预订。" eyebrow="RESERVATIONS / 预订" />
    <CollectionToolbar v-model="searchQuery" :count="filteredRows.length" placeholder="搜索商品、顾客或预订状态…" />
    <UiEmpty v-if="searchQuery && !filteredRows.length" description="没有找到匹配的内容，试试其他关键词。" class="search-empty" />
    <UiCard>
      <template #header>
        <div class="page-header">
          <div class="header-left">
            <span class="header-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <rect x="6" y="14" width="4" height="4" rx="1"/>
            </svg>
          </span>
            <span class="header-title">预约记录</span>
            <span v-if="store.vendorReservationList.length > 0" class="count-badge">
              {{ store.vendorReservationList.length }}
            </span>
            <span v-if="pendingCount > 0" class="pending-badge">
              待确认 {{ pendingCount }}
            </span>
          </div>
          <button class="btn-refresh" @click="refreshReservations">
            刷新
          </button>
        </div>
      </template>

      <!-- 加载状态 -->
      <div v-if="store.vendorReservationLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <!-- 空状态 -->
      <div
        v-else-if="store.vendorReservationList.length === 0"
        class="empty-state"
      >
        <div class="empty-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            <rect x="3" y="18" width="18" height="2" rx="1"/>
          </svg>
        </div>
        <p>暂无预定</p>
        <p class="empty-hint">来自用户的预定请求会在这里显示</p>
      </div>

      <!-- 非空状态 -->
      <div v-else>
        <!-- ===== 桌面/平板：表格 ===== -->
        <div class="table-wrapper">
          <UiTable
            :data="filteredRows"
            border
            style="width: 100%"
            class="reservation-table"
          >
            <UiTableColumn label="图片" width="80">
              <template #default="{ row }">
                <UiImage
                  v-if="row.productImageUrl"
                  :src="getFullUrl(row.productImageUrl)"
                  fit="cover"
                  style="width: 44px; height: 44px; border-radius: 8px;"
                />
                <span v-else class="image-placeholder">无</span>
              </template>
            </UiTableColumn>
            <UiTableColumn prop="userName" label="预定用户" width="120" />
            <UiTableColumn prop="productName" label="商品" min-width="120" />
            <UiTableColumn prop="startTime" label="开始时间" width="180" />
            <UiTableColumn prop="endTime" label="结束时间" width="180" />
            <UiTableColumn label="状态" width="100" align="center">
              <template #default="{ row }">
                <span class="status-badge" :class="statusClass(row.status)">
                  {{ row.status }}
                </span>
              </template>
            </UiTableColumn>
            <UiTableColumn label="操作" width="200" align="center">
              <template #default="{ row }">
                <div class="table-actions" v-if="row.status === '待确认'">
                  <button class="btn-success btn-xs" @click="handleConfirm(row.id)">确认</button>
                  <button class="btn-danger btn-xs" @click="handleReject(row.id)">拒绝</button>
                </div>
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
            <div class="reservation-card-row">
              <div class="reservation-card-image">
                <UiImage
                  v-if="reservation.productImageUrl"
                  :src="getFullUrl(reservation.productImageUrl)"
                  fit="cover"
                  style="width: 56px; height: 56px; border-radius: 10px;"
                />
                <span v-else class="image-placeholder">无图</span>
              </div>
              <div class="reservation-card-info">
                <div class="reservation-card-name">{{ reservation.productName }}</div>
                <div class="reservation-card-user">{{ reservation.userName }}</div>
                <div class="reservation-card-time">
                  <span>{{ reservation.startTime }}</span>
                  <span class="time-arrow">→</span>
                  <span>{{ reservation.endTime }}</span>
                </div>
              </div>
              <span class="status-badge" :class="statusClass(reservation.status)">
                {{ reservation.status }}
              </span>
            </div>
            <div class="reservation-card-actions" v-if="reservation.status === '待确认'">
              <button class="btn-success btn-xs" @click="handleConfirm(reservation.id)">确认</button>
              <button class="btn-danger btn-xs" @click="handleReject(reservation.id)">拒绝</button>
            </div>
            <div v-else class="reservation-card-actions">
              <span class="text-muted">暂无可操作项</span>
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
import { onMounted, watch, computed } from 'vue'
import { useVendorStore } from '@/store/modules/vendor'
import { useNotificationStore } from '@/store/modules/notification'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFullUrl } from '@/utils/urlHelper'

const store = useVendorStore()
const notificationStore = useNotificationStore()

// 待确认数量
const pendingCount = computed(() => {
  return store.vendorReservationList.filter(r => r.status === '待确认').length
})

// 状态样式映射
const statusClass = (status) => {
  const map = {
    '待确认': 'status-pending',
    '已确认': 'status-confirmed',
    '已拒绝': 'status-rejected',
    '已取消': 'status-cancelled'
  }
  return map[status] || 'status-pending'
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

// 手动刷新
const refreshReservations = () => {
  store.fetchVendorReservations()
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

const { searchQuery, filteredRows } = useCollectionSearch(() => store.vendorReservationList, ['productName', 'userName', 'status'])
</script>
