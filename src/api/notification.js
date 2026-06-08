import request from '@/utils/request'

export function getNotifications() {
  return request.get('/notifications')
}

export function getUnreadCount() {
  return request.get('/notifications/unread-count')
}

export function markAsRead(id) {
  return request.put(`/notifications/${id}/read`)
}

export function markAllRead() {
  return request.put('/notifications/read-all')
}