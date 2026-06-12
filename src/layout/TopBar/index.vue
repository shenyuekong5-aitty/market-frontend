<template>
  <header class="topbar">
    <div class="left">
      <el-icon class="fold-icon" @click="appStore.toggleSidebar">
        <Fold v-if="!appStore.sidebarCollapsed" />
        <Expand v-else />
      </el-icon>
      <el-breadcrumb :separator-icon="ArrowRight">
        <template v-if="breadcrumbList.length === 0">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        </template>
        <el-breadcrumb-item
          v-for="item in breadcrumbList"
          :key="item.path"
          :to="{ path: item.path }"
        >
          {{ item.meta?.title || item.name }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="right">
      <!-- 设置按钮区 -->
      <div class="setting">
        <el-button circle :icon="Refresh" size="small" @click="appStore.refresh" />
        <el-button circle size="small" @click="handleFullScreen">
          <el-icon><FullScreen /></el-icon>
        </el-button>
      </div>

      <!-- 消息通知铃铛 -->
      <el-badge :value="notificationStore.unreadCount" :max="99" :hidden="notificationStore.unreadCount === 0">
        <el-icon class="bell-icon" @click="goToMessages">
          <Bell />
        </el-icon>
      </el-badge>

      <!-- 用户信息及下拉 -->
      <div class="userinfo">
        <img
          v-if="userStore.avatarFullUrl"
          :src="userStore.avatarFullUrl"
          class="avatar"
          alt="头像"
        />
        <span v-else class="avatar-placeholder">
          {{ userStore.userInfo.nickname?.charAt(0) || "U" }}
        </span>
        <span class="username">{{ userStore.userInfo.nickname || "用户" }}</span>
        <el-dropdown>
          <span class="el-dropdown-link">
            更多
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="checkAccountRef?.open()">账号检测</el-dropdown-item>
              <el-dropdown-item @click="editProfileRef?.open()">修改资料</el-dropdown-item>
              <el-dropdown-item @click="updatePasswordRef?.open()">修改密码</el-dropdown-item>
              <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              <el-dropdown-item divided @click="handleDeactivate">注销账号</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <CheckAccount ref="checkAccountRef" />
    <EditProfile ref="editProfileRef" />
    <UpdatePassword ref="updatePasswordRef" />
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Fold, Expand, ArrowDown, ArrowRight, Refresh, FullScreen, Bell,
} from "@element-plus/icons-vue";
import { useAppStore } from "@/store/modules/app";
import { useUserStore } from "@/store/modules/user";
import { useAdminStore } from '@/store/modules/admin'
import { useNotificationStore } from "@/store/modules/notification";
import { ElMessage, ElMessageBox } from "element-plus";
import EditProfile from "./EditProfile.vue";
import UpdatePassword from "./UpdatePassword.vue";
import CheckAccount from "@/components/CheckAccount.vue";
import { connectWebSocket, disconnectWebSocket } from '@/utils/websocket'
import { playBeep } from '@/utils/beep'

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();
const adminStore = useAdminStore() 
const notificationStore = useNotificationStore();


const editProfileRef = ref(null);
const updatePasswordRef = ref(null);
const checkAccountRef = ref(null);

let unreadTimer = null;

// 面包屑
const breadcrumbList = computed(() => {
  return route.matched.filter((item) => item.meta?.title && item.path !== "/");
});

// 全屏切换
const handleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

// 跳转到消息中心
const goToMessages = () => {
  const role = userStore.userInfo.role
  if (role === 'admin') {
    router.push('/admin/messages')
  } else if (role === 'vendor') {
    router.push('/vendor/messages')
  } else {
    router.push('/messages')
  }
}

// 初始化未读消息数量
const initUnreadCount = async () => {
  try {
    await notificationStore.fetchUnreadCount();
  } catch (e) {
    // 忽略错误
  }
};

const handleLogout = () => {
  userStore.logout();
  ElMessage.success("已退出登录");
  router.push("/login");
};

const handleDeactivate = () => {
  ElMessageBox.confirm(
    "确定要注销账号吗？注销后可通过忘记密码重新激活。",
    "确认注销",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(async () => {
      try {
        await userStore.deactivateAccount();
        ElMessage.success("账号已注销");
        userStore.logout();
      } catch (error) {
        ElMessage.error(error.message || "注销失败");
      }
    })
    .catch(() => {});
};

onMounted(() => {
  initUnreadCount();
  unreadTimer = setInterval(initUnreadCount, 30000);

const userId = userStore.userInfo.id
if (userId) {
  connectWebSocket(userId, async () => {
  await notificationStore.fetchUnreadCount()
  console.log('当前未读数量：', notificationStore.unreadCount)
  // 如果当前用户是管理员，同时刷新待审批申请
  if (userStore.userInfo.role === 'admin') {
    try {
      await adminStore.fetchApplies()
    } catch (e) { /* 忽略 */ }
  }
  playBeep()
})
}
});

onUnmounted(() => {
  if (unreadTimer) clearInterval(unreadTimer);

  disconnectWebSocket()
});
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

.bell-icon {
  font-size: 20px;
  color: white;
  cursor: pointer;
  transition: transform 0.2s;
}

.bell-icon:hover {
  transform: scale(1.1);
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