<template>
  <div class="messages-page">
    <UiCard class="msg-card">
      <template #header>
        <div class="msg-header">
          <div class="header-left">
            <el-icon size="20"><Bell /></el-icon>
            <span class="header-title">消息中心</span>
            <UiBadge
              v-if="notificationStore.unreadCount > 0"
              :value="notificationStore.unreadCount"
              class="unread-badge"
            />
          </div>
          <div class="header-actions">
            <UiButton v-if="canSendGlobalNotice" type="primary" size="small" @click="openSendDialog"
              >发送通知</UiButton
            >
            <UiButton
              type="primary"
              text
              size="small"
              :disabled="notificationStore.unreadCount === 0"
              @click="handleReadAll"
            >
              全部标为已读
            </UiButton>
          </div>
        </div>
      </template>

      <!-- 消息列表（同之前） -->
      <div v-if="notificationStore.list.length === 0" class="empty-state">
        <UiEmpty description="暂无消息" />
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
            <div class="msg-icon" :style="{ background: getNotificationStyle(item.type).background }">
              <el-icon :color="getNotificationStyle(item.type).color" size="18">
                <component :is="getNotificationStyle(item.type).icon" />
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
            <span class="msg-time">{{ formatNotificationTime(item.createTime) }}</span>
          </div>
        </div>
      </div>
    </UiCard>

    <!-- 发送通知弹窗 -->
    <UiDialog v-model="sendVisible" title="发送系统通知" width="500px">
      <el-form :model="sendForm" label-width="80px">
        <UiFormItem label="目标角色">
          <UiSelect
            v-model="sendForm.role"
            placeholder="请选择接收角色"
            style="width: 100%"
          >
            <UiOption label="所有用户" value="all" />
            <UiOption label="全部管理员" value="admin" />
            <UiOption label="超级管理员" value="super_admin" />
            <UiOption label="集市管理员" value="market_admin" />
            <UiOption label="小贩" value="vendor" />
            <UiOption label="普通用户" value="user" />
          </UiSelect>
        </UiFormItem>
        <UiFormItem label="通知内容">
          <UiInput
            v-model="sendForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入通知内容"
          />
        </UiFormItem>
      </el-form>
      <template #footer>
        <UiButton @click="sendVisible = false">取消</UiButton>
        <UiButton type="primary" :loading="sending" @click="handleSend"
          >发送</UiButton
        >
      </template>
    </UiDialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useUserStore } from "@/store/modules/user";
import { ElMessage } from "element-plus";
import { useNotificationInbox } from '@/composables/useNotificationInbox'
import { getNotificationStyle, formatNotificationTime } from '@/utils/notificationDisplay'
import {
  Bell,
} from "@element-plus/icons-vue";

const { notificationStore, handleRead, handleReadAll } = useNotificationInbox()
const userStore = useUserStore();
const canSendGlobalNotice = computed(() => userStore.userInfo.role === 'super_admin');

const sendVisible = ref(false);
const sending = ref(false);
const sendForm = reactive({
  role: "all",
  content: "",
});


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

</script>

<style scoped>
.messages-page {
  padding: 20px;
}
.msg-card { border-radius: var(--radius-md); border: 1px solid var(--line); box-shadow: var(--shadow-sm); }
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
  color: var(--ink-strong);
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
  border-bottom: 1px solid var(--line);
  transition: all 0.2s;
  cursor: pointer;
}
.msg-item:last-child {
  border-bottom: none;
}
.msg-item:hover {
  background: var(--surface-subtle);
}
.msg-item.is-unread {
  background: var(--brand-primary-soft);
}
.msg-item.is-unread:hover {
  background: var(--brand-primary-soft);
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
  color: var(--ink);
  background: var(--surface-subtle);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}
.unread-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--danger);
}
.msg-text {
  font-size: 14px;
  color: var(--ink-strong);
  line-height: 1.5;
  word-break: break-all;
}
.msg-right {
  flex-shrink: 0;
  margin-left: 20px;
}
.msg-time {
  font-size: 12px;
  color: var(--ink-muted);
  white-space: nowrap;
}
@media (min-width: 768px) and (max-width: 1024px) { .messages-page { padding: 12px; } }
@media (max-width: 767px) {
  .messages-page { padding: 0; }
  .msg-header { align-items: flex-start; flex-wrap: wrap; gap: 10px; }
  .header-actions { width: 100%; flex-wrap: wrap; gap: 8px; }
  .msg-item { align-items: flex-start; flex-direction: column; gap: 8px; padding: 14px 2px; }
  .msg-left { width: 100%; min-width: 0; gap: 10px; }
  .msg-right { margin-left: 50px; }
  .msg-icon { width: 38px; height: 38px; }
  .empty-state { padding: 24px 0; }
}
</style>
