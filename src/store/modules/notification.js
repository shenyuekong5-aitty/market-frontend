import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  // 通知列表（模拟数据）
  const notifications = ref([
    {
      id: 1,
      type: '预定请求',
      content: '用户 张三 预定了您的商品「苹果」，请及时处理',
      isRead: false,
      createTime: '2026-06-04 10:30:00'
    },
    {
      id: 2,
      type: '系统通知',
      content: '您的摊位申请已通过，请前往查看',
      isRead: true,
      createTime: '2026-06-03 14:20:00'
    }
  ])

  // 未读数量
  const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

  // 标记为已读
  function markAsRead(id) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) notification.isRead = true
  }

  // 全部标记为已读
  function markAllRead() {
    notifications.value.forEach(n => (n.isRead = true))
  }

  // 添加新通知（模拟后期 WebSocket 推送）
  function addNotification(notification) {
    notifications.value.unshift(notification)
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    addNotification
  }
})