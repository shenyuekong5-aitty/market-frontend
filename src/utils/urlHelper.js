import { API_ORIGIN } from '@/utils/runtimeConfig'

/**
 * 将相对路径拼接为后端完整 URL
 * @param {string} url - 相对路径，如 /uploads/avatar/xxx.jpg
 * @returns {string} 完整 URL
 */
export function getFullUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${API_ORIGIN}${url}`
}
