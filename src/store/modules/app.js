import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 侧边栏折叠
  // 移动端默认收起侧栏，打开后由侧栏自身以抽屉形式展示。
  const sidebarCollapsed = ref(typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches)

  if (typeof window !== 'undefined') {
    // 只在跨越桌面/触屏布局边界时重置，保留同一档内用户手动展开的选择。
    window.matchMedia('(max-width: 1024px)').addEventListener('change', event => {
      sidebarCollapsed.value = event.matches
    })
  }

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
