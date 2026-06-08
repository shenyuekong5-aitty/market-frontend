<template>
  <div class="messages-page">
    <el-card class="msg-card" shadow="never">
      <template #header>
        <div class="msg-header">
          <div class="header-left">
            <el-icon size="20"><Bell /></el-icon>
            <span class="header-title">消息中心</span>
            <el-badge
              v-if="notificationStore.unreadCount > 0"
              :value="notificationStore.unreadCount"
              class="unread-badge"
            />
          </div>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="openSendDialog"
              >发送通知</el-button
            >
            <el-button
              type="primary"
              text
              size="small"
              :disabled="notificationStore.unreadCount === 0"
              @click="handleReadAll"
            >
              全部标为已读
            </el-button>
          </div>
        </div>
      </template>

      <!-- 消息列表（同之前） -->
      <div v-if="notificationStore.list.length === 0" class="empty-state">
        <el-empty description="暂无消息" :image-size="80" />
      </div>
      <div v-else class="msg-list">
        <div
          v-for="item in notificationStore.list"
          :key="item.id"
          class="msg-item"
          :class="{ 'is-unread': item.isRead === 0 }"
          @click="handleRead(item.id)"
        >
          <div class="msg-left">
            <div class="msg-icon" :style="{ background: getIconBg(item.type) }">
              <el-icon :color="getIconColor(item.type)" size="18">
                <component :is="getIcon(item.type)" />
              </el-icon>
            </div>
            <div class="msg-body">
              <div class="msg-title">
                <span class="msg-type-tag">{{ item.type }}</span>
                <span v-if="item.isRead === 0" class="unread-dot"></span>
              </div>
              <div class="msg-text">{{ item.content }}</div>
            </div>
          </div>
          <div class="msg-right">
            <span class="msg-time">{{ formatTime(item.createTime) }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 发送通知弹窗 -->
    <el-dialog v-model="sendVisible" title="发送系统通知" width="500px">
      <el-form :model="sendForm" label-width="80px">
        <el-form-item label="目标角色">
          <el-select
            v-model="sendForm.role"
            placeholder="请选择接收角色"
            style="width: 100%"
          >
            <el-option label="所有用户" value="all" />
            <el-option label="管理员" value="admin" />
            <el-option label="小贩" value="vendor" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="通知内容">
          <el-input
            v-model="sendForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入通知内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sendVisible = false">取消</el-button>
        <el-button type="primary" :loading="sending" @click="handleSend"
          >发送</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useNotificationStore } from "@/store/modules/notification";
import { ElMessage } from "element-plus";
import {
  Bell,
  Check,
  Warning,
  InfoFilled,
  Promotion,
} from "@element-plus/icons-vue";

const notificationStore = useNotificationStore();

const sendVisible = ref(false);
const sending = ref(false);
const sendForm = reactive({
  role: "all",
  content: "",
});

onMounted(async () => {
  await notificationStore.fetchNotifications();
});

const handleRead = async (id) => {
  await notificationStore.readNotification(id);
};

const handleReadAll = async () => {
  await notificationStore.readAll();
};

// 打开发送弹窗
const openSendDialog = () => {
  sendForm.role = "all";
  sendForm.content = "";
  sendVisible.value = true;
};

// 发送通知
const handleSend = async () => {
  if (!sendForm.content.trim()) {
    ElMessage.warning("请输入通知内容");
    return;
  }
  sending.value = true;
  try {
    await notificationStore.adminSendNotification(
      sendForm.role,
      sendForm.content,
    );
    ElMessage.success("通知已发送");
    sendVisible.value = false;
    // 刷新自己的消息列表（管理员自己也会收到通知）
    await notificationStore.fetchNotifications();
  } catch (e) {
    ElMessage.error(e.message || "发送失败");
  } finally {
    sending.value = false;
  }
};

const getIcon = (type) => {
  const map = {
    预定请求: "Promotion",
    预定结果: "Warning",
    申请结果: "Check",
    系统通知: "InfoFilled",
  };
  return map[type] || "InfoFilled";
};

const getIconBg = (type) => {
  const map = {
    预定请求: "#e6f7ff",
    预定结果: "#fff7e6",
    申请结果: "#f6ffed",
    系统通知: "#f0f5ff",
  };
  return map[type] || "#f5f5f5";
};

const getIconColor = (type) => {
  const map = {
    预定请求: "#1890ff",
    预定结果: "#fa8c16",
    申请结果: "#52c41a",
    系统通知: "#2f54eb",
  };
  return map[type] || "#8c8c8c";
};

const formatTime = (time) => {
  if (!time) return "";
  return time.substring(0, 16);
};
</script>

<style scoped>
.messages-page {
  padding: 20px;
}
.msg-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.msg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
.unread-badge {
  margin-left: 4px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.empty-state {
  padding: 40px;
  text-align: center;
}
.msg-list {
  display: flex;
  flex-direction: column;
}
.msg-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s;
  cursor: pointer;
}
.msg-item:last-child {
  border-bottom: none;
}
.msg-item:hover {
  background: #fafafa;
}
.msg-item.is-unread {
  background: #fafbff;
}
.msg-item.is-unread:hover {
  background: #f0f5ff;
}
.msg-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
}
.msg-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.msg-body {
  flex: 1;
  min-width: 0;
}
.msg-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.msg-type-tag {
  font-size: 13px;
  color: #606266;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}
.unread-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f5222d;
}
.msg-text {
  font-size: 14px;
  color: #303133;
  line-height: 1.5;
  word-break: break-all;
}
.msg-right {
  flex-shrink: 0;
  margin-left: 20px;
}
.msg-time {
  font-size: 12px;
  color: #c0c4cc;
  white-space: nowrap;
}
</style>
