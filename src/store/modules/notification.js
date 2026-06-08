import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getNotifications, getUnreadCount, markAsRead, markAllRead } from '@/api/notification'

export const useNotificationStore = defineStore('notification', () => {
  const list = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)

  async function fetchNotifications() {
    loading.value = true
    try {
      const res = await getNotifications()
      list.value = res.data
      // 更新未读数
      unreadCount.value = list.value.filter(n => n.isRead === 0).length
    } finally {
      loading.value = false
    }
  }

  async function fetchUnreadCount() {
    try {
      const res = await getUnreadCount()
      unreadCount.value = res.data
    } catch (e) { /* 忽略 */ }
  }

  async function readNotification(id) {
    await markAsRead(id)
    await fetchNotifications()
  }

  async function readAll() {
    await markAllRead()
    await fetchNotifications()
  }

  return { list, unreadCount, loading, fetchNotifications, fetchUnreadCount, readNotification, readAll }
})