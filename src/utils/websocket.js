import { getWebSocketOrigin } from '@/utils/runtimeConfig'

let ws = null
let notificationCallback = null
let currentUserId = null
let reconnectTimer = null

export function connectWebSocket(userId, onMessage) {
  if (ws && ws.readyState === WebSocket.OPEN) return
  const token = localStorage.getItem('token')
  if (!userId || !token) return

  currentUserId = userId
  notificationCallback = onMessage

  const url = `${getWebSocketOrigin()}/ws/notification/${userId}?token=${encodeURIComponent(token)}`
  ws = new WebSocket(url)

  ws.onopen = () => {
    console.log('WebSocket 连接成功')
  }

  ws.onmessage = (event) => {
    if (event.data === 'new_notification' && notificationCallback) {
      notificationCallback()
    }
  }

  ws.onerror = (error) => {
    console.error('WebSocket 错误:', error)
  }

  ws.onclose = () => {
    console.log('WebSocket 连接关闭，5秒后重连...')
    reconnectTimer = setTimeout(() => {
      if (currentUserId) {
        connectWebSocket(currentUserId, notificationCallback)
      }
    }, 5000)
  }
}

export function disconnectWebSocket() {
  currentUserId = null
  notificationCallback = null
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (ws) {
    ws.close()
    ws = null
  }
}
