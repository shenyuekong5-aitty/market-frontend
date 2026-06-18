import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 侧边栏折叠
  const sidebarCollapsed = ref(false)


  function toggleDarkMode() {
    isDark.value = !isDark.value
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