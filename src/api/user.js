import request from '@/utils/request'

// 修改用户资料
export function updateProfile(data) {
  return request.put('/user/profile', data)
}

// 发送修改手机号的验证码
export function sendChangePhoneSms(phone) {
  return request.post('/sms/send-change-phone', null, { params: { phone } })
}