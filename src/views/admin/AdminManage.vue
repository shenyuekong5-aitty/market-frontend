<template>
  <div class="admin-manage-page">
    <UiCard>
      <template #header>
        <div class="card-header">
          <span>管理员管理</span>
          <UiButton type="primary" size="small" @click="openCreateDialog">创建集市管理员</UiButton>
        </div>
      </template>

      <!-- 管理员列表 -->
      <UiTable :data="adminStore.adminList" border style="width: 100%" v-loading="adminStore.adminListLoading">
        <UiTableColumn prop="username" label="账号" width="120" />
        <UiTableColumn prop="nickname" label="昵称" width="120" />
        <UiTableColumn label="身份" width="130">
          <template #default="{ row }">
            <UiTag :type="row.role === 'super_admin' ? 'danger' : 'info'">
              {{ row.role === 'super_admin' ? '超级管理员' : '集市管理员' }}
            </UiTag>
          </template>
          </UiTableColumn>
        <UiTableColumn label="状态" width="100">
          <template #default="{ row }">
            <UiTag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '已停用' }}
            </UiTag>
          </template>
          </UiTableColumn>
        <UiTableColumn prop="createTime" label="创建时间" width="180" />
        <UiTableColumn label="操作" width="140">
          <template #default="{ row }">
            <UiButton
              v-if="row.id !== userStore.userInfo.id"
              size="small"
              :type="row.status === 1 ? 'danger' : 'success'"
              @click="handleToggleStatus(row.id)"
            >
              {{ row.status === 1 ? '停用' : '启用' }}
            </UiButton>
            <span v-else style="color: #c0c4cc;">当前账号</span>
          </template>
        </UiTableColumn>
      </UiTable>
    </UiCard>

    <!-- 创建管理员弹窗 -->
    <UiDialog v-model="createVisible" title="创建集市管理员账号" width="450px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <UiFormItem label="账号" prop="username">
          <UiInput v-model="form.username" />
        </UiFormItem>
        <UiFormItem label="密码" prop="password">
          <UiInput v-model="form.password" type="password" show-password />
        </UiFormItem>
        <UiFormItem label="昵称">
          <UiInput v-model="form.nickname" />
        </UiFormItem>
        <UiFormItem label="手机号">
          <UiInput v-model="form.phone" />
        </UiFormItem>
      </el-form>
      <template #footer>
        <UiButton @click="createVisible = false">取消</UiButton>
        <UiButton type="primary" :loading="creating" @click="handleCreate">确定创建</UiButton>
      </template>
    </UiDialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAdminStore } from '@/store/modules/admin'
import { useUserStore } from '@/store/modules/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const adminStore = useAdminStore()
const userStore = useUserStore()

const createVisible = ref(false)
const creating = ref(false)
const formRef = ref(null)

const form = reactive({
  username: '',
  password: '',
  nickname: '',
  phone: ''
})

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 18, message: '密码长度为6-18个字符', trigger: 'blur' },
    { pattern: /^(?=.*[a-zA-Z])(?=.*\d).+$/, message: '密码必须包含数字和字母', trigger: 'blur' }
  ]
}

const openCreateDialog = () => {
  form.username = ''
  form.password = ''
  form.nickname = ''
  form.phone = ''
  createVisible.value = true
}

const handleCreate = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    creating.value = true
    try {
      await adminStore.handleCreateAdmin({ ...form })
      ElMessage.success('集市管理员账号创建成功')
      createVisible.value = false
      await adminStore.fetchAdminList()
    } catch (e) {
      ElMessage.error(e.message || '创建失败')
    } finally {
      creating.value = false
    }
  })
}

const handleToggleStatus = (adminId) => {
  ElMessageBox.confirm('确定要切换该管理员的状态吗？', '提示', { type: 'warning' }).then(async () => {
    try {
      await adminStore.handleToggleAdminStatus(adminId)
      ElMessage.success('状态已更新')
    } catch (e) {
      ElMessage.error(e.message || '操作失败')
    }
  })
}

onMounted(async () => {
  await adminStore.fetchAdminList()
})
</script>

<style scoped>
.admin-manage-page { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
