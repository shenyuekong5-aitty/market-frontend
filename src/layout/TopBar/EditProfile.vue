<template>
  <el-dialog v-model="visible" title="修改资料" width="440px" center @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <!-- 头像上传 -->
      <el-form-item label="头像">
        <div class="avatar-upload" @click="triggerFileInput">
          <input type="file" ref="fileInputRef" accept="image/*" style="display: none" @change="handleAvatarChange" />
          <img v-if="form.avatar" :src="form.avatar" class="avatar-preview" />
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

      <!-- 手机号修改（折叠面板） -->
      <el-collapse v-model="activeCollapse" style="border: none">
        <el-collapse-item title="更换手机号" name="phone">
          <el-form-item label="新手机号" prop="newPhone">
            <el-input v-model="form.newPhone" maxlength="11" placeholder="请输入新手机号" />
          </el-form-item>
          <el-form-item label="验证码">
            <div style="display: flex; gap: 8px;">
              <el-input v-model="form.phoneCode" placeholder="请输入验证码" style="flex:1" />
              <el-button :disabled="smsSending || !form.newPhone" @click="sendPhoneCode" style="width: 120px;">
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
import { updateProfile, sendChangePhoneSms } from '@/api/user'

const userStore = useUserStore()
const visible = ref(false)
const loading = ref(false)
const formRef = ref(null)
const fileInputRef = ref(null)
const activeCollapse = ref([])   // 折叠面板激活项
const smsSending = ref(false)
const smsCountdown = ref(60)

const form = reactive({
  nickname: '',
  avatar: '',
  gender: 1,               // 默认男
  newPhone: '',             // 修改手机号时填写
  phoneCode: '',            // 新手机号验证码
  confirmPassword: ''       // 修改手机号时的密码确认
})

const rules = {
  nickname: [{ required: true, message: '昵称不能为空', trigger: 'blur' }],
  newPhone: [
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: false, message: '请输入当前密码', trigger: 'blur' }
  ]
}

// 打开弹窗时初始化表单数据
watch(visible, (val) => {
  if (val) {
    form.nickname = userStore.userInfo.nickname || ''
    form.avatar = userStore.userInfo.avatar || ''
    form.gender = userStore.userInfo.gender || 1
    form.newPhone = ''
    form.phoneCode = ''
    form.confirmPassword = ''
    activeCollapse.value = []   // 收起手机号区域
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
    ElMessage.warning('头像大小不能超过500KB')
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

// 发送修改手机号的验证码
const sendPhoneCode = async () => {
  if (!form.newPhone || !/^1[3-9]\d{9}$/.test(form.newPhone)) {
    ElMessage.warning('请输入正确的新手机号')
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
    ElMessage.error('发送失败，请稍后重试')
    clearInterval(timer)
    smsSending.value = false
  }
}

// 提交修改
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const requestData = {
        nickname: form.nickname,
        avatar: form.avatar,
        gender: form.gender
      }

      // 如果展开了手机号修改区域，必须填写完整
      if (activeCollapse.value.includes('phone')) {
        if (!form.newPhone) {
          ElMessage.warning('请输入新手机号')
          loading.value = false
          return
        }
        if (!form.phoneCode) {
          ElMessage.warning('请输入验证码')
          loading.value = false
          return
        }
        if (!form.confirmPassword) {
          ElMessage.warning('请输入当前密码')
          loading.value = false
          return
        }
        requestData.newPhone = form.newPhone
        requestData.phoneCode = form.phoneCode
        requestData.confirmPassword = form.confirmPassword
      }

      const res = await updateProfile(requestData)
      // 更新本地 store 中的用户信息
      userStore.setLoginData({
        token: userStore.token,
        id: res.data.id,
        username: userStore.userInfo.username,
        nickname: res.data.nickname,
        avatar: res.data.avatar,
        role: userStore.userInfo.role,
        phone: res.data.phone,
        gender: res.data.gender,
        status: res.data.status
      })
      ElMessage.success('资料更新成功')
      visible.value = false
    } catch (error) {
      ElMessage.error(error.message || '更新失败')
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