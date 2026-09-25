<template>
  <div class="income-stats-page">
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
import { ref, onMounted, nextTick } from 'vue'
import { useAdminStore } from '@/store/modules/admin'
import * as echarts from 'echarts'

const adminStore = useAdminStore()
const trendChartRef = ref(null)
const pieChartRef = ref(null)

const loadData = async () => {
  await adminStore.fetchIncomeStats()
  nextTick(() => {
    renderTrendChart()
    renderPieChart()
  })
}

const renderTrendChart = () => {
  if (!trendChartRef.value) return
  const chart = echarts.init(trendChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: adminStore.incomeStats.trend.map(i => i.date), axisLine: { lineStyle: { color: '#dce8ea' } }, axisLabel: { color: '#78909a' } },
    yAxis: { type: 'value', axisLine: { lineStyle: { color: '#dce8ea' } }, axisLabel: { color: '#78909a' }, splitLine: { lineStyle: { color: '#edf3f4' } } },
    series: [{ data: adminStore.incomeStats.trend.map(i => i.amount), type: 'line', smooth: true, symbol: 'circle', symbolSize: 7, itemStyle: { color: '#176b68' }, lineStyle: { color: '#176b68', width: 3 }, areaStyle: { color: 'rgba(23,107,104,.16)' } }]
  })
}

const renderPieChart = () => {
  if (!pieChartRef.value) return
  const chart = echarts.init(pieChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie', radius: ['42%', '66%'],
      color: ['#176b68', '#ef8b68', '#2f8f70', '#d79a3b', '#78909a'],
      data: adminStore.incomeStats.boothIncome.map(i => ({ name: i.name, value: i.value })),
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } }
    }]
  })
}

onMounted(() => loadData())
</script>

<style scoped>
.income-stats-page { padding: 4px; }
.overview-cards { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; margin-bottom: 20px; }
.stat-card { text-align: center; }
.stat-label { font-size: 14px; color: var(--ink-muted); margin-bottom: 10px; }
.stat-value { font-size: 24px; font-weight: bold; color: var(--ink-strong); }
.chart-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin-top: 20px; }
@media (max-width: 900px) { .overview-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }.chart-row { grid-template-columns: 1fr; } }
@media (max-width: 560px) { .income-stats-page { padding: 0; }.overview-cards { grid-template-columns: 1fr; gap: 14px; }.chart-row { gap: 14px; }.stat-value { font-size: 21px; } }
</style>
