import request from '@/utils/request'

// 上传头像
export function uploadAvatar(formData) {
  return request.post('/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 修改用户资料
export function updateProfile(data) {
  return request.put('/user/profile', data)
}

// 发送修改手机号验证码
export function sendChangePhoneSms(phone) {
  return request.post('/sms/send-change-phone', null, { params: { phone } })
}

// 发送忘记密码验证码
export function sendResetPasswordSms(phone) {
  return request.post('/sms/send-reset', null, { params: { phone } })
}

// 重置密码（忘记密码）
export function resetPassword(phone, code, newPassword) {
  return request.post('/auth/reset-password', null, { params: { phone, code, newPassword } })
}

// 检查手机号是否已注册
export function checkPhone(phone) {
  return request.get('/auth/check-phone', { params: { phone } })
}

// 修改密码（已登录）
export function changePassword(oldPassword, newPassword) {
  return request.put('/auth/change-password', null, { params: { oldPassword, newPassword } })
}

// 注销账号
export function deactivateAccount() {
  return request.post('/user/deactivate')
}

//购物相关
// 根据摊位ID获取摊位信息
export function getBoothById(boothId) {
  return request.get(`/user/booths/${boothId}`)
}

// 获取摊位下的上架商品
export function getProductsByBoothId(boothId) {
  return request.get('/user/products', { params: { boothId } })
}

// 加入购物车
export function addToCart(productId, quantity) {
  return request.post('/user/cart/add', null, { params: { productId, quantity } })
}

// 获取购物车列表
export function getCartList() {
  return request.get('/user/cart')
}

// 修改购物车商品数量
export function updateCartQuantity(cartId, quantity) {
  return request.put(`/user/cart/${cartId}/quantity`, null, { params: { quantity } })
}

// 删除购物车商品
export function removeFromCart(cartId) {
  return request.delete(`/user/cart/${cartId}`)
}

// 清空购物车
export function clearCart() {
  return request.delete('/user/cart/clear')
}