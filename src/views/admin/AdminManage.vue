<template>
  <div class="admin-manage-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>管理员管理</span>
          <el-button type="primary" size="small" @click="openCreateDialog">创建管理员</el-button>
        </div>
      </template>

      <el-dialog v-model="createVisible" title="创建管理员账号" width="450px">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="账号" prop="username">
            <el-input v-model="form.username" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" show-password />
          </el-form-item>
          <el-form-item label="昵称">
            <el-input v-model="form.nickname" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="form.phone" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="createVisible = false">取消</el-button>
          <el-button type="primary" :loading="creating" @click="handleCreate">确定创建</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAdminStore } from '@/store/modules/admin'
import { ElMessage } from 'element-plus'

const adminStore = useAdminStore()
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
      ElMessage.success('管理员账号创建成功')
      createVisible.value = false
    } catch (e) {
      ElMessage.error(e.message || '创建失败')
    } finally {
      creating.value = false
    }
  })
}
</script>

<style scoped>
.admin-manage-page { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>