import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref('okoko')
  const userInfo = ref({
    id: 1,
    phone: '13800000001',
    username: 'admin',
    nickname: '管理员小明',
    avatar: 'https://s.snappable.media/cf94acf070e3d9677f108f741cb424d7.png',
    role: 'admin',   // 'admin' | 'vendor' | 'user'
    status: 1        // 1正常 0注销
  })
  const dynamicAdded = ref(false)

  const isLoggedIn = computed(() => !!token.value)

  function setLoginData(data) {
    token.value = data.token
    userInfo.value = {
      id: data.id,
      phone: data.phone || '',
      username: data.username || '',
      nickname: data.nickname,
      avatar: data.avatar,
      role: data.role,
      status: data.status !== undefined ? data.status : 1
    }
  }

  function logout() {
    token.value = ''
    userInfo.value = {
      id: null,
      phone: '',
      username: '',
      nickname: '',
      avatar: '',
      role: '',
      status: 1
    }
    dynamicAdded.value = false
  }

  // 更新资料
  function updateProfile(data) {
    Object.assign(userInfo.value, data)
  }

  // 修改密码（模拟接口）
  async function changePassword({ oldPassword, newPassword }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`密码修改成功：旧密码=${oldPassword}, 新密码=${newPassword}`)
        resolve({ success: true })
      }, 300)
    })
  }

  return { token, userInfo, dynamicAdded, isLoggedIn, setLoginData, logout, updateProfile, changePassword }
})