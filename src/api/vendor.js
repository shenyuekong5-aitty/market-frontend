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

//所有摊位
export function getAllBooths(marketId) {
  return request.get(`/vendor/markets/${marketId}/all-booths`)
}

//商品相关的
// 获取我的所有商品
export function getMyProducts() {
  return request.get('/vendor/products')
}

// 新增商品
export function addProduct(data) {
  return request.post('/vendor/products', data)
}

// 更新商品
export function updateProduct(id, data) {
  return request.put(`/vendor/products/${id}`, data)
}

// 删除商品
export function deleteProduct(id) {
  return request.delete(`/vendor/products/${id}`)
}

// 上架/下架商品
export function toggleProductStatus(id) {
  return request.put(`/vendor/products/${id}/toggle-status`)
}

// 上传商品图片
export function uploadProductImage(formData) {
  return request.post('/upload/product-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 预定相关
// 获取摊主的预定列表
export function getVendorReservations() {
  return request.get('/vendor/reservations')
}

// 确认预定
export function confirmReservation(id) {
  return request.put(`/vendor/reservations/${id}/confirm`)
}

// 拒绝预定
export function rejectReservation(id) {
  return request.put(`/vendor/reservations/${id}/reject`)
}

// 获取订单明细（小贩端，复用用户端的接口）
export function getOrderItems(orderId) {
  return request.get(`/user/orders/${orderId}/items`)
}

export function getVendorOrders() {
    return request.get("/vendor/orders");
  }
