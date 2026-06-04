import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref('okoko')
  const userInfo = ref({
    id: null,
    nickname: '',
    avatar: '',
    role: 'admin'   // 'admin' | 'vendor' | 'user'
  })
  const dynamicAdded = ref(false)

  const isLoggedIn = computed(() => !!token.value)

  function setLoginData(data) {
    token.value = data.token
    userInfo.value = {
      id: data.id,
      nickname: data.nickname,
      avatar: data.avatar,
      role: data.role
    }
  }

  function logout() {
    token.value = ''
    userInfo.value = {}
    dynamicAdded.value = false
  }

  return { token, userInfo, dynamicAdded, isLoggedIn, setLoginData, logout }
})