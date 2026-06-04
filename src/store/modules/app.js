import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 侧边栏折叠
  const sidebarCollapsed = ref(false)

  // 暗黑模式（从 localStorage 读取，默认跟随系统？这里简化默认白天）
  const isDark = ref(localStorage.getItem('theme') === 'dark')

  // 应用暗黑模式到 document
  function applyDarkMode() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }
  // 初始化时调用一次
  applyDarkMode()

  function toggleDarkMode() {
    isDark.value = !isDark.value
    applyDarkMode()
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function refresh() {
    window.location.reload()
  }

  return {
    sidebarCollapsed,
    isDark,
    toggleSidebar,
    toggleDarkMode,
    refresh
  }
})