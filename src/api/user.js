// src/api/user.js
import request from '@/utils/request'

/**
 * 上传头像文件
 * @param {FormData} formData - 包含 file 字段的 FormData
 * @returns {Promise} 返回 { code, data, message }，data 为上传后的文件路径
 */
export function uploadAvatar(formData) {
  return request.post('/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 修改用户资料（昵称、头像、性别、手机号等）
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export function updateProfile(data) {
  return request.put('/user/profile', data)
}

/**
 * 发送更换手机号的验证码（可选）
 * @param {String} phone
 * @returns {Promise}
 */
export function sendChangePhoneSms(phone) {
  return request.post('/sms/send-change-phone', null, { params: { phone } })
}
