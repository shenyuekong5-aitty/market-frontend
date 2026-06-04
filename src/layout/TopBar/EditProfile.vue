<template>
  <el-dialog v-model="visible" title="修改资料" width="420px" center @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="60px">
      <!-- 头像 -->
      <el-form-item label="头像">
        <div class="avatar-upload" @click="triggerFileInput">
          <input
            type="file"
            ref="fileInputRef"
            accept="image/*"
            style="display: none"
            @change="handleAvatarChange"
          />
          <img v-if="form.avatar" :src="form.avatar" class="avatar-preview" />
          <el-icon v-else class="avatar-placeholder-icon"><Plus /></el-icon>
        </div>
        <span class="upload-tip">点击更换头像</span>
      </el-form-item>

      <!-- 昵称 -->
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="form.nickname" maxlength="20" placeholder="请输入新昵称" clearable />
      </el-form-item>

      <!-- 手机号 -->
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" maxlength="11" placeholder="请输入新手机号" clearable />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const visible = ref(false)
const loading = ref(false)
const formRef = ref(null)
const fileInputRef = ref(null)

const form = reactive({
  nickname: '',
  avatar: '',
  phone: ''
})

const rules = {
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
}

watch(visible, (val) => {
  if (val) {
    form.nickname = userStore.userInfo.nickname || ''
    form.avatar = userStore.userInfo.avatar || ''
    form.phone = userStore.userInfo.phone || ''
  }
})

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const MAX_AVATAR_SIZE = 500 * 1024

const handleAvatarChange = (event) => {
  const input = event.target
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    input.value = ''
    return
  }
  if (file.size > MAX_AVATAR_SIZE) {
    ElMessage.warning(`头像大小不能超过 ${MAX_AVATAR_SIZE / 1024}KB`)
    input.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    form.avatar = reader.result
  }
  reader.readAsDataURL(file)
  input.value = ''
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      // TODO: 调用后端接口更新用户信息
      // await userStore.updateProfile({ ... })
      userStore.userInfo.nickname = form.nickname
      userStore.userInfo.avatar = form.avatar
      userStore.userInfo.phone = form.phone
      ElMessage.success('资料更新成功')
      visible.value = false
    } catch (e) {
      ElMessage.error(e.message || '更新失败')
    } finally {
      loading.value = false
    }
  })
}

const handleClose = () => {
  formRef.value?.resetFields()
}

defineExpose({
  open: () => {
    visible.value = true
  }
})
</script>

<style scoped>
.avatar-upload {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin: 0 auto;
  overflow: hidden;
  cursor: pointer;
  border: 2px dashed #dcdfe6;
  border-radius: 50%;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-placeholder-icon {
  font-size: 30px;
  color: #c0c4cc;
}

.upload-tip {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #999;
  text-align: center;
}
</style>