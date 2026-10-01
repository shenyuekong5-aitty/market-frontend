<template>
  <div class="operation-log-page">
    <UiCard>
      <template #header>
        <div class="header">
          <span>操作日志</span>
        </div>
      </template>

      <!-- 筛选条件 -->
      <el-form :inline="true" :model="queryForm" class="filter-form">
        <UiFormItem label="开始时间">
          <UiDateInput
            v-model="queryForm.start"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :clearable="true"
          />
        </UiFormItem>
        <UiFormItem label="结束时间">
          <UiDateInput
            v-model="queryForm.end"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :clearable="true"
          />
        </UiFormItem>
        <UiFormItem>
        <UiButton type="primary" @click="handleQuery">查询</UiButton>
        <UiButton @click="resetQuery">重置</UiButton>
        </UiFormItem>
      </el-form>

      <!-- 日志表格 -->
      <UiTable :data="adminStore.logList" border style="width: 100%" v-loading="adminStore.logLoading">
        <UiTableColumn prop="id" label="ID" width="60" />
        <UiTableColumn prop="type" label="操作类型" width="120" />
        <UiTableColumn prop="description" label="操作描述" min-width="200" show-overflow-tooltip />
        <UiTableColumn prop="createTime" label="操作时间" width="180" />
      </UiTable>
    </UiCard>
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
@media (min-width: 768px) and (max-width: 1024px) { .operation-log-page { padding: 12px; } }
@media (max-width: 767px) { .operation-log-page { padding: 0; } .filter-form { margin-bottom: 14px; } }
</style>
