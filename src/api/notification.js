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

// 管理员发送通知
export function sendNotification(role, content) {
  return request.post('/admin/notifications/send', null, { params: { role, content } })
}