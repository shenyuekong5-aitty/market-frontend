<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <!-- 集市信息卡片 -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>我的集市</span>
              <el-tag v-if="adminStore.market" type="success">运营中</el-tag>
            </div>
          </template>
          <div v-if="adminStore.market" class="market-info">
            <p><strong>名称：</strong>{{ adminStore.market.name }}</p>
            <p><strong>位置：</strong>{{ adminStore.market.location }}</p>
            <p><strong>状态：</strong>{{ adminStore.market.status === 1 ? '启用' : '停用' }}</p>
          </div>
          <div v-else class="empty-state">
            <p>您还没有管理任何集市</p>
            <el-button type="primary" size="small" @click="$router.push('/admin/market/list')">创建集市</el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 待审批申请卡片 -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待审批申请</span>
              <el-badge :value="adminStore.applyList.length" :max="99" />
            </div>
          </template>
          <div v-if="adminStore.applyList.length > 0">
            <div v-for="apply in adminStore.applyList" :key="apply.id" class="apply-item">
              <p><strong>类型：</strong>{{ apply.type }}</p>
              <p><strong>小贩ID：</strong>{{ apply.vendorId }}</p>
              <p><strong>申请时间：</strong>{{ apply.applyTime }}</p>
              <div class="apply-actions">
                <el-button type="success" size="small">通过</el-button>
                <el-button type="danger" size="small">拒绝</el-button>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">暂无待审批申请</div>
        </el-card>
      </el-col>

      <!-- 快捷入口 -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>快捷操作</template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/admin/operation-log')">操作日志</el-button>
            <el-button type="primary" @click="$router.push('/admin/income-stats')">收入统计</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAdminStore } from '@/store/modules/admin'

const adminStore = useAdminStore()

onMounted(async () => {
  await adminStore.refreshAll()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.market-info p,
.apply-item p {
  margin: 8px 0;
  font-size: 14px;
}
.apply-item {
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}
.apply-item:last-child {
  border-bottom: none;
}
.apply-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}
.empty-state {
  text-align: center;
  color: #909399;
  padding: 20px;
}
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>