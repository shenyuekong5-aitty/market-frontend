import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // 购物车商品列表，每项格式：{ goodsId, name, price, quantity, boothId, image }
  const items = ref([])

  // 商品总数
  const totalCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  // 总价
  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  // 添加商品到购物车（模拟）
  function addToCart(goods) {
    const existing = items.value.find(item => item.goodsId === goods.goodsId)
    if (existing) {
      existing.quantity += 1
    } else {
      items.value.push({ ...goods, quantity: 1 })
    }
  }

  // 移除商品
  function removeFromCart(goodsId) {
    items.value = items.value.filter(item => item.goodsId !== goodsId)
  }

  // 修改数量
  function updateQuantity(goodsId, quantity) {
    const item = items.value.find(item => item.goodsId === goodsId)
    if (item && quantity > 0) {
      item.quantity = quantity
    } else if (item && quantity <= 0) {
      removeFromCart(goodsId)
    }
  }

  // 清空购物车
  function clearCart() {
    items.value = []
  }

  return {
    items,
    totalCount,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  }
})