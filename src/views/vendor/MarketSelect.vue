<template>
  <div class="market-select-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <span class="header-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>
          </svg>
        </span>
        <span class="header-title">
          {{ isVendorRole ? '更换摊位' : '选择入驻集市' }}
        </span>
        <span v-if="isVendorRole" class="mode-badge">更换模式</span>
      </div>
      <p class="header-sub">
        {{ isVendorRole ? '选择一个空闲摊位更换到新位置' : '选择一个集市，查看空闲摊位并申请入驻' }}
      </p>
    </div>

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
          <div
            v-for="m in marketStore.marketList"
            :key="m.id"
            class="market-item"
            :class="{ active: activeMarketId === String(m.id) }"
            @click="handleMarketSelect(String(m.id))"
          >
            <div class="market-item-left">
              <span class="market-item-name">{{ m.name }}</span>
              <span class="market-item-location">{{ m.location }}</span>
            </div>
            <span class="market-item-arrow">→</span>
          </div>
        </div>
      </div>

      <!-- ===== 右侧：摊位列表 ===== -->
      <div class="booth-side">
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
                      v-if="isVendorRole"
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
                        申请入住
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
                  v-if="isVendorRole"
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
                    申请入住
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
          <p>从左侧选择一个集市</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '@/store/modules/market'
import { useVendorStore } from '@/store/modules/vendor'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const marketStore = useMarketStore()
const vendorStore = useVendorStore()
const userStore = useUserStore()

// 根据角色自动判断是否为 vendor
const isVendorRole = computed(() => userStore.userInfo.role === 'vendor')

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

onMounted(() => {
  loadMarkets()
})
</script>

<style scoped>
/* ============================================================
   1. 设计 Token
   ============================================================ */
.market-select-page {
  --text: var(--ink-strong);
  --text-secondary: var(--ink);
  --text-muted: var(--ink-muted);
  --accent: var(--brand-primary);
  --accent-light: var(--brand-primary-soft);
  --green: var(--success);
  --green-bg: #e8f5ef;
  --red: var(--danger);
  --red-bg: #fdebea;
  --shadow: var(--shadow-sm);
  --radius: var(--radius-md);

  padding: 20px;
  max-width: 1100px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: var(--text);
}

/* ============================================================
   2. 页面头部
   ============================================================ */
.page-header {
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.header-icon {
  font-size: 1.2rem;
}

.header-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text);
}

.mode-badge {
  font-size: 0.6rem;
  font-weight: 500;
  color: #d4a24e;
  background: #fdf6e8;
  padding: 1px 12px;
  border-radius: 100px;
  letter-spacing: 0.04em;
}

.header-sub {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 4px 0 0 0;
}

/* ============================================================
   3. 双栏布局
   ============================================================ */
.select-layout {
  display: flex;
  gap: 20px;
  align-items: stretch;
}

.market-side {
  flex: 0 0 280px;
  background: #ffffff;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 560px;
}

.booth-side {
  flex: 1;
  background: #ffffff;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

/* ============================================================
   4. 侧边栏头部
   ============================================================ */
.side-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid var(--line);
  background: var(--surface-card);
  flex-shrink: 0;
}

.side-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
}

.market-name-tag {
  font-weight: 400;
  color: var(--text-secondary);
  font-size: 0.75rem;
  margin-left: 4px;
}

.side-count {
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--line);
  padding: 0 10px;
  border-radius: 10px;
  line-height: 20px;
  min-width: 20px;
  text-align: center;
}

/* ============================================================
   5. 集市列表（左侧）
   ============================================================ */
.market-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.market-list::-webkit-scrollbar {
  width: 4px;
}

.market-list::-webkit-scrollbar-track {
  background: transparent;
}

.market-list::-webkit-scrollbar-thumb {
  background: var(--line);
  border-radius: 4px;
}

.market-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  border-left: 3px solid transparent;
}

.market-item:hover {
  background: var(--surface-page);
}

.market-item.active {
  background: var(--accent-light);
  border-left-color: var(--accent);
}

.market-item-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.market-item-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text);
}

