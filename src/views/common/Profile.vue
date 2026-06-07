<template>
  <div class="profile-container">
    <!-- 用户信息卡片 -->
    <el-card class="profile-card">
      <div class="user-header">
        <!-- 头像 -->
        <div class="avatar-section">
          <img
            v-if="userStore.avatarFullUrl"
            :src="userStore.avatarFullUrl"
            class="avatar"
            alt="头像"
          />
          <span v-else class="avatar-placeholder">
            {{ userStore.userInfo.nickname?.charAt(0) || 'U' }}
          </span>
        </div>

        <!-- 基本信息 -->
        <div class="user-info">
          <h2 class="nickname">{{ userStore.userInfo.nickname || '未设置昵称' }}</h2>
          <p class="username">账号：{{ userStore.userInfo.username }}</p>
          <p class="phone">手机号：{{ userStore.userInfo.phone || '未绑定' }}</p>
          <p class="gender">性别：{{ genderText }}</p>
          <p class="role">
            身份：
            <el-tag :type="roleTagType" size="small">
              {{ roleText }}
            </el-tag>
          </p>
          <p class="register-time">
            注册时间：{{ userStore.userInfo.createTime || '未知' }}
          </p>
        </div>
      </div>
    </el-card>

    <!-- 功能入口 -->
    <el-card class="actions-card">
      <template #header>
        <span>账号管理</span>
      </template>
      <div class="actions-grid">
        <el-button type="primary" plain @click="editProfileRef?.open()">
          <el-icon><Edit /></el-icon> 修改资料
        </el-button>
        <el-button type="primary" plain @click="updatePasswordRef?.open()">
          <el-icon><Lock /></el-icon> 修改密码
        </el-button>
        <el-button type="primary" plain @click="checkAccountRef?.open()">
          <el-icon><Monitor /></el-icon> 账号检测
        </el-button>
        <el-button type="danger" plain @click="handleLogout">
          <el-icon><SwitchButton /></el-icon> 退出登录
        </el-button>
        <el-button type="danger" @click="handleDeactivate">
          <el-icon><Delete /></el-icon> 注销账号
        </el-button>
      </div>
    </el-card>

    <!-- 弹窗组件（与 TopBar 共用） -->
    <EditProfile ref="editProfileRef" />
    <UpdatePassword ref="updatePasswordRef" />
    <CheckAccount ref="checkAccountRef" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Lock, Monitor, SwitchButton, Delete } from '@element-plus/icons-vue'
import EditProfile from '@/layout/TopBar/EditProfile.vue'
import UpdatePassword from '@/layout/TopBar/UpdatePassword.vue'
import CheckAccount from '@/components/CheckAccount.vue'

const router = useRouter()
const userStore = useUserStore()

const editProfileRef = ref(null)
const updatePasswordRef = ref(null)
const checkAccountRef = ref(null)

// 性别文本映射
const genderText = computed(() => {
  const map = { 0: '女', 1: '男', 2: '保密' }
  return map[userStore.userInfo.gender] || '未设置'
})

// 角色文本映射
const roleText = computed(() => {
  const map = { admin: '集市管理员', vendor: '小贩', user: '普通用户' }
  return map[userStore.userInfo.role] || userStore.userInfo.role
})

// 角色标签类型（颜色）
const roleTagType = computed(() => {
  const map = { admin: 'danger', vendor: 'warning', user: 'info' }
  return map[userStore.userInfo.role] || 'info'
})

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  }).catch(() => {})
}

// 注销账号
const handleDeactivate = () => {
  ElMessageBox.confirm(
    '确定要注销账号吗？注销后可通过忘记密码重新激活。',
    '确认注销',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await userStore.deactivateAccount()
      ElMessage.success('账号已注销')
      userStore.logout()
    } catch (error) {
      ElMessage.error(error.message || '注销失败')
    }
  }).catch(() => {})
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-card .user-header {
  display: flex;
  align-items: center;
  gap: 30px;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e4e7ed;
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
}

.user-info {
  flex: 1;
}

.user-info h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #303133;
}

.user-info p {
  margin: 6px 0;
  font-size: 14px;
  color: #606266;
}

.actions-card .actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.actions-grid .el-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 44px;
}
</style>