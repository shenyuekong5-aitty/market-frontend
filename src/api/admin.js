import request from '@/utils/request'

export function getMyMarket() {
  return request.get('/admin/market/my')
}

export function getPendingApplies() {
  return request.get('/admin/applies/pending')
}

export function approveApply(id) {
  return request.put(`/admin/applies/${id}/approve`)
}

export function rejectApply(id) {
  return request.put(`/admin/applies/${id}/reject`)
}

//日志
export function getOperationLogs(start, end) {
  return request.get('/admin/operation-logs', { params: { start, end } })
}
//市场
export function createMarket(data) {
  return request.post('/admin/market', data)
}

// 更新集市
export function updateMarket(id, data) {
  return request.put(`/admin/market/${id}`, data)
}

// 切换集市状态（启用/停用）
export function toggleMarketStatus(id) {
  return request.put(`/admin/market/${id}/toggle-status`)
}