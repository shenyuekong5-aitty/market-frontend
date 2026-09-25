import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 侧边栏折叠
  // 移动端默认收起侧栏，打开后由侧栏自身以抽屉形式展示。
  const sidebarCollapsed = ref(typeof window !== 'undefined' && window.innerWidth <= 768)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function refresh() {
    window.location.reload()
  }

  return {
    sidebarCollapsed,
    toggleSidebar,
    refresh
  }
})
