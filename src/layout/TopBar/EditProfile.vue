<template>
  <el-dialog v-model="visible" title="修改资料" width="440px" center @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <!-- 头像：预览使用本地 blob 或现有 URL -->
      <el-form-item label="头像">
        <div class="avatar-upload" @click="triggerFileInput">
          <input type="file" ref="fileInputRef" accept="image/*" style="display: none" @change="handleAvatarChange" />
          <img v-if="form.avatarPreview" :src="form.avatarPreview" class="avatar-preview" />
          <el-icon v-else class="avatar-placeholder-icon"><Plus /></el-icon>
        </div>
        <span class="upload-tip">点击更换头像</span>
      </el-form-item>

      <!-- 昵称 -->
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="form.nickname" maxlength="20" placeholder="请输入昵称" clearable />
      </el-form-item>

      <!-- 性别 -->
      <el-form-item label="性别">
        <el-radio-group v-model="form.gender">
          <el-radio :label="1">男</el-radio>
          <el-radio :label="0">女</el-radio>
          <el-radio :label="2">保密</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 手机号修改（折叠） -->
      <el-collapse v-model="activeCollapse" style="border: none">
        <el-collapse-item title="更换手机号" name="phone">
          <el-form-item label="新手机号" prop="newPhone">
            <el-input
              v-model="form.newPhone"
              maxlength="11"
              placeholder="请输入新手机号"
              @blur="checkPhoneRegistered"  
            />
          </el-form-item>
          <el-form-item label="验证码">
            <div style="display: flex; gap: 8px;">
              <el-input v-model="form.phoneCode" placeholder="请输入验证码" style="flex:1" />
              <el-button
                :disabled="smsSending || !form.newPhone || phoneExists"  
                @click="sendPhoneCode"
                style="width: 120px;"
              >
                {{ smsSending ? smsCountdown + '秒' : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="登录密码" prop="confirmPassword">
            <el-input v-model="form.confirmPassword" type="password" placeholder="请输入当前密码" show-password />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
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
import { sendChangePhoneSms } from '@/api/user'

const userStore = useUserStore()
const visible = ref(false)
const loading = ref(false)
const formRef = ref(null)
const fileInputRef = ref(null)
const activeCollapse = ref([])
const smsSending = ref(false)
const smsCountdown = ref(60)

// 手机号校验相关状态
const phoneExists = ref(false)      // 新手机号是否已被注册
const phoneChecking = ref(false)    // 是否正在检查中

const form = reactive({
  nickname: '',
  avatarPreview: '',
  gender: 1,
  newPhone: '',
  phoneCode: '',
  confirmPassword: ''
})

const pendingAvatarFile = ref(null)

const rules = {
  nickname: [{ required: true, message: '昵称不能为空', trigger: 'blur' }],
  newPhone: [{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }]
}

watch(visible, (val) => {
  if (val) {
    const user = userStore.userInfo
    form.nickname = user.nickname || ''
    form.gender = user.gender ?? 1
    form.newPhone = ''
    form.phoneCode = ''
    form.confirmPassword = ''
    pendingAvatarFile.value = null
    form.avatarPreview = userStore.avatarFullUrl || ''
    activeCollapse.value = []
    phoneExists.value = false   // 重置状态
  }
})

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleAvatarChange = (event) => {
  const input = event.target
  const file = input.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    input.value = ''
    return
  }
  if (file.size > 500 * 1024) {
    ElMessage.warning('头像大小不能超过500KB')
    input.value = ''
    return
  }
  pendingAvatarFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    form.avatarPreview = e.target.result
  }
  reader.readAsDataURL(file)
  input.value = ''
}

//检查新手机号是否已被注册
const checkPhoneRegistered = async () => {
  if (!form.newPhone || !/^1[3-9]\d{9}$/.test(form.newPhone)) {
    phoneExists.value = false
    return
  }
  phoneChecking.value = true
  try {
    const exists = await userStore.isPhoneRegistered(form.newPhone)
    phoneExists.value = exists
    if (exists) {
      ElMessage.warning('该手机号已被注册')
    }
  } catch (error) {
    ElMessage.error('检查手机号失败')
    phoneExists.value = false
  } finally {
    phoneChecking.value = false
  }
}

// 发送验证码
const sendPhoneCode = async () => {
  if (!form.newPhone || !/^1[3-9]\d{9}$/.test(form.newPhone)) {
    ElMessage.warning('请输入正确的新手机号')
    return
  }
  if (phoneExists.value) {
    ElMessage.warning('该手机号已被注册')
    return
  }
  smsSending.value = true
  let count = 60
  smsCountdown.value = count
  const timer = setInterval(() => {
    count--
    smsCountdown.value = count
    if (count <= 0) {
      clearInterval(timer)
      smsSending.value = false
    }
  }, 1000)
  try {
    await sendChangePhoneSms(form.newPhone)
    ElMessage.success('验证码已发送')
  } catch (error) {
    ElMessage.error('发送失败')
    clearInterval(timer)
    smsSending.value = false
  }
}

// 提交/确认按钮
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    if (activeCollapse.value.includes('phone')) {
      if (!form.newPhone) { ElMessage.warning('请输入新手机号'); return }
      if (!form.phoneCode) { ElMessage.warning('请输入验证码'); return }
      if (!form.confirmPassword) { ElMessage.warning('请输入当前密码'); return }
    }

    loading.value = true
    try {
      await userStore.updateUserProfile({
        nickname: form.nickname,
        gender: form.gender,
        avatarFile: pendingAvatarFile.value,
        newPhone: activeCollapse.value.includes('phone') ? form.newPhone : null,
        phoneCode: activeCollapse.value.includes('phone') ? form.phoneCode : null,
        confirmPassword: activeCollapse.value.includes('phone') ? form.confirmPassword : null
      })
      ElMessage.success('资料更新成功')
      visible.value = false
    } catch (error) {
      const msg = error.response?.data?.message || error.message || '更新失败'
      ElMessage.error(msg)
    } finally {
      loading.value = false
    }
  })
}

const handleClose = () => {
  formRef.value?.resetFields()
}

defineExpose({ open: () => { visible.value = true } })
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