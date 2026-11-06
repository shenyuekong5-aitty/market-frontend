<template>
  <div class="income-stats-page">
    <PageHeading title="经营数据" description="用清晰的数据了解收入变化，回顾每一天的经营。" eyebrow="ANALYTICS / 数据" />
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
            <UiTableColumn label="完成时间" width="170">
              <template #default="{ row }">
                {{ row.completeTime || row.createTime || '-' }}
              </template>
            </UiTableColumn>
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
import PageHeading from '@/components/PageHeading.vue'
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { useVendorStore } from '@/store/modules/vendor'
import { ElMessage } from 'element-plus'
import echarts from '@/utils/charts'

const vendorStore = useVendorStore()
const trendChartRef = ref(null)
let chartInstance = null
let chartObserver

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
      axisLine: { lineStyle: { color: '#e5e9e2' } },
      axisLabel: { color: '#879088', fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: {
        color: '#879088',
        fontSize: 11,
        formatter: '¥{value}'
      },
      splitLine: { lineStyle: { color: '#f0f2eb', type: 'dashed' } }
    },
    series: [{
      data: trendData.map(i => Number(i.amount) || 0),
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        color: '#2a6654',
        width: 2
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(105, 145, 94, 0.18)' },
            { offset: 1, color: 'rgba(105, 145, 94, 0.01)' }
          ]
        }
      },
      itemStyle: {
        color: '#2a6654'
      }
    }]
  }

  chartInstance.setOption(option)

  chartObserver?.disconnect()
  chartObserver = new ResizeObserver(() => chartInstance?.resize())
  chartObserver.observe(trendChartRef.value)
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
  chartObserver?.disconnect()
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>
