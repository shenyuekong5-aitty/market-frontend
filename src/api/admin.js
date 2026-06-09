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
//集市
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

//摊位
// 获取集市下的摊位列表
export function getBoothsByMarketId(marketId) {
  return request.get('/admin/booths', { params: { marketId } })
}

// 创建摊位
export function createBooth(data) {
  return request.post('/admin/booths', data)
}

// 更新摊位
export function updateBooth(id, data) {
  return request.put(`/admin/booths/${id}`, data)
}

// 删除摊位
export function deleteBooth(id) {
  return request.delete(`/admin/booths/${id}`)
}

// 切换摊位状态
export function toggleBoothStatus(id) {
  return request.put(`/admin/booths/${id}/toggle-status`)
}

//收入
export function getAdminIncomeStats() {
  return request.get('/admin/income-stats')
}

//创建超级管理员
export function createAdmin(data) {
  return request.post('/admin/manage/create', data)
}

// 获取所有管理员列表（超级管理员专用）
export function listAdmins() {
  return request.get('/admin/manage/list')
}

// 切换管理员状态
export function toggleAdminStatus(adminId) {
  return request.put(`/admin/manage/${adminId}/toggle-status`)
}