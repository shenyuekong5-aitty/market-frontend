// src/api/account.js
import request from '@/utils/request'

/**
 * 获取当前账户的安全检测报告
 * @returns {Promise}
 */
export function getSecurityCheck() {
  return request.get('/account/security-check')
}