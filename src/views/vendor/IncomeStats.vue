<template>
  <div class="income-stats-page">
    <!-- ===== 页面头部 ===== -->
    <div class="page-header">
      <div class="header-left">
        <span class="header-icon">
          <img src="/src/assets/icons/chart-bar.svg" class="icon-img" />
        </span>
        <span class="header-title">收入统计</span>
      </div>
      <button class="btn-refresh" @click="refreshData">
        刷新
      </button>
    </div>

    <!-- ===== 概览卡片 ===== -->
    <div class="overview-cards">
      <div class="stat-card">
        <div class="stat-icon">
          <img src="/src/assets/icons/money.svg" class="icon-img" />
        </div>
        <div class="stat-label">总收入</div>
        <div class="stat-value">¥{{ vendorStore.incomeStats.totalIncome?.toFixed(2) || '0.00' }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
          </div>
        <div class="stat-label">已完成订单</div>
        <div class="stat-value">{{ vendorStore.incomeStats.completedOrders || 0 }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <img src="/src/assets/icons/chart-up.svg" class="icon-img" />
        </div>
        <div class="stat-label">今日收入</div>
        <div class="stat-value">¥{{ vendorStore.incomeStats.todayIncome?.toFixed(2) || '0.00' }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
        <div class="stat-label">总订单数</div>
        <div class="stat-value">{{ vendorStore.incomeStats.totalOrders || 0 }}</div>
      </div>
    </div>

    <!-- ===== 图表 + 订单列表 ===== -->
    <div class="chart-row">
      <!-- 收入趋势图 -->
      <div class="chart-card">
        <div class="card-header">
          <span class="card-title">
          <img src="/src/assets/icons/chart-up.svg" class="icon-img-sm" />
          最近7天收入趋势</span>
        </div>
        <div ref="trendChartRef" class="chart-container"></div>
      </div>

      <!-- 最近已完成订单 -->
      <div class="order-card">
        <div class="card-header">
          <span class="card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <rect x="6" y="14" width="4" height="4" rx="1"/>
            </svg>
            最近已完成订单</span>
        </div>
        <div class="table-wrapper">
          <UiTable
            :data="vendorStore.incomeStats.orderDetails"
            border
            max-height="300"
            class="order-table"
            v-if="vendorStore.incomeStats.orderDetails?.length > 0"
          >
            <UiTableColumn prop="orderNo" label="订单编号" min-width="140" />
            <UiTableColumn prop="productNames" label="商品" min-width="100" show-overflow-tooltip />
            <UiTableColumn prop="totalAmount" label="金额" width="90" align="center">
              <template #default="{ row }">
                ¥{{ Number(row.totalAmount).toFixed(2) }}
              </template>
            </UiTableColumn>
            <UiTableColumn prop="createTime" label="时间" width="160" />
          </UiTable>
          <div v-else class="empty-table">
            <span>暂无已完成订单</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { useVendorStore } from '@/store/modules/vendor'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

const vendorStore = useVendorStore()
const trendChartRef = ref(null)
let chartInstance = null

const loadData = async () => {
  try {
    await vendorStore.fetchIncomeStats()
    nextTick(() => renderTrendChart())
  } catch (e) {
    ElMessage.error('加载统计数据失败')
  }
}

const renderTrendChart = () => {
  if (!trendChartRef.value) return
  const trendData = vendorStore.incomeStats.trend || []

  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }

  chartInstance = echarts.init(trendChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const p = params[0]
        return `<strong>${p.name}</strong><br/>收入：¥${p.value.toFixed(2)}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: trendData.map(i => i.date || ''),
      axisLine: { lineStyle: { color: '#dce8ea' } },
      axisLabel: { color: '#78909a', fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: {
        color: '#78909a',
        fontSize: 11,
        formatter: '¥{value}'
      },
      splitLine: { lineStyle: { color: '#edf3f4', type: 'dashed' } }
    },
    series: [{
      data: trendData.map(i => Number(i.amount) || 0),
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        color: '#176b68',
        width: 2
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(23, 107, 104, 0.25)' },
            { offset: 1, color: 'rgba(23, 107, 104, 0.02)' }
          ]
        }
      },
      itemStyle: {
        color: '#176b68'
      }
    }]
  }

  chartInstance.setOption(option)

  // 响应式 resize
  const handleResize = () => {
    chartInstance?.resize()
  }
  window.addEventListener('resize', handleResize)
  // 存储清理函数
  chartInstance._resizeHandler = handleResize
}

// 手动刷新
const refreshData = () => {
  loadData()
}

// 窗口尺寸变化时重新渲染图表
const handleWindowResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleWindowResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize)
  if (chartInstance) {
    const handler = chartInstance._resizeHandler
    if (handler) {
      window.removeEventListener('resize', handler)
    }
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
/* ============================================================
   1. 设计 Token
   ============================================================ */
.income-stats-page {
  --text: var(--ink-strong);
  --text-secondary: var(--ink);
  --text-muted: var(--ink-muted);
  --accent: var(--brand-primary);
  --accent-light: var(--brand-primary-soft);
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  font-size: 1.2rem;
}
.icon-img { width: 24px; height: 24px; display: block; }
.icon-img-sm { width: 16px; height: 16px; display: inline-block; vertical-align: middle; margin-right: 4px; }

.header-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text);
}

.btn-refresh {
  padding: 4px 16px;
  border-radius: 100px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s;
}

.btn-refresh:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

/* ============================================================
   3. 概览卡片
   ============================================================ */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #ffffff;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
  padding: 18px 16px 16px;
  text-align: center;
  transition: border-color 0.2s, transform 0.15s;
}

.stat-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 1.3rem;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text);
}

/* ============================================================
   4. 图表 + 订单双栏
   ============================================================ */
.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-card,
.order-card {
  background: #ffffff;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid var(--line);
  background: var(--surface-card);
  flex-shrink: 0;
}

.card-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
}

.chart-container {
  width: 100%;
  height: 300px;
  padding: 8px 4px 4px;
}

/* ============================================================
   5. 订单表格
   ============================================================ */
.table-wrapper {
  flex: 1;
  overflow: hidden;
  padding: 0 4px 4px;
}

.order-table {
  border: none !important;
  font-size: 13px;
  width: 100%;
}

:deep(.order-table.el-table) {
  border: none !important;
}

:deep(.order-table th.el-table__cell) {
  background: var(--surface-subtle) !important;
  color: var(--text-secondary);
  font-weight: 500;
  border-bottom: none;
  padding: 8px 0;
}

:deep(.order-table td.el-table__cell) {
  border-bottom: 1px solid var(--line);
  padding: 10px 0;
}

:deep(.order-table--border) {
  border: none;
}

:deep(.order-table--border .el-table__cell) {
  border-right: none;
}

:deep(.order-table--border .el-table__cell:last-child) {
  border-right: none;
}

:deep(.order-table .cell) {
  padding: 0 8px;
}

:deep(.order-table .el-table__body-wrapper) {
  color: var(--text);
}

:deep(.order-table .el-table__empty-text) {
  color: var(--text-muted);
}

.empty-table {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* ============================================================
   6. 响应式适配
   ============================================================ */

/* ---- 移动端（< 768px） ---- */
@media (max-width: 767px) {
  .income-stats-page {
    padding: 8px;
  }

  .page-header {
    margin-bottom: 16px;
  }

  .header-title {
    font-size: 1rem;
  }

  .btn-refresh {
    padding: 3px 12px;
    font-size: 0.7rem;
  }

  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }

  .stat-card {
    padding: 14px 10px 12px;
  }

  .stat-value {
    font-size: 1.1rem;
  }

  .stat-icon {
    font-size: 1.1rem;
  }

  .stat-label {
    font-size: 0.6rem;
  }

  .chart-row {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .chart-container {
    height: 220px;
  }

  .card-header {
    padding: 10px 14px;
  }

  .card-title {
    font-size: 0.8rem;
  }

  :deep(.order-table) {
    font-size: 12px;
  }

  :deep(.order-table th.el-table__cell) {
    padding: 6px 0;
    font-size: 11px;
  }

  :deep(.order-table td.el-table__cell) {
    padding: 8px 0;
  }

  .empty-table {
    height: 80px;
    font-size: 0.8rem;
  }
}

/* ---- 平板端（768px ~ 1024px） ---- */
@media (min-width: 768px) and (max-width: 1024px) {
  .income-stats-page {
    padding: 24px;
    max-width: 100%;
  }

  .overview-cards {
    gap: 12px;
  }

  .stat-value {
    font-size: 1.15rem;
  }

  .chart-row {
    gap: 16px;
  }

  .chart-container {
    height: 260px;
  }

  :deep(.order-table) {
    font-size: 12px;
  }
}

/* ---- 桌面端（≥ 1024px） ---- */
@media (min-width: 1025px) {
  .income-stats-page {
    padding: 28px 20px;
  }

  .chart-container {
    height: 320px;
  }
}

/* ---- 极小屏（< 400px）额外优化 ---- */
@media (max-width: 400px) {
  .overview-cards {
    gap: 8px;
  }

  .stat-card {
    padding: 10px 6px 10px;
  }

  .stat-value {
    font-size: 0.95rem;
  }

  .stat-icon {
    font-size: 0.95rem;
  }

  .stat-label {
    font-size: 0.55rem;
  }

  .chart-container {
    height: 180px;
  }
}
</style>
