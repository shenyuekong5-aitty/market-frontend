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