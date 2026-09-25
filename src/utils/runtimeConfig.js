const configuredOrigin = (import.meta.env.VITE_API_ORIGIN || '').replace(/\/$/, '')

export const API_ORIGIN = configuredOrigin
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${API_ORIGIN}/api`

export function getWebSocketOrigin() {
  if (import.meta.env.VITE_WS_ORIGIN) {
    return import.meta.env.VITE_WS_ORIGIN.replace(/\/$/, '')
  }

  if (API_ORIGIN) {
    return API_ORIGIN.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:')
  }

  if (typeof window === 'undefined') return ''
  return `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
}
