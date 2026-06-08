<template>
  <div class="market-detail-page">
    <!-- 集市信息头部 -->
    <el-card v-if="adminStore.market" class="market-info-card">
      <div class="market-header">
        <h3>{{ adminStore.market.name }}</h3>
        <el-tag :type="adminStore.market.status === 1 ? 'success' : 'danger'">
          {{ adminStore.market.status === 1 ? '启用中' : '已停用' }}
        </el-tag>
      </div>
      <p>位置：{{ adminStore.market.location }}</p>
      <el-button type="primary" @click="openCreateDialog" style="margin-top: 10px">新增摊位</el-button>
    </el-card>

    <!-- 摊位列表 -->
    <el-card class="booth-list-card">
      <template #header>
        <span>摊位列表（共 {{ adminStore.boothList.length }} 个）</span>
      </template>
      <el-table :data="adminStore.boothList" border style="width: 100%" v-loading="boothLoading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="title" label="摊位名称" />
        <el-table-column prop="position" label="位置" />
        <el-table-column prop="openTime" label="营业时间" />
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === '空闲' ? 'success' : row.status === '已占用' ? 'warning' : 'info'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240">
          <template #default="{ row }">
            <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button size="small" :type="row.status === '停用' ? 'success' : 'warning'" @click="handleToggleStatus(row)">
              {{ row.status === '停用' ? '启用' : '停用' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)" :disabled="row.status !== '空闲'">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑摊位弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑摊位' : '新增摊位'" width="500px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <!-- 新增时只显示位置，编辑时显示所有字段 -->
        <template v-if="!isEdit">
          <el-form-item label="摊位位置" prop="position">
            <el-input v-model="form.position" placeholder="如：A区03号" />
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="摊位名称" prop="title">
            <el-input v-model="form.title" />
          </el-form-item>
          <el-form-item label="位置" prop="position">
            <el-input v-model="form.position" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="form.description" type="textarea" />
          </el-form-item>
          <el-form-item label="营业时间">
            <el-input v-model="form.openTime" placeholder="如 08:00-20:00" />
          </el-form-item>
        </template>
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
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/store/modules/admin'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

const marketId = ref(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const boothLoading = ref(false)
const formRef = ref(null)
const editingBoothId = ref(null)

// 表单数据（新增时只需 position，编辑时需要全部字段）
const form = reactive({
  title: '',
  position: '',
  description: '',
  openTime: ''
})

// 校验规则（新增时只验证位置，编辑时名称也必填）
const rules = {
  position: [{ required: true, message: '请输入摊位位置', trigger: 'blur' }],
  title: [{ required: true, message: '请输入摊位名称', trigger: 'blur' }]
}

// 加载数据
const loadData = async () => {
  if (!marketId.value) return
  boothLoading.value = true
  try {
    await adminStore.fetchBooths(marketId.value)
    if (!adminStore.market) {
      await adminStore.fetchMarket()
    }
  } finally {
    boothLoading.value = false
  }
}

// 打开新增弹窗
const openCreateDialog = () => {
  isEdit.value = false
  editingBoothId.value = null
  form.title = ''
  form.position = ''
  form.description = ''
  form.openTime = ''
  dialogVisible.value = true
}

// 打开编辑弹窗
const openEditDialog = (row) => {
  isEdit.value = true
  editingBoothId.value = row.id
  form.title = row.title
  form.position = row.position
  form.description = row.description || ''
  form.openTime = row.openTime || ''
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  // 动态设置校验字段
  const needValidate = isEdit.value ? ['position', 'title'] : ['position']
  try {
    await formRef.value.validate(needValidate)
  } catch {
    ElMessage.warning('请检查输入项')
    return
  }

  submitLoading.value = true
  try {
    if (isEdit.value) {
      await adminStore.handleUpdateBooth(editingBoothId.value, {
        title: form.title,
        position: form.position,
        description: form.description,
        openTime: form.openTime,
        marketId: marketId.value
      })
      ElMessage.success('摊位信息已更新')
    } else {
      await adminStore.handleCreateBooth({
        position: form.position,
        marketId: marketId.value
      })
      ElMessage.success('摊位创建成功')
    }
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 切换状态
const handleToggleStatus = async (row) => {
  try {
    await adminStore.handleToggleBoothStatus(row.id, marketId.value)
    ElMessage.success('状态已更新')
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 删除摊位
const handleDelete = (row) => {
  if (row.status !== '空闲') {
    ElMessage.warning('只能删除空闲状态的摊位')
    return
  }
  ElMessageBox.confirm('确定要删除该摊位吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await adminStore.handleDeleteBooth(row.id, marketId.value)
      ElMessage.success('摊位已删除')
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  })
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
}

onMounted(() => {
  const id = Number(route.params.id)
  if (isNaN(id)) {
    ElMessage.error('无效的集市ID')
    router.push('/admin/market/list')
    return
  }
  marketId.value = id
  loadData()
})
</script>

<style scoped>
.market-detail-page {
  padding: 20px;
}
.market-info-card {
  margin-bottom: 20px;
}
.market-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.market-header h3 {
  margin: 0;
}
.booth-list-card .el-table {
  margin-top: 10px;
}
</style>