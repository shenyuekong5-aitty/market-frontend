<template>
  <header class="topbar">
    <div class="left">
      <!-- 折叠按钮 -->
      <el-icon class="fold-icon" @click="appStore.toggleSidebar">
        <Fold v-if="!appStore.sidebarCollapsed" />
        <Expand v-else />
      </el-icon>

      <!-- 面包屑导航 -->
      <el-breadcrumb :separator-icon="ArrowRight">
        <!-- 如果 breadcrumbList 为空，显示一个默认首页项 -->
        <template v-if="breadcrumbList.length === 0">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        </template>
        <el-breadcrumb-item v-for="item in breadcrumbList" :key="item.path" :to="{ path: item.path }">
          {{ item.meta?.title || item.name }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="right">
      <!-- 设置按钮区 -->
      <div class="setting">
        <el-button circle :icon="Refresh" size="small" @click="appStore.refresh" />
        <el-button circle size="small" @click="handleFullScreen">
          <el-icon>
            <FullScreen />
          </el-icon>
        </el-button>
        <el-button circle size="small" @click="appStore.toggleDarkMode">
          <el-icon v-if="appStore.isDark">
            <Sunny />
          </el-icon>
          <el-icon v-else>
            <Moon />
          </el-icon>
        </el-button>
      </div>

      <!-- 用户信息及下拉 -->
      <div class="userinfo">
        <img v-if="userStore.avatarFullUrl" :src="userStore.avatarFullUrl" class="avatar" alt="头像" />
        <span v-else class="avatar-placeholder">
          {{ userStore.userInfo.nickname?.charAt(0) || 'U' }}
        </span>
        <span class="username">{{ userStore.userInfo.nickname || '用户' }}</span>

        <el-dropdown>
          <span class="el-dropdown-link">
            更多
            <el-icon>
              <ArrowDown />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="checkAccountRef?.open()">账号检测</el-dropdown-item>
              <el-dropdown-item @click="editProfileRef?.open()">修改资料</el-dropdown-item>
              <el-dropdown-item @click="updatePasswordRef?.open()">修改密码</el-dropdown-item>
              <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">注销账号</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 弹窗组件 -->
    <CheckAccount ref="checkAccountRef" />
    <!-- 修改资料弹窗 -->
    <EditProfile ref="editProfileRef" />
    <!-- 修改密码弹窗 -->
    <UpdatePassword ref="updatePasswordRef" />
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Fold,
  Expand,
  ArrowDown,
  ArrowRight,
  Refresh,
  FullScreen,
  Moon,
  Sunny
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'
import { ElMessage } from 'element-plus'
import EditProfile from './EditProfile.vue'
import UpdatePassword from './UpdatePassword.vue'
import CheckAccount from '@/components/CheckAccount.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const editProfileRef = ref(null)
const updatePasswordRef = ref(null)
const checkAccountRef = ref(null)

// 面包屑（过滤掉没有 title 的项，排除根路径 /）
const breadcrumbList = computed(() => {
  return route.matched.filter(item => item.meta?.title && item.path !== '/')
})

// 全屏切换
const handleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.topbar {
  height: var(--topbar-height, 60px);
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.fold-icon {
  font-size: 22px;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.3s;
}

.fold-icon:hover {
  transform: scale(1.1);
}

:deep(.el-breadcrumb) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.el-breadcrumb__inner) {
  color: rgba(255, 255, 255, 0.85);
  font-size: 16px;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: white;
  font-weight: 500;
}

.right {
  display: flex;
  align-items: center;
  gap: 18px;
}

.setting {
  display: flex;
  align-items: center;
  gap: 8px;
}

.userinfo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
}

.username {
  font-size: 16px;
  color: white;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  outline: none;
}

.el-dropdown-link:focus {
  outline: none;
}
</style>