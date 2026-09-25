import { getWebSocketOrigin } from '@/utils/runtimeConfig'

let ws = null
let notificationCallback = null
let currentUserId = null
let reconnectTimer = null

export function connectWebSocket(userId, onMessage) {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return
  const token = localStorage.getItem('token')
  if (!userId || !token) return

  currentUserId = userId
  notificationCallback = onMessage
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  const url = `${getWebSocketOrigin()}/ws/notification/${userId}?token=${encodeURIComponent(token)}`
  const socket = new WebSocket(url)
  ws = socket

  socket.onopen = () => {
    console.log('WebSocket 连接成功')
  }

  socket.onmessage = (event) => {
    if (event.data === 'new_notification' && notificationCallback) {
      notificationCallback()
    }
  }

  socket.onerror = (error) => {
    console.error('WebSocket 错误:', error)
  }

  socket.onclose = (event) => {
    if (ws !== socket) return
    ws = null
    if (!currentUserId || event.code === 1008) return
    console.info('WebSocket 连接关闭，5秒后重连...')
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      if (currentUserId && localStorage.getItem('token')) {
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
    const activeSocket = ws
    ws = null
    activeSocket.close()
  }
}