.market-item-location {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.market-item-arrow {
  font-size: 0.7rem;
  color: var(--text-muted);
  opacity: 0;
  transition: opacity 0.2s;
}

.market-item.active .market-item-arrow,
.market-item:hover .market-item-arrow {
  opacity: 1;
}

.empty-side {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* ============================================================
   6. 空状态（右侧）
   ============================================================ */
.empty-booth {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 40px 20px;
  text-align: center;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.empty-booth p {
  margin: 0;
  font-size: 0.9rem;
}

/* ============================================================
   7. 表格样式
   ============================================================ */
.table-wrapper {
  flex: 1;
  overflow: auto;
  padding: 0 4px;
}

.booth-table {
  border: none !important;
  font-size: 14px;
}

:deep(.booth-table.el-table) {
  border: none !important;
}

:deep(.booth-table th.el-table__cell) {
  background: var(--surface-subtle) !important;
  color: var(--text-secondary);
  font-weight: 500;
  border-bottom: none;
  padding: 10px 0;
}

:deep(.booth-table td.el-table__cell) {
  border-bottom: 1px solid var(--line);
  padding: 12px 0;
}

:deep(.booth-table--border) {
  border: none;
}

:deep(.booth-table--border .el-table__cell) {
  border-right: none;
}

:deep(.booth-table--border .el-table__cell:last-child) {
  border-right: none;
}

:deep(.booth-table .cell) {
  padding: 0 8px;
}

:deep(.booth-table .el-table__body-wrapper) {
  color: var(--text);
}

.table-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

/* ============================================================
   8. 按钮
   ============================================================ */
.btn-primary {
  border-radius: 100px;
  background: var(--text);
  border: none;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  transition: background 0.25s, transform 0.2s;
  padding: 4px 14px;
  font-size: 0.7rem;
}

.btn-primary:hover {
  background: var(--accent);
}

.btn-primary:active {
  transform: scale(0.97);
}

.btn-warning {
  border-radius: 100px;
  background: #fdf6e8;
  border: 1px solid transparent;
  font-weight: 500;
  color: #d4a24e;
  cursor: pointer;
  transition: all 0.25s;
  padding: 4px 14px;
  font-size: 0.7rem;
}

.btn-warning:hover {
  background: #d4a24e;
  color: #fff;
}

.btn-xs {
  padding: 3px 12px;
  font-size: 0.65rem;
}

.text-muted {
  color: var(--text-muted);
  font-size: 0.7rem;
}

/* ============================================================
   9. 移动端：摊位卡片（默认隐藏）
   ============================================================ */
.booth-card-list {
  display: none;
  padding: 12px 14px;
  flex: 1;
  overflow-y: auto;
  flex-direction: column;
  gap: 10px;
}

.booth-card {
  background: var(--surface-card);
  border-radius: 12px;
  padding: 14px 16px;
  border: 1px solid var(--line);
}

.booth-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.booth-card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}

.booth-card-id {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.booth-card-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 12px;
}

.booth-card-position {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.booth-card-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.booth-card-actions {
  display: flex;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--line);
}

.booth-card-actions .btn-primary,
.booth-card-actions .btn-warning {
  flex: 1;
  padding: 8px 12px;
  font-size: 0.85rem;
  text-align: center;
}

.booth-card-actions .text-muted {
  width: 100%;
  text-align: center;
  padding: 6px 0;
}

/* ============================================================
   10. 响应式适配
   ============================================================ */

/* ---- 移动端（< 768px） ---- */
@media (max-width: 767px) {
  .market-select-page {
    padding: 8px;
  }

  .page-header {
    margin-bottom: 16px;
  }

  .header-title {
    font-size: 1rem;
  }

  .header-sub {
    font-size: 0.8rem;
  }

  .select-layout {
    flex-direction: column;
    gap: 12px;
  }

  .market-side {
    flex: none;
    max-height: 200px;
    border-radius: 14px;
  }

  .market-side .side-header {
    padding: 10px 14px;
  }

  .market-item {
    padding: 10px 14px;
  }

  .market-item-name {
    font-size: 0.8rem;
  }

  .booth-side {
    min-height: 320px;
    border-radius: 14px;
  }

  .booth-side .side-header {
    padding: 10px 14px;
  }

  .side-title {
    font-size: 0.8rem;
  }

  /* 隐藏表格，显示卡片 */
  .table-wrapper {
    display: none;
  }

  .booth-card-list {
    display: flex;
  }

  .empty-booth {
    padding: 30px 16px;
  }

  .empty-icon {
    font-size: 1.6rem;
  }

  .empty-booth p {
    font-size: 0.85rem;
  }
}

/* ---- 平板端（768px ~ 1024px） ---- */
@media (min-width: 768px) and (max-width: 1024px) {
  .market-select-page {
    padding: 24px;
    max-width: 100%;
  }

  .market-side {
    flex: 0 0 220px;
    max-height: 480px;
  }

  .market-item {
    padding: 10px 14px;
  }

  .market-item-name {
    font-size: 0.8rem;
  }

  .booth-table {
    font-size: 13px;
  }

  :deep(.booth-table th.el-table__cell) {
    padding: 8px 0;
  }

  :deep(.booth-table td.el-table__cell) {
    padding: 10px 0;
  }

  .btn-xs {
    padding: 3px 10px;
    font-size: 0.6rem;
  }
}

/* ---- 桌面端（≥ 1024px） ---- */
@media (min-width: 1025px) {
  .market-select-page {
    padding: 28px 20px;
  }

  .market-side {
    max-height: 600px;
  }
}
</style>
