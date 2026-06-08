import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getMyBooth,
  updateMyBooth,
  applyForBooth,
  getMyProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  uploadProductImage
} from '@/api/vendor'

export const useVendorStore = defineStore('vendor', () => {
  // ========== 摊位 ==========
  const myBooth = ref(null)
  const boothLoading = ref(false)

  async function fetchMyBooth() {
    boothLoading.value = true
    try {
      const res = await getMyBooth()
      myBooth.value = res.data
    } catch (e) {
      console.error('获取摊位失败', e)
      throw e
    } finally {
      boothLoading.value = false
    }
  }

  async function saveMyBooth(data) {
    await updateMyBooth(data)
    await fetchMyBooth()
  }

  async function submitBoothApplication(boothId) {
    await applyForBooth(boothId)
  }

  // ========== 商品 ==========
  const productList = ref([])
  const productLoading = ref(false)

  async function fetchProducts() {
    productLoading.value = true
    try {
      const res = await getMyProducts()
      productList.value = res.data
    } catch (e) {
      console.error('获取商品列表失败', e)
      throw e
    } finally {
      productLoading.value = false
    }
  }

  async function createProduct(data) {
    const res = await addProduct(data)
    await fetchProducts()
    return res
  }

  async function editProduct(id, data) {
    await updateProduct(id, data)
    await fetchProducts()
  }

  async function removeProduct(id) {
    await deleteProduct(id)
    await fetchProducts()
  }

  async function switchProductStatus(id) {
    await toggleProductStatus(id)
    await fetchProducts()
  }

  async function uploadProductImg(formData) {
    const res = await uploadProductImage(formData)
    return res.data
  }

  // ========== 初始化 ==========
  async function init() {
    await fetchMyBooth()
    await fetchProducts()
  }

  return {
    // 摊位
    myBooth,
    boothLoading,
    fetchMyBooth,
    saveMyBooth,
    submitBoothApplication,
    // 商品
    productList,
    productLoading,
    fetchProducts,
    createProduct,
    editProduct,
    removeProduct,
    switchProductStatus,
    uploadProductImg,
    // 初始化
    init
  }
})