<template>
  <header class="topbar">
    <div class="left">
      <!-- 控制aside缩放 -->
      <el-icon class="fold-icon" @click="appStore.toggleSidebar">
        <Fold v-if="!appStore.sidebarCollapsed" />
        <Expand v-else />
      </el-icon>
      <!-- 显示当前导航路径的面包屑 -->
      <nav class="app-breadcrumb" aria-label="面包屑导航">
        <router-link v-if="breadcrumbList.length === 0" to="/">首页</router-link>
        <template v-for="(item, index) in breadcrumbList" :key="item.path">
          <span class="crumb-separator" aria-hidden="true">/</span>
          <router-link
            :class="{ current: index === breadcrumbList.length - 1 }"
            :to="{ path: item.path }"
          >
            {{ item.meta?.title || item.name }}
          </router-link>
        </template>
      </nav>
    </div>

    <div class="right">
      <!-- 设置按钮区 -->
      <div class="setting">
        <!-- 销毁后重新创建main组件 -->
        <UiButton
          circle
          :icon="Refresh"
          size="small"
          @click="appStore.refresh"
        />
        <!-- mian是否全屏显示 -->
        <UiButton circle size="small" @click="handleFullScreen">
          <el-icon><FullScreen /></el-icon>
        </UiButton>
      </div>

      <!-- 消息通知铃铛 -->
      <UiBadge
        :value="notificationStore.unreadCount"
        :max="99"
        :hidden="notificationStore.unreadCount === 0"
      >
        <el-icon class="bell-icon" @click="goToMessages">
          <Bell />
        </el-icon>
      </UiBadge>

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
        <span class="username">{{
          userStore.userInfo.nickname || "用户"
        }}</span>
        <UiDropdown>
          <template #trigger>
            <span class="dropdown-link">
              更多
              <el-icon><ArrowDown /></el-icon>
            </span>
          </template>
          <button type="button" @click="checkAccountRef?.open()">账号检测</button>
          <button type="button" @click="editProfileRef?.open()">修改资料</button>
          <button type="button" @click="updatePasswordRef?.open()">修改密码</button>
          <button type="button" @click="handleLogout">退出登录</button>
          <button type="button" class="is-danger" @click="handleDeactivate">注销账号</button>
        </UiDropdown>
      </div>
    </div>

    <!-- 检查账号状态弹窗 -->
    <CheckAccount ref="checkAccountRef" />
    <!-- 编辑用户信息弹窗 -->
    <EditProfile ref="editProfileRef" />
    <!-- 更新密码弹窗 -->
    <UpdatePassword ref="updatePasswordRef" />
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Fold,
  Expand,
  ArrowDown,
  Refresh,
  FullScreen,
  Bell,
} from "@element-plus/icons-vue";
import { useAppStore } from "@/store/modules/app";
import { useUserStore } from "@/store/modules/user";
import { useAdminStore } from "@/store/modules/admin";
import { useNotificationStore } from "@/store/modules/notification";
import { ElMessage, ElMessageBox } from "element-plus";
import EditProfile from "./EditProfile.vue";
import UpdatePassword from "./UpdatePassword.vue";
import CheckAccount from "@/components/CheckAccount.vue";
import { connectWebSocket, disconnectWebSocket } from "@/utils/websocket";
import { playBeep } from "@/utils/beep";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();
const adminStore = useAdminStore();
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
  const role = userStore.userInfo.role;
  if (role === "admin") {
    router.push("/admin/messages");
  } else {
    router.push("/messages");
  }
};

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

  const userId = userStore.userInfo.id;
  if (userId) {
    // 建立websocket连接
    connectWebSocket(userId, async () => {
      await notificationStore.fetchUnreadCount();
      console.log("当前未读数量：", notificationStore.unreadCount);
      // 如果当前用户是管理员，同时刷新待审批申请
      if (userStore.userInfo.role === "admin") {
        try {
          await adminStore.fetchApplies();
        } catch (e) {
          /* 忽略 */
        }
      }
      playBeep();
    });
  }
});

onUnmounted(() => {
  if (unreadTimer) clearInterval(unreadTimer);

  disconnectWebSocket();
});
</script>

<style scoped>
.topbar {
  height: var(--topbar-height, 60px);
  background-color: var(--surface-card);
  color: var(--ink-strong);
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

.app-breadcrumb {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-breadcrumb a {
  color: var(--ink-muted);
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none;
}

.app-breadcrumb a:hover {
  color: var(--brand-primary);
}

.app-breadcrumb .crumb-separator {
  flex-shrink: 0;
  color: var(--ink-faint);
}

.app-breadcrumb a.current {
  color: var(--ink-strong);
  font-weight: 650;
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
  color: var(--brand-primary);
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
  background-color: var(--brand-primary);
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
  color: var(--ink-strong);
}

.dropdown-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--ink);
  font-size: 14px;
  cursor: pointer;
  outline: none;
}

.dropdown-link:focus {
  outline: none;
}

.ui-dropdown :deep(.is-danger) {
  margin-top: 4px;
  border-top: 1px solid var(--line) !important;
  border-radius: 0 0 9px 9px !important;
  color: var(--danger) !important;
}

@media (max-width: 767px) {
  .app-breadcrumb {
    gap: 6px;
  }

  .app-breadcrumb a {
    max-width: 42vw;
    font-size: 13px;
  }

  .app-breadcrumb .crumb-separator {
    font-size: 12px;
  }
}
</style>
