import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMyMarket, getPendingApplies } from '@/api/admin'

export const useAdminStore = defineStore('admin', () => {
  // 当前管理员管理的集市
  const market = ref(null)
  // 待审批的摊位申请列表
  const applyList = ref([])
  // 加载状态
  const loading = ref(false)

  // 获取集市信息
  async function fetchMarket() {
    try {
      const res = await getMyMarket()
      market.value = res.data
      return res.data
    } catch (error) {
      console.error('获取集市信息失败', error)
      throw error
    }
  }

  // 获取待审批申请
  async function fetchApplies() {
    try {
      const res = await getPendingApplies()
      applyList.value = res.data
      return res.data
    } catch (error) {
      console.error('获取申请列表失败', error)
      throw error
    }
  }

  // 刷新所有数据
  async function refreshAll() {
    loading.value = true
    try {
      await Promise.all([fetchMarket(), fetchApplies()])
    } finally {
      loading.value = false
    }
  }

  return {
    market,
    applyList,
    loading,
    fetchMarket,
    fetchApplies,
    refreshAll
  }
})