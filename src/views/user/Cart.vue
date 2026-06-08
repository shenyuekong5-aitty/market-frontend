<template>
  <div class="cart-page">
    <el-card>
      <template #header>
        <div class="cart-header">
          <span>我的购物车（{{ store.cartList.length }} 件商品）</span>
          <div>
            <el-button type="danger" size="small" :disabled="store.cartList.length === 0" @click="handleClear">清空购物车</el-button>
            <el-button type="primary" size="small" :disabled="store.cartList.length === 0" @click="handleCheckout">去结算</el-button>
          </div>
        </div>
      </template>

      <el-table :data="store.cartList" border style="width: 100%" v-loading="store.cartLoading">
        <el-table-column prop="productId" label="商品ID" width="80" />
        <el-table-column label="数量" width="150">
          <template #default="{ row }">
            <el-input-number v-model="row.quantity" :min="1" size="small" @change="(val) => handleQuantityChange(row.id, val)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserMarketStore } from '@/store/modules/userMarket'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const store = useUserMarketStore()
const router = useRouter()

onMounted(async () => {
  try {
    await store.fetchCart()
  } catch (e) {
    ElMessage.error('获取购物车失败')
  }
})

const handleQuantityChange = (cartId, quantity) => {
  store.changeCartQuantity(cartId, quantity)
}

const handleDelete = (cartId) => {
  ElMessageBox.confirm('确定要移除该商品吗？', '提示', { type: 'warning' }).then(async () => {
    try {
      await store.deleteCartItem(cartId)
      ElMessage.success('已移除')
    } catch (e) {
      ElMessage.error(e.message || '移除失败')
    }
  })
}

const handleClear = () => {
  ElMessageBox.confirm('确定要清空购物车吗？', '提示', { type: 'warning' }).then(async () => {
    try {
      await store.emptyCart()
      ElMessage.success('购物车已清空')
    } catch (e) {
      ElMessage.error(e.message || '清空失败')
    }
  })
}

const handleCheckout = async () => {
  ElMessageBox.confirm('确认要结算购物车中的商品吗？', '生成订单', { type: 'info' }).then(async () => {
    try {
      const orders = await store.submitCartToOrder()
      ElMessage.success(`订单已生成，共 ${orders.length} 个订单，请前往我的订单查看`)
      router.push('/orders')
    } catch (e) {
      ElMessage.error(e.message || '生成订单失败')
    }
  })
}
</script>

<style scoped>
.cart-page { padding: 20px; }
.cart-header { display: flex; justify-content: space-between; align-items: center; }
</style>