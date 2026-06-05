import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi } from '@/api/auth'   // 导入登录 API

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(
    JSON.parse(localStorage.getItem('userInfo') || '{"id":null,"phone":"","username":"","nickname":"","avatar":"","role":"","status":1}')
  )
  const dynamicAdded = ref(false)

  const isLoggedIn = computed(() => !!token.value)

  // 登录
  async function login(username, password, role) {
    const res = await loginApi(username, password, role)  // 调用 API 层
    const data = res.data  // 后端返回 token 字符串
    setLoginData({
      token: data,
      username,
      role,
      nickname: username,  // 暂时用账号作为昵称
      avatar: '',
      id: null
    })
  }

  function setLoginData(data) {
    token.value = data.token
    userInfo.value = {
      id: data.id || null,
      phone: data.phone || '',
      username: data.username || '',
      nickname: data.nickname || data.username || '',
      avatar: data.avatar || '',
      role: data.role || '',
      status: data.status !== undefined ? data.status : 1
    }
    // 持久化
    localStorage.setItem('token', token.value)
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  }

  function logout() {
    token.value = ''
    userInfo.value = {}
    dynamicAdded.value = false
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    window.location.href = '/login'
  }

  // ... 其他方法 updateProfile、changePassword 暂时保留模拟 ...

  return {
    token,
    userInfo,
    dynamicAdded,
    isLoggedIn,
    login,          // 暴露真实的登录方法
    setLoginData,
    logout,
    // updateProfile,
    // changePassword,
  }
})