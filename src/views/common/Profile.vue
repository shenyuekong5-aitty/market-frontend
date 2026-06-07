<template>
  <div class="profile-container">
    <!-- 用户信息卡片 -->
    <el-card class="profile-card">
      <div class="user-header">
        <!-- 头像 -->
        <div class="avatar-section">
          <el-image
            v-if="userStore.avatarFullUrl"
            :src="userStore.avatarFullUrl"
            :preview-src-list="[userStore.avatarFullUrl]"
            class="avatar"
            fit="cover"
            :preview-teleported="true"
            :z-index="3000"
          />
          <span v-else class="avatar-placeholder">
            {{ userStore.userInfo.nickname?.charAt(0) || "U" }}
          </span>
        </div>

        <!-- 基本信息 -->
        <div class="user-info">
          <h2 class="nickname">
            {{ userStore.userInfo.nickname || "未设置昵称" }}
          </h2>
          <p class="username">账号：{{ userStore.userInfo.username }}</p>
          <p class="phone">
            手机号：{{ userStore.userInfo.phone || "未绑定" }}
          </p>
          <p class="gender">性别：{{ genderText }}</p>
          <p class="role">
            身份：
            <el-tag :type="roleTagType" size="small">
              {{ roleText }}
            </el-tag>
          </p>
          <p class="register-time">
            注册时间：{{ userStore.userInfo.createTime || "未知" }}
          </p>
        </div>
      </div>
    </el-card>

    <!-- 功能入口 -->
    <!-- 账号与安全卡片 -->
    <el-card class="actions-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">账号与安全</span>
          <el-link type="primary" :underline="false">安全评分</el-link>
        </div>
      </template>

      <!-- 安全状态栏 -->
      <div class="security-status">
        <div class="status-item">
          <el-icon color="#67c23a"><CircleCheck /></el-icon>
          <span>账号状态正常</span>
        </div>
        <div class="status-item">
          <el-icon color="#e6a23c"><Warning /></el-icon>
          <span>未绑定备用邮箱</span>
        </div>
        <div class="status-item">
          <el-icon color="#67c23a"><CircleCheck /></el-icon>
          <span>最近登录：2小时前</span>
        </div>
      </div>

      <el-divider />

      <!-- 主要操作按钮 -->
      <div class="actions-grid">
        <div class="action-item" @click="editProfileRef?.open()">
          <div class="action-icon" style="background: rgba(64, 158, 255, 0.1)">
            <el-icon color="#409eff" size="22"><Edit /></el-icon>
          </div>
          <div class="action-text">
            <span class="action-title">修改资料</span>
            <span class="action-desc">更新个人信息</span>
          </div>
        </div>

        <div class="action-item" @click="updatePasswordRef?.open()">
          <div class="action-icon" style="background: rgba(103, 194, 58, 0.1)">
            <el-icon color="#67c23a" size="22"><Lock /></el-icon>
          </div>
          <div class="action-text">
            <span class="action-title">修改密码</span>
            <span class="action-desc">定期更换更安全</span>
          </div>
        </div>

        <div class="action-item" @click="handleLogout">
          <div class="action-icon" style="background: rgba(144, 147, 153, 0.1)">
            <el-icon color="#909399" size="22"><SwitchButton /></el-icon>
          </div>
          <div class="action-text">
            <span class="action-title">退出登录</span>
            <span class="action-desc">安全离开账号</span>
          </div>
        </div>

        <div
          class="action-item"
          @click="handleDeactivate"
          style="border-left: 3px solid #f56c6c"
        >
          <div class="action-icon" style="background: rgba(245, 108, 108, 0.1)">
            <el-icon color="#f56c6c" size="22"><Delete /></el-icon>
          </div>
          <div class="action-text">
            <span class="action-title" style="color: #f56c6c">注销账号</span>
            <span class="action-desc">删除账户数据</span>
          </div>
        </div>

        <div class="action-item" @click="checkAccountRef?.open()">
          <div class="action-icon" style="background: rgba(230, 162, 60, 0.1)">
            <el-icon color="#e6a23c" size="22"><Monitor /></el-icon>
          </div>
          <div class="action-text">
            <span class="action-title">账号检测</span>
            <span class="action-desc">全面安全扫描</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 弹窗组件（与 TopBar 共用） -->
    <EditProfile ref="editProfileRef" />
    <UpdatePassword ref="updatePasswordRef" />
    <CheckAccount ref="checkAccountRef" />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import { ElMessage, ElMessageBox, ElImage  } from "element-plus";
import {
  Edit,
  Lock,
  Monitor,
  SwitchButton,
  Delete,
  CircleCheck,
  Warning,
} from "@element-plus/icons-vue";
import EditProfile from "@/layout/TopBar/EditProfile.vue";
import UpdatePassword from "@/layout/TopBar/UpdatePassword.vue";
import CheckAccount from "@/components/CheckAccount.vue";

const router = useRouter();
const userStore = useUserStore();

const editProfileRef = ref(null);
const updatePasswordRef = ref(null);
const checkAccountRef = ref(null);

// 性别文本映射
const genderText = computed(() => {
  const map = { 0: "女", 1: "男", 2: "保密" };
  return map[userStore.userInfo.gender] || "未设置";
});

// 角色文本映射
const roleText = computed(() => {
  const map = { admin: "集市管理员", vendor: "小贩", user: "普通用户" };
  return map[userStore.userInfo.role] || userStore.userInfo.role;
});

// 角色标签类型（颜色）
const roleTagType = computed(() => {
  const map = { admin: "danger", vendor: "warning", user: "info" };
  return map[userStore.userInfo.role] || "info";
});

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm("确定要退出登录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      userStore.logout();
      ElMessage.success("已退出登录");
      router.push("/login");
    })
    .catch(() => {});
};

// 注销账号
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

.actions-card {
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.security-status {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 8px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.25s;
  border: 1px solid transparent;
}

.action-item:hover {
  background: #fff;
  border-color: #d9ecff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.action-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.action-desc {
  font-size: 12px;
  color: #909399;
}
.el-image-viewer__img {
  max-height: 90vh !important;
  max-width: 90vw !important;
  object-fit: contain;
}
</style>
