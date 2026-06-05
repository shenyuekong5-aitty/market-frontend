import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, getCurrentUser  } from '@/api/auth'  

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(
    JSON.parse(localStorage.getItem('userInfo') || '{"id":null,"phone":"","username":"","nickname":"","avatar":"","role":"","status":1}')
  )
  const dynamicAdded = ref(false)

  const isLoggedIn = computed(() => !!token.value)

  // 登录
  async function login(username, password, role) {
    const res = await loginApi(username, password, role)  
    const data = res.data  
    setLoginData({
      token: data,
      username,
      role,
      nickname: username,  
      avatar: '',
      id: null
    })
    //获取用户完整信息
    await fetchCurrentUser()
  }

  // 获取当前用户完整信息
async function fetchCurrentUser() {
  try {
    const res = await getCurrentUser()
    if (res.data) {
      userInfo.value = {
        id: res.data.id,
        phone: res.data.phone || '',
        username: res.data.username,
        nickname: res.data.nickname || res.data.username,
        avatar: res.data.avatar || '',
        role: res.data.role,
        status: res.data.status
      }
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
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
    login,          
    fetchCurrentUser,
    setLoginData,
    logout,
    // updateProfile,
    // changePassword,
  }
})