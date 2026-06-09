<template>
  <div class="income-stats-page">
    <!-- 概览卡片 -->
    <el-row :gutter="20" class="overview-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">总收入（元）</div>
          <div class="stat-value">¥{{ vendorStore.incomeStats.totalIncome?.toFixed(2) }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">已完成订单</div>
          <div class="stat-value">{{ vendorStore.incomeStats.completedOrders }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">今日收入（元）</div>
          <div class="stat-value">¥{{ vendorStore.incomeStats.todayIncome?.toFixed(2) }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">总订单数</div>
          <div class="stat-value">{{ vendorStore.incomeStats.totalOrders }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>最近7天收入趋势</template>
          <div ref="trendChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>最近已完成订单</template>
          <el-table :data="vendorStore.incomeStats.orderDetails" border max-height="350px">
            <el-table-column prop="orderNo" label="订单编号" width="180" />
            <el-table-column prop="productNames" label="商品" show-overflow-tooltip />
            <el-table-column prop="totalAmount" label="金额" />
            <el-table-column prop="createTime" label="时间" width="160" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useVendorStore } from '@/store/modules/vendor'
import * as echarts from 'echarts'

const vendorStore = useVendorStore()
const trendChartRef = ref(null)

const loadData = async () => {
  await vendorStore.fetchIncomeStats()
  nextTick(() => renderTrendChart())
}

const renderTrendChart = () => {
  if (!trendChartRef.value) return
  const chart = echarts.init(trendChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: vendorStore.incomeStats.trend.map(i => i.date) },
    yAxis: { type: 'value' },
    series: [{ data: vendorStore.incomeStats.trend.map(i => i.amount), type: 'line', smooth: true, areaStyle: { opacity: 0.3 } }]
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