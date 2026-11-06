<template>
  <div v-if="!modeReady" class="market-select-page">正在确认摊位状态...</div>
  <div v-else class="market-select-page">
    <PageHeading title="找到小店的新位置" description="选择心仪的集市，查看空闲摊位并提交申请。" eyebrow="LOCATIONS / 入驻" />
    <div v-if="isChangeMode" class="mode-notice">正在更换摊位：请选择新的空闲位置。</div>
    <div class="select-layout">
      <!-- ===== 左侧：集市列表 ===== -->
      <div class="market-side">
        <div class="side-header">
          <span class="side-title">可选集市</span>
          <span class="side-count">{{ marketStore.marketList.length }}</span>
        </div>

        <div v-if="marketStore.marketList.length === 0" class="empty-side">
          暂无可用集市
        </div>

        <div v-else class="market-list">
          <button
            v-for="m in marketStore.marketList"
            :key="m.id"
            type="button"
            class="market-item"
            :class="{ active: activeMarketId === String(m.id) }"
            :aria-pressed="activeMarketId === String(m.id)"
            @click="handleMarketSelect(String(m.id))"
          >
            <div class="market-item-left">
              <span class="market-item-name">{{ m.name }}</span>
              <span class="market-item-location">{{ m.location }}</span>
            </div>
            <span class="market-item-arrow">→</span>
          </button>
        </div>
      </div>

      <!-- ===== 右侧：摊位列表 ===== -->
      <div class="booth-side" :class="{ 'has-selection': activeMarketId }">
        <!-- 条件1：有集市且有摊位数据 -->
        <template v-if="activeMarketId && boothList.length > 0">
          <div class="side-header">
            <span class="side-title">
              空闲摊位
              <span class="market-name-tag">{{ selectedMarket?.name }}</span>
            </span>
            <span class="side-count">{{ boothList.length }}</span>
          </div>

          <!-- 桌面/平板：表格 -->
          <div class="table-wrapper">
            <UiTable
              :data="boothList"
              border
              style="width: 100%"
              v-loading="boothLoading"
              class="booth-table"
            >
              <UiTableColumn prop="id" label="ID" width="60" />
              <UiTableColumn prop="title" label="名称" min-width="120" />
              <UiTableColumn prop="position" label="位置" width="120" />
              <UiTableColumn prop="description" label="描述" min-width="140" />
              <UiTableColumn label="操作" width="140" align="center">
                <template #default="{ row }">
                  <div class="table-actions">
                    <!-- vendor 角色：更换至此 -->
                    <button
                      v-if="isChangeMode"
                      class="btn-warning btn-xs"
                      @click="handleChange(row.id)"
                    >
                      更换至此
                    </button>
                    <!-- user 角色 -->
                    <template v-else>
                      <button
                        v-if="!row.hasPendingApply"
                        class="btn-primary btn-xs"
                        @click="handleApply(row.id)"
                      >
                        申请入驻
                      </button>
                      <span v-else class="text-muted">等待审批</span>
                    </template>
                  </div>
                </template>
              </UiTableColumn>
            </UiTable>
          </div>

          <!-- 移动端：摊位卡片列表 -->
          <div class="booth-card-list">
            <div
              v-for="booth in boothList"
              :key="booth.id"
              class="booth-card"
            >
              <div class="booth-card-header">
                <span class="booth-card-title">{{ booth.title }}</span>
                <span class="booth-card-id">#{{ booth.id }}</span>
              </div>
              <div class="booth-card-body">
                <span class="booth-card-position">{{ booth.position }}</span>
                <span class="booth-card-desc">{{ booth.description || '暂无描述' }}</span>
              </div>
              <div class="booth-card-actions">
                <button
                  v-if="isChangeMode"
                  class="btn-warning btn-xs"
                  @click="handleChange(booth.id)"
                >
                  更换至此
                </button>
                <template v-else>
                  <button
                    v-if="!booth.hasPendingApply"
                    class="btn-primary btn-xs"
                    @click="handleApply(booth.id)"
                  >
                    申请入驻
                  </button>
                  <span v-else class="text-muted">等待审批</span>
                </template>
              </div>
            </div>
          </div>
        </template>

        <!-- 条件2：有集市但无空闲摊位 -->
        <template v-else-if="activeMarketId && boothList.length === 0">
          <div class="side-header">
            <span class="side-title">
              空闲摊位
              <span class="market-name-tag">{{ selectedMarket?.name }}</span>
            </span>
            <span class="side-count">0</span>
          </div>
          <div class="empty-booth">
<span class="empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              <rect x="3" y="18" width="18" height="2" rx="1"/>
            </svg>
          </span>
          <p>该集市暂无空闲摊位</p>
        </div>

        </template>

        <!-- 条件3：未选择集市 -->
        <template v-else>
          <div class="empty-booth">
          <span class="empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </span>
          <p>请先选择一个集市</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import PageHeading from '@/components/PageHeading.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '@/store/modules/market'
import { useVendorStore } from '@/store/modules/vendor'
import { ElMessage } from 'element-plus'

const router = useRouter()
const marketStore = useMarketStore()
const vendorStore = useVendorStore()
const modeReady = ref(false)
// 已占用摊位才进入更换模式；首次入驻的小贩仍应提交入驻申请。
const isChangeMode = computed(() => Boolean(vendorStore.myBooth))

const activeMarketId = ref(null)
const boothList = ref([])
const boothLoading = ref(false)
const selectedMarket = ref(null)

// 加载集市列表
const loadMarkets = async () => {
  try {
    await marketStore.fetchMarkets()
  } catch (e) {
    ElMessage.error('获取集市列表失败')
  }
}

// 选中一个集市，加载空闲摊位
const handleMarketSelect = async (index) => {
  activeMarketId.value = index
  selectedMarket.value = marketStore.marketList.find(m => m.id === Number(index))
  boothLoading.value = true
  try {
    await marketStore.fetchFreeBooths(Number(index))
    boothList.value = marketStore.boothList
  } catch (e) {
    ElMessage.error('获取摊位列表失败')
  } finally {
    boothLoading.value = false
  }
}

// user 申请入住
const handleApply = async (boothId) => {
  try {
    await vendorStore.submitBoothApplication(boothId)
    ElMessage.success('申请已提交，请等待管理员审批')
    await marketStore.fetchFreeBooths(Number(activeMarketId.value))
    boothList.value = marketStore.boothList
  } catch (e) {
    ElMessage.error(e.message || '申请失败')
  }
}

// vendor 更换摊位
const handleChange = async (targetBoothId) => {
  try {
    await vendorStore.submitChangeBooth(targetBoothId)
    ElMessage.success('更换申请已提交，请等待管理员审批')
    router.push('/vendor/my-booth')
  } catch (e) {
    console.error('更换申请失败', e)
  }
}

onMounted(async () => {
  try {
    await vendorStore.fetchMyBooth()
    modeReady.value = true
    await loadMarkets()
  } catch (e) {
    ElMessage.error('无法确认当前摊位，请刷新页面重试')
  }
})
</script>
