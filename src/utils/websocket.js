let ws = null
let notificationCallback = null
let currentUserId = null

export function connectWebSocket(userId, onMessage) {
  if (ws && ws.readyState === WebSocket.OPEN) return
  currentUserId = userId
  notificationCallback = onMessage

  const url = `ws://localhost:8088/ws/notification/${userId}`
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
    setTimeout(() => {
      if (currentUserId) {
        connectWebSocket(currentUserId, notificationCallback)
      }
    }, 5000)
  }
}

export function disconnectWebSocket() {
  if (ws) {
    ws.close()
    ws = null
  }
}