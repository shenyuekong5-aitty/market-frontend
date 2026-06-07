<template>
  <div class="operation-log-page">
    <el-card>
      <template #header>
        <div class="header">
          <span>操作日志</span>
        </div>
      </template>

      <!-- 筛选条件 -->
      <el-form :inline="true" :model="queryForm" class="filter-form">
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="queryForm.start"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :clearable="true"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="queryForm.end"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :clearable="true"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 日志表格 -->
      <el-table :data="adminStore.logList" border style="width: 100%" v-loading="adminStore.logLoading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="type" label="操作类型" width="120" />
        <el-table-column prop="description" label="操作描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="操作时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useAdminStore } from '@/store/modules/admin'
import { ElMessage } from 'element-plus'

const adminStore = useAdminStore()

const queryForm = reactive({
  start: null,
  end: null
})

const handleQuery = () => {
  adminStore.fetchOperationLogs(queryForm.start, queryForm.end)
}

const resetQuery = () => {
  queryForm.start = null
  queryForm.end = null
  adminStore.fetchOperationLogs()
}

onMounted(() => {
  adminStore.fetchOperationLogs()
})
</script>

<style scoped>
.operation-log-page {
  padding: 20px;
}
.filter-form {
  margin-bottom: 20px;
}
</style>