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
          <UiButton
            type="primary"
            text
            :disabled="notificationStore.unreadCount === 0"
            @click="handleReadAll"
          >
            全部标为已读
          </UiButton>
        </div>
      </template>

      <!-- 空状态 -->
      <div v-if="notificationStore.list.length === 0" class="empty-state">
        <UiEmpty description="暂无消息" />
      </div>

      <!-- 消息列表 -->
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
    </UiCard>
  </div>
</template>

<script setup>
import { watch,onMounted } from 'vue'
import { useNotificationStore } from '@/store/modules/notification'
import { Bell, Check, Warning, InfoFilled, Promotion  } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const notificationStore = useNotificationStore()

onMounted(async () => {
  try {
    await notificationStore.fetchNotifications()
  } catch (e) {
    ElMessage.error('获取消息失败')
  }
})

// 监听未读数量变化，自动刷新列表
watch(
  () => notificationStore.unreadCount,
  () => {
    notificationStore.fetchNotifications()
  }
)

const handleRead = async (id) => {
  await notificationStore.readNotification(id)
}

const handleReadAll = async () => {
  await notificationStore.readAll()
}

// 根据消息类型返回不同图标
const getIcon = (type) => {
  const map = {
    '预定请求': 'Promotion',
    '预定结果': 'Warning',
    '申请结果': 'Check',
    '系统通知': 'InfoFilled',
  }
  return map[type] || 'InfoFilled'
}

// 根据消息类型返回不同图标背景色
const getIconBg = (type) => {
  const map = {
    '预定请求': 'var(--brand-primary-soft)',
    '预定结果': '#fff3d8',
    '申请结果': '#e8f5ef',
    '系统通知': 'var(--surface-subtle)',
  }
  return map[type] || 'var(--surface-subtle)'
}

// 根据消息类型返回不同图标颜色
const getIconColor = (type) => {
  const map = {
    '预定请求': 'var(--brand-primary)',
    '预定结果': 'var(--warning)',
    '申请结果': 'var(--success)',
    '系统通知': 'var(--ink)',
  }
  return map[type] || 'var(--ink-muted)'
}

// 格式化时间（截取前16位，如 2024-01-01 12:30）
const formatTime = (time) => {
  if (!time) return ''
  return time.substring(0, 16)
}
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
</style>
