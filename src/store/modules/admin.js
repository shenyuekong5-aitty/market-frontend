import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMyMarket, getPendingApplies, approveApply, rejectApply } from '@/api/admin'

export const useAdminStore = defineStore('admin', () => {
  const market = ref(null)
  const applyList = ref([])
  const loading = ref(false)

  async function fetchMarket() {
    const res = await getMyMarket()
    market.value = res.data
  }

  async function fetchApplies() {
    const res = await getPendingApplies()
    applyList.value = res.data
  }

  async function handleApprove(id) {
    await approveApply(id)
    await fetchApplies() // 刷新列表
  }

  async function handleReject(id) {
    await rejectApply(id)
    await fetchApplies()
  }

  async function refreshAll() {
    loading.value = true
    try {
      await Promise.all([fetchMarket(), fetchApplies()])
    } finally {
      loading.value = false
    }
  }

  return { market, applyList, loading, fetchMarket, fetchApplies, handleApprove, handleReject, refreshAll }
})