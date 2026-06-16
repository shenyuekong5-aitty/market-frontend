/**
 * 解码 JWT 并检查是否过期
 * @param {string} token - JWT token 字符串
 * @returns {boolean} true 表示已过期或无效
 */
export function isTokenExpired(token) {
  if (!token || typeof token !== 'string') return true
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    // JWT payload 在第二部分，base64url 格式
    const payload = parts[1]
    // base64url → base64 → 解码
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    const decoded = JSON.parse(json)
    // exp 是秒级时间戳，没有 exp 则不判定过期
    if (decoded.exp) {
      return Date.now() >= decoded.exp * 1000
    }
    return false
  } catch {
    return true
  }
}
