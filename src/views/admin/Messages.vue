<template>
  <div class="messages-page">
    <PageHeading title="消息中心" description="集中查看集市通知与审批提醒。" eyebrow="INBOX / 通知" />
    <CollectionToolbar v-model="searchQuery" :count="filteredRows.length" placeholder="搜索消息内容…" />
    <UiEmpty v-if="searchQuery && !filteredRows.length" description="没有找到匹配的内容，试试其他关键词。" class="search-empty" />
    <UiCard class="msg-card">
      <template #header>
        <div class="msg-header">
          <div class="header-left">
            <el-icon size="20"><Bell /></el-icon>
            <span class="header-title">通知收件箱</span>
            <span v-if="notificationStore.unreadCount > 0" class="inbox-unread-count">
              {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
            </span>
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
          v-for="item in filteredRows"
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
import CollectionToolbar from '@/components/CollectionToolbar.vue'
import { useCollectionSearch } from '@/composables/useCollectionSearch'
import PageHeading from '@/components/PageHeading.vue'
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


const { searchQuery, filteredRows } = useCollectionSearch(() => notificationStore.list, ['type', 'content'])
</script>
