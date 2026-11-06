// 从环境变量中读取 API 源地址，如果没有配置则用空字符串
// 然后去掉末尾的斜杠，避免后续拼接路径时出现双斜杠
const configuredOrigin = (import.meta.env.VITE_API_ORIGIN || '').replace(/\/$/, '')

// API 源地址，例如 https://api.example.com
export const API_ORIGIN = configuredOrigin

// API 基础路径，优先使用环境变量 VITE_API_BASE_URL
// 如果没有配置，则用 API_ORIGIN + "/api" 作为默认值
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${API_ORIGIN}/api`

/**
 * 获取 WebSocket 的源地址
 * 按优先级依次尝试三种方式：
 * 1. 直接使用环境变量 VITE_WS_ORIGIN
 * 2. 根据 API_ORIGIN 推导（把 http 换成 ws，https 换成 wss）
 * 3. 根据当前浏览器页面的地址推导
 */
export function getWebSocketOrigin() {
  // 方式一：如果配置了 VITE_WS_ORIGIN，直接使用并去掉末尾斜杠
  if (import.meta.env.VITE_WS_ORIGIN) {
    return import.meta.env.VITE_WS_ORIGIN.replace(/\/$/, '')
  }

  // 方式二：如果有 API_ORIGIN，把协议替换成 WebSocket 对应的协议
  if (API_ORIGIN) {
    return API_ORIGIN.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:')
  }

  // 方式三：兼容 SSR，服务端没有 window 对象时返回空字符串
  if (typeof window === 'undefined') return ''

  // 根据当前页面的协议和主机名推导 WebSocket 地址
  // HTTPS 页面用 wss，HTTP 页面用 ws
  return `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
}