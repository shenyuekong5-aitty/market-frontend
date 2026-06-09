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
          <el-button
            type="primary"
            text
            :disabled="notificationStore.unreadCount === 0"
            @click="handleReadAll"
          >
            全部标为已读
          </el-button>
        </div>
      </template>

      <!-- 空状态 -->
      <div v-if="notificationStore.list.length === 0" class="empty-state">
        <el-empty description="暂无消息" :image-size="80" />
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
    </el-card>
  </div>
</template>

<script setup>
import { watch,onMounted } from 'vue'
import { useNotificationStore } from '@/store/modules/notification'
import { Bell, Check, Warning, InfoFilled, Promotion } from '@element-plus/icons-vue'

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
    '预定请求': '#e6f7ff',
    '预定结果': '#fff7e6',
    '申请结果': '#f6ffed',
    '系统通知': '#f0f5ff',
  }
  return map[type] || '#f5f5f5'
}

// 根据消息类型返回不同图标颜色
const getIconColor = (type) => {
  const map = {
    '预定请求': '#1890ff',
    '预定结果': '#fa8c16',
    '申请结果': '#52c41a',
    '系统通知': '#2f54eb',
  }
  return map[type] || '#8c8c8c'
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