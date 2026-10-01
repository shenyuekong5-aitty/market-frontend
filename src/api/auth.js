import request from '@/utils/request'

// 发送注册验证码
export function sendSms(phone) {
  return request.post('/sms/send', null, { params: { phone }, skipAuth: true })
}

// 注册
export function register(user, code) {
  return request.post('/auth/register', user, { params: { code }, skipAuth: true })
}

// 登录
export function login(username, password, role) {
  return request.post('/auth/login', null, { params: { username, password, role }, skipAuth: true })
}

// 获取当前用户信息
export function getCurrentUser() {
  return request.get('/auth/currentUser')
}
