<template>
  <div class="messages-page">
    <PageHeading title="消息中心" description="订单进度、预订提醒和平台消息，及时掌握。" eyebrow="INBOX / 消息" />
    <CollectionToolbar v-model="searchQuery" :count="filteredRows.length" placeholder="搜索消息内容…" />
    <UiEmpty v-if="searchQuery && !filteredRows.length" description="没有找到匹配的内容，试试其他关键词。" class="search-empty" />
    <UiCard class="msg-card">
      <template #header>
        <div class="msg-header">
          <div class="header-left">
            <el-icon size="20"><Bell /></el-icon>
            <span class="header-title">通知收件箱</span>
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
  </div>
</template>

<script setup>
import CollectionToolbar from '@/components/CollectionToolbar.vue'
import { useCollectionSearch } from '@/composables/useCollectionSearch'
import PageHeading from '@/components/PageHeading.vue'
import { Bell } from '@element-plus/icons-vue'
import { useNotificationInbox } from '@/composables/useNotificationInbox'
import { getNotificationStyle, formatNotificationTime } from '@/utils/notificationDisplay'

const { notificationStore, handleRead, handleReadAll } = useNotificationInbox()


const { searchQuery, filteredRows } = useCollectionSearch(() => notificationStore.list, ['type', 'content'])
</script>
