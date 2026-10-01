import { onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useNotificationStore } from '@/store/modules/notification'

export function useNotificationInbox() {
  const notificationStore = useNotificationStore()

  onMounted(async () => {
    try {
      await notificationStore.fetchNotifications()
    } catch {
      ElMessage.error('获取消息失败')
    }
  })

  watch(() => notificationStore.unreadCount, () => {
    notificationStore.fetchNotifications().catch(() => {})
  })

  return {
    notificationStore,
    handleRead: (id) => notificationStore.readNotification(id),
    handleReadAll: () => notificationStore.readAll(),
  }
}
