// src/api/auth.js
import request from '@/utils/request'

// 发送验证码
export function sendSms(phone) {
  return request.post('/sms/send', null, { params: { phone } })
}

// 注册
export function register(user, code) {
  return request.post('/auth/register', user, { params: { code } })
}

// 登录
export function login(username, password, role) {
  return request.post('/auth/login', null, {
    params: { username, password, role }
  })
}

// 获取当前用户信息
export function getCurrentUser() {
  return request.get('/auth/currentUser')
}



// 发送忘记密码验证码
export function sendResetPasswordSms(phone) {
  return request.post('/sms/send-reset', null, { params: { phone } })
}

// 重置密码
export function resetPassword(phone, code, newPassword) {
  return request.post('/auth/reset-password', null, {
    params: { phone, code, newPassword }
  })
}

// 检查手机号是否已注册
export function checkPhone(phone) {
  return request.get('/auth/check-phone', { params: { phone } })
}

// 修改密码（已登录状态下）
export function changePassword(oldPassword, newPassword) {
  return request.put('/auth/change-password', null, {
    params: { oldPassword, newPassword }
  })
}