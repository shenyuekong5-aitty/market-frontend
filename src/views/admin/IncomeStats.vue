<template>
  <div class="income-stats-page">
    <!-- 概览卡片 -->
    <el-row :gutter="20" class="overview-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">总收入（元）</div>
          <div class="stat-value">¥{{ adminStore.incomeStats.totalIncome?.toFixed(2) }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">已完成订单</div>
          <div class="stat-value">{{ adminStore.incomeStats.completedOrders }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">今日收入（元）</div>
          <div class="stat-value">¥{{ adminStore.incomeStats.todayIncome?.toFixed(2) }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">总订单数</div>
          <div class="stat-value">{{ adminStore.incomeStats.totalOrders }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>最近7天收入趋势</template>
          <div ref="trendChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>各摊位收入占比</template>
          <div ref="pieChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>
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
    xAxis: { type: 'category', data: adminStore.incomeStats.trend.map(i => i.date) },
    yAxis: { type: 'value' },
    series: [{ data: adminStore.incomeStats.trend.map(i => i.amount), type: 'line', smooth: true, areaStyle: { opacity: 0.3 } }]
  })
}

const renderPieChart = () => {
  if (!pieChartRef.value) return
  const chart = echarts.init(pieChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie', radius: '60%',
      data: adminStore.incomeStats.boothIncome.map(i => ({ name: i.name, value: i.value })),
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } }
    }]
  })
}

onMounted(() => loadData())
</script>

<style scoped>
.income-stats-page { padding: 20px; }
.overview-cards { margin-bottom: 20px; }
.stat-card { text-align: center; }
.stat-label { font-size: 14px; color: #909399; margin-bottom: 10px; }
.stat-value { font-size: 24px; font-weight: bold; color: #303133; }
.chart-row { margin-top: 20px; }
</style>