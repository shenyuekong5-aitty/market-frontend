import request from '@/utils/request'

// 获取管理员自己的集市
export function getMyMarket() {
  return request.get('/admin/market/my')
}

// 获取待审批的摊位申请
export function getPendingApplies() {
  return request.get('/admin/applies/pending')
}