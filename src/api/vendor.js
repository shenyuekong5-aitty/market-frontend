import request from '@/utils/request'

// 获取所有启用状态的集市
export function getEnabledMarkets() {
  return request.get('/vendor/markets')
}

// 获取指定集市下的空闲摊位
export function getFreeBooths(marketId) {
  return request.get(`/vendor/markets/${marketId}/booths`)
}

// 提交入住申请
export function applyForBooth(boothId) {
  return request.post('/vendor/applies', null, { params: { boothId } })
}

// 获取当前小贩自己的摊位信息
export function getMyBooth() {
  return request.get('/vendor/booth/my')
}

// 更新当前小贩的摊位信息
export function updateMyBooth(data) {
  return request.put('/vendor/booth/my', data)
}