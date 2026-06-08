import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import {
  getBoothById,
  getProductsByBoothId,
  addToCart,
  getCartList,
  updateCartQuantity,
  removeFromCart,
  clearCart
} from '@/api/user'

export const useUserMarketStore = defineStore('userMarket', () => {
  // ---------- 摊位与商品 ----------
  const booth = ref(null)
  const productList = ref([])
  const boothLoading = ref(false)
  const productLoading = ref(false)

  // 每个商品的数量 (key: productId, value: quantity)
  const quantities = reactive({})

  async function fetchBooth(boothId) {
    boothLoading.value = true
    try {
      const res = await getBoothById(boothId)
      booth.value = res.data
    } catch (e) {
      console.error('获取摊位信息失败', e)
      throw e
    } finally {
      boothLoading.value = false
    }
  }

  async function fetchProducts(boothId) {
    productLoading.value = true
    try {
      const res = await getProductsByBoothId(boothId)
      productList.value = res.data
      // 初始化数量
      productList.value.forEach(p => {
        if (!quantities[p.id]) quantities[p.id] = 1
      })
    } catch (e) {
      console.error('获取商品列表失败', e)
      throw e
    } finally {
      productLoading.value = false
    }
  }

  // ---------- 购物车 ----------
  const cartList = ref([])
  const cartLoading = ref(false)

  async function fetchCart() {
    cartLoading.value = true
    try {
      const res = await getCartList()
      cartList.value = res.data
    } catch (e) {
      console.error('获取购物车失败', e)
      throw e
    } finally {
      cartLoading.value = false
    }
  }

  async function addProductToCart(productId, quantity) {
    await addToCart(productId, quantity)
    // 添加后可以选择刷新购物车数量显示，这里暂不刷新列表
  }

  async function changeCartQuantity(cartId, quantity) {
    await updateCartQuantity(cartId, quantity)
    await fetchCart()
  }

  async function deleteCartItem(cartId) {
    await removeFromCart(cartId)
    await fetchCart()
  }

  async function emptyCart() {
    await clearCart()
    await fetchCart()
  }

  return {
    booth,
    productList,
    boothLoading,
    productLoading,
    quantities,
    fetchBooth,
    fetchProducts,
    cartList,
    cartLoading,
    fetchCart,
    addProductToCart,
    changeCartQuantity,
    deleteCartItem,
    emptyCart
  }
})