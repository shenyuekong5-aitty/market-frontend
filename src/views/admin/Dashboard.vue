<template>
  <div class="dashboard">
    <el-row :gutter="20" class="dashboard-row">
      <!-- 我的集市卡片 -->
      <el-col :span="8" class="dashboard-col">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>我的集市</span>
              <el-tag v-if="adminStore.market" type="success">运营中</el-tag>
            </div>
          </template>
          <div v-if="adminStore.market" class="market-info">
            <p><strong>名称：</strong>{{ adminStore.market.name }}</p>
            <p><strong>位置：</strong>{{ adminStore.market.location }}</p>
            <p>
              <strong>状态：</strong
              >{{ adminStore.market.status === 1 ? "启用" : "停用" }}
            </p>
          </div>
          <div v-else class="empty-state">
            <p>您还没有管理任何集市</p>
            <el-button
              type="primary"
              size="small"
              @click="$router.push('/admin/market/list')"
              >创建集市</el-button
            >
          </div>
        </el-card>
      </el-col>

      <!-- 待审批申请卡片 -->
      <el-col :span="8" class="dashboard-col">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>待审批申请</span>
              <el-badge :value="adminStore.applyList.length" :max="99" />
            </div>
          </template>
          <div
            v-if="adminStore.applyList.length > 0"
            class="apply-list-wrapper"
          >
            <div
              v-for="apply in adminStore.applyList"
              :key="apply.id"
              class="apply-item"
            >
              <p><strong>申请人：</strong>{{ apply.vendorName }}</p>
              <p><strong>类型：</strong>{{ apply.type }}</p>
              <p><strong>目标摊位：</strong>{{ apply.targetBoothTitle }}</p>
              <p><strong>申请时间：</strong>{{ apply.applyTime }}</p>
              <div class="apply-actions">
                <el-button
                  type="success"
                  size="small"
                  @click="handleApprove(apply.id)"
                  >通过</el-button
                >
                <el-button
                  type="danger"
                  size="small"
                  @click="handleReject(apply.id)"
                  >拒绝</el-button
                >
              </div>
            </div>
          </div>
          <div v-else class="empty-state">暂无待审批申请</div>
        </el-card>
      </el-col>

      <!-- 快捷操作卡片 -->
      <el-col :span="8" class="dashboard-col">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>快捷操作</template>
          <div class="quick-actions">
            <div
              class="action-btn"
              @click="$router.push('/admin/operation-log')"
            >
              操作日志
            </div>
            <div
              class="action-btn"
              @click="$router.push('/admin/income-stats')"
            >
              收入统计
            </div>
            <div class="action-btn" @click="$router.push('/admin/market/list')">
              集市管理
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { onMounted, watch } from "vue";
import { useAdminStore } from "@/store/modules/admin";
import { useNotificationStore } from "@/store/modules/notification"

const adminStore = useAdminStore();
const notificationStore = useNotificationStore()

const handleApprove = (id) => {
  adminStore.handleApprove(id);
};

const handleReject = (id) => {
  adminStore.handleReject(id);
};

onMounted(async () => {
  await adminStore.refreshAll();
});
watch(
  () => notificationStore.unreadCount,
  () => {
    adminStore.refreshAll()
  }
)
</script>

<style scoped>
.dashboard {
  padding: 20px;
}
.dashboard-row {
  display: flex;
  flex-wrap: wrap;
}
.dashboard-col {
  display: flex;
}
.dashboard-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.dashboard-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.quick-actions {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.action-btn {
  width: 100%;
  padding: 10px 15px;
  background-color: #409eff;
  color: white;
  border-radius: 4px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.3s;
  box-sizing: border-box;
  font-size: 14px;
  line-height: 1.5;
}
.action-btn:hover {
  background-color: #337ecc;
}

.apply-list-wrapper {
  max-height: 400px; /* 根据卡片高度调整，可设为 300~500px */
  overflow-y: auto;
  padding-right: 4px; /* 给滚动条留出空间 */
}

/* 美化滚动条（可选） */
.apply-list-wrapper::-webkit-scrollbar {
  width: 4px;
}
.apply-list-wrapper::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 2px;
}
</style>
