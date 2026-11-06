<template>
  <div class="income-stats-page">
    <PageHeading title="收入分析" description="查看集市收入趋势与摊位贡献，了解经营表现。" eyebrow="ANALYTICS / 收入" />
    <!-- 概览卡片 -->
    <div class="overview-cards">
        <UiCard class="stat-card">
          <div class="stat-label">总收入（元）</div>
          <div class="stat-value">¥{{ adminStore.incomeStats.totalIncome?.toFixed(2) }}</div>
        </UiCard>
        <UiCard class="stat-card">
          <div class="stat-label">已完成订单</div>
          <div class="stat-value">{{ adminStore.incomeStats.completedOrders }}</div>
        </UiCard>
        <UiCard class="stat-card">
          <div class="stat-label">今日收入（元）</div>
          <div class="stat-value">¥{{ adminStore.incomeStats.todayIncome?.toFixed(2) }}</div>
        </UiCard>
        <UiCard class="stat-card">
          <div class="stat-label">总订单数</div>
          <div class="stat-value">{{ adminStore.incomeStats.totalOrders }}</div>
        </UiCard>
    </div>

    <!-- 图表区域 -->
    <div class="chart-row">
        <UiCard>
          <template #header>最近7天收入趋势</template>
          <div ref="trendChartRef" style="height: 350px;"></div>
        </UiCard>
        <UiCard>
          <template #header>各摊位收入占比</template>
          <div ref="pieChartRef" style="height: 350px;"></div>
        </UiCard>
    </div>
  </div>
</template>

<script setup>
import PageHeading from '@/components/PageHeading.vue'
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useAdminStore } from '@/store/modules/admin'
import echarts from '@/utils/charts'

const adminStore = useAdminStore()
const trendChartRef = ref(null)
const pieChartRef = ref(null)

const chartInstances = []
let chartObserver

const loadData = async () => {
  await adminStore.fetchIncomeStats()
  await nextTick()
  renderTrendChart()
  renderPieChart()
}

const renderTrendChart = () => {
  if (!trendChartRef.value) return
  const chart = echarts.init(trendChartRef.value)
  chartInstances.push(chart)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: 25, left: 45, right: 20, bottom: 35 },
    xAxis: { type: 'category', data: adminStore.incomeStats.trend.map(i => i.date), axisLine: { lineStyle: { color: '#e5e9e2' } }, axisLabel: { color: '#879088' } },
    yAxis: { type: 'value', axisLine: { lineStyle: { color: '#e5e9e2' } }, axisLabel: { color: '#879088' }, splitLine: { lineStyle: { color: '#f0f2eb' } } },
    series: [{ data: adminStore.incomeStats.trend.map(i => i.amount), type: 'line', smooth: true, symbol: 'circle', symbolSize: 7, itemStyle: { color: '#2a6654' }, lineStyle: { color: '#2a6654', width: 3 }, areaStyle: { color: 'rgba(105,145,94,.12)' } }]
  })
}

const renderPieChart = () => {
  if (!pieChartRef.value) return
  const chart = echarts.init(pieChartRef.value)
  chartInstances.push(chart)
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, type: 'scroll', textStyle: { color: '#879088', fontSize: 11 } },
    series: [{
      type: 'pie', label: { show: false }, radius: ['42%', '66%'],
      color: ['#2a6654', '#a8be8d', '#d2b78a', '#7e9991', '#c3cbb5'],
      data: adminStore.incomeStats.boothIncome.map(i => ({ name: i.name, value: i.value })),
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } }
    }]
  })
}

onMounted(async () => {
  await loadData()
  chartObserver = new ResizeObserver(() => chartInstances.forEach(chart => chart.resize()))
  if (trendChartRef.value) chartObserver.observe(trendChartRef.value)
  if (pieChartRef.value) chartObserver.observe(pieChartRef.value)
})
onUnmounted(() => { chartObserver?.disconnect(); chartInstances.forEach(chart => chart.dispose()) })
</script>
