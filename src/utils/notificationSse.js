import { API_BASE_URL } from '@/utils/runtimeConfig'

let abortController = null
let reconnectTimer = null
let active = false
let messageCallback = null

const scheduleReconnect = () => {
  if (!active || reconnectTimer) return
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    connectNotificationSse(messageCallback)
  }, 5000)
}

/**
 * 使用带 Authorization 请求头的 fetch 建立 SSE 连接。
 * 原生 EventSource 不能添加 Bearer Token，因此这里解析标准 SSE 数据流。
 */
export async function connectNotificationSse(onMessage) {
  if (abortController || !localStorage.getItem('token')) return

  active = true
  messageCallback = onMessage
  const controller = new AbortController()
  abortController = controller

  try {
    const response = await fetch(`${API_BASE_URL}/notifications/stream`, {
      headers: {
        Accept: 'text/event-stream',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      signal: controller.signal
    })

    if (!response.ok || !response.body) {
      throw new Error(`SSE 连接失败：${response.status}`)
    }

    console.info('已切换到 SSE 通知通道')
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (active && abortController === controller) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n')

      let boundary = buffer.indexOf('\n\n')
      while (boundary >= 0) {
        const block = buffer.slice(0, boundary)
        buffer = buffer.slice(boundary + 2)
        const eventName = block.split('\n').find(line => line.startsWith('event:'))?.slice(6).trim()
        const data = block.split('\n')
          .filter(line => line.startsWith('data:'))
          .map(line => line.slice(5).trimStart())
          .join('\n')

        if (eventName === 'notification' && data === 'new_notification') {
          messageCallback?.()
        }
        boundary = buffer.indexOf('\n\n')
      }
    }
  } catch (error) {
    if (error.name !== 'AbortError' && active) {
      console.warn('SSE 通知连接中断，将自动重连')
    }
  } finally {
    if (abortController === controller) abortController = null
    scheduleReconnect()
  }
}

export function disconnectNotificationSse() {
  active = false
  messageCallback = null
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  abortController?.abort()
  abortController = null
}
