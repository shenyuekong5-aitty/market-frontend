<template>
  <div class="market-list-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>集市管理</span>
          <el-button v-if="!adminStore.market" type="primary" size="small" @click="openCreateDialog">创建集市</el-button>
        </div>
      </template>

      <!-- 已有集市时显示信息及操作 -->
      <div v-if="adminStore.market" class="market-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="集市名称">{{ adminStore.market.name }}</el-descriptions-item>
          <el-descriptions-item label="位置">{{ adminStore.market.location }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="adminStore.market.status === 1 ? 'success' : 'danger'">
              {{ adminStore.market.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ adminStore.market.createTime }}</el-descriptions-item>
        </el-descriptions>
        <div class="action-buttons">
          <el-button type="primary" @click="openEditDialog">编辑</el-button>
          <el-button
            :type="adminStore.market.status === 1 ? 'warning' : 'success'"
            @click="handleToggleStatus"
          >
            {{ adminStore.market.status === 1 ? '停用' : '启用' }}
          </el-button>
          <el-button type="info" @click="$router.push(`/admin/market/${adminStore.market.id}`)">管理摊位</el-button>
        </div>
      </div>

      <!-- 无集市时的提示 -->
      <div v-else class="empty-state">
        <p>您还没有创建集市，请点击右上角按钮创建。</p>
      </div>
    </el-card>

    <!-- 创建/编辑集市弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑集市' : '创建集市'"
      width="500px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="集市名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入集市名称" />
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="form.location" placeholder="请输入集市位置" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
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
.empty-state {
  text-align: center;
  color: #909399;
  padding: 40px;
}
</style>