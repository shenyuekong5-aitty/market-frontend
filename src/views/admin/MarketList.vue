<template>
  <div class="market-list-page">
    <UiCard>
      <template #header>
        <div class="card-header">
          <span>集市管理</span>
          <UiButton v-if="!adminStore.market" type="primary" size="small" @click="openCreateDialog">创建集市</UiButton>
        </div>
      </template>

      <!-- 已有集市时显示信息及操作 -->
      <div v-if="adminStore.market" class="market-info">
        <div class="market-details-grid">
          <div class="market-detail-item"><span>集市名称</span><strong>{{ adminStore.market.name }}</strong></div>
          <div class="market-detail-item"><span>位置</span><strong>{{ adminStore.market.location }}</strong></div>
          <div class="market-detail-item"><span>状态</span><UiTag :type="adminStore.market.status === 1 ? 'success' : 'danger'">{{ adminStore.market.status === 1 ? '启用' : '停用' }}</UiTag></div>
          <div class="market-detail-item"><span>创建时间</span><strong>{{ adminStore.market.createTime }}</strong></div>
        </div>
        <div class="action-buttons">
          <UiButton type="primary" @click="openEditDialog">编辑</UiButton>
          <UiButton
            :type="adminStore.market.status === 1 ? 'warning' : 'success'"
            @click="handleToggleStatus"
          >
            {{ adminStore.market.status === 1 ? '停用' : '启用' }}
          </UiButton>
          <UiButton type="info" @click="$router.push(`/admin/market/${adminStore.market.id}`)">管理摊位</UiButton>
        </div>
      </div>

      <!-- 无集市时的提示 -->
      <div v-else class="empty-state">
        <p>您还没有创建集市，请点击右上角按钮创建。</p>
      </div>
    </UiCard>

    <!-- 创建/编辑集市弹窗 -->
    <UiDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑集市' : '创建集市'"
      width="500px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <UiFormItem label="集市名称" prop="name">
          <UiInput v-model="form.name" placeholder="请输入集市名称" />
        </UiFormItem>
        <UiFormItem label="位置" prop="location">
          <UiInput v-model="form.location" placeholder="请输入集市位置" />
        </UiFormItem>
      </el-form>
      <template #footer>
        <UiButton @click="dialogVisible = false">取消</UiButton>
        <UiButton type="primary" :loading="submitLoading" @click="handleSubmit">确定</UiButton>
      </template>
    </UiDialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAdminStore } from '@/store/modules/admin'
import { ElMessage } from 'element-plus'

const adminStore = useAdminStore()
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)

const form = reactive({
  name: '',
  location: ''
})

const rules = {
  name: [{ required: true, message: '请输入集市名称', trigger: 'blur' }],
  location: [{ required: true, message: '请输入位置', trigger: 'blur' }]
}

// 打开创建弹窗
const openCreateDialog = () => {
  isEdit.value = false
  form.name = ''
  form.location = ''
  dialogVisible.value = true
}

// 打开编辑弹窗
const openEditDialog = () => {
  isEdit.value = true
  form.name = adminStore.market.name
  form.location = adminStore.market.location
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (isEdit.value) {
        await adminStore.handleUpdateMarket(adminStore.market.id, {
          name: form.name,
          location: form.location
        })
        ElMessage.success('集市信息已更新')
      } else {
        await adminStore.handleCreateMarket({
          name: form.name,
          location: form.location
        })
        ElMessage.success('集市创建成功')
      }
      dialogVisible.value = false
    } catch (error) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 切换状态
const handleToggleStatus = async () => {
  try {
    await adminStore.handleToggleStatus(adminStore.market.id)
    ElMessage.success('状态已更新')
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
}

onMounted(async () => {
  await adminStore.fetchMarket()
})
</script>

<style scoped>
.market-list-page {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.action-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
.market-details-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); overflow: hidden; border: 1px solid var(--line); border-radius: var(--radius-sm); }
.market-detail-item { min-height: 58px; display: flex; align-items: center; gap: 16px; padding: 12px 16px; border-bottom: 1px solid var(--line); }
.market-detail-item:nth-child(odd) { border-right: 1px solid var(--line); }
.market-detail-item:nth-last-child(-n + 2) { border-bottom: 0; }
.market-detail-item span { min-width: 56px; color: var(--ink-muted); font-size: 13px; }.market-detail-item strong { color: var(--ink-strong); font-size: 14px; }
.empty-state {
  text-align: center;
  color: #909399;
  padding: 40px;
}
@media (max-width: 640px) { .market-list-page { padding: 0; }.market-details-grid { grid-template-columns: 1fr; }.market-detail-item:nth-child(odd) { border-right: 0; }.market-detail-item:nth-last-child(-n + 2) { border-bottom: 1px solid var(--line); }.market-detail-item:last-child { border-bottom: 0; } }
</style>
