import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMyBooth, updateMyBooth, applyForBooth } from '@/api/vendor'

export const useVendorStore = defineStore('vendor', () => {
  const myBooth = ref(null)
  const saving = ref(false)

  // 获取我的摊位
  async function fetchMyBooth() {
    try {
      const res = await getMyBooth()
      myBooth.value = res.data
    } catch (e) {
      console.error('获取我的摊位失败', e)
      throw e
    }
  }

  // 更新我的摊位信息
  async function saveMyBooth(data) {
    saving.value = true
    try {
      await updateMyBooth(data)
      await fetchMyBooth() // 刷新
    } finally {
      saving.value = false
    }
  }

  // 申请摊位
  async function submitBoothApplication(boothId) {
    await applyForBooth(boothId)
  }

  return {
    myBooth,
    saving,
    fetchMyBooth,
    saveMyBooth,
    submitBoothApplication
  }
})