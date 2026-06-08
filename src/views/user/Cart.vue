<template>
  <div class="cart-page">
    <el-card>
      <template #header>
        <div class="cart-header">
          <span>购物车（{{ store.cartList.length }} 件商品）</span>
          <el-button type="danger" size="small" :disabled="store.cartList.length === 0" @click="handleClear">
            清空购物车
          </el-button>
        </div>
      </template>

      <!-- 空购物车提示 -->
      <div v-if="store.cartList.length === 0 && !store.cartLoading" class="empty-cart">
        <el-empty description="购物车是空的">
          <el-button type="primary" @click="$router.push('/markets')">去逛逛集市</el-button>
        </el-empty>
      </div>

      <!-- 购物车列表 -->
      <div v-else>
        <el-table :data="store.cartList" border style="width: 100%" v-loading="store.cartLoading">
          <el-table-column label="商品图片" width="80">
            <template #default="{ row }">
              <el-image
                v-if="row.productImageUrl"
                :src="getFullUrl(row.productImageUrl)"
                fit="cover"
                style="width: 50px; height: 50px; border-radius: 4px;"
              />
              <span v-else style="color: #c0c4cc;">暂无</span>
            </template>
          </el-table-column>
          <el-table-column prop="productName" label="商品名称" />
          <el-table-column prop="productPrice" label="单价" />
          <el-table-column label="数量" width="170">
            <template #default="{ row }">
              <el-input-number
                v-model="row.quantity"
                :min="1"
                :max="row.stock"
                size="small"
                @change="(val) => handleQuantityChange(row.cartId, val)"
              />
            </template>
          </el-table-column>
          <el-table-column label="小计" width="100">
            <template #default="{ row }">
              ¥{{ (row.productPrice * row.quantity).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ row }">
              <el-button type="danger" size="small" @click="handleDelete(row.cartId)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 底部合计 -->
        <div class="cart-footer">
          <div class="total-price">
            合计：<span class="price">¥{{ totalPrice }}</span>
          </div>
          <div class="actions">
            <el-button type="primary" size="large" :disabled="store.cartList.length === 0" @click="handleCheckout">
              去结算
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserMarketStore } from '@/store/modules/userMarket'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFullUrl } from '@/utils/urlHelper'

const router = useRouter()
const store = useUserMarketStore()

onMounted(async () => {
  try {
    await store.fetchCart()
  } catch (e) {
    ElMessage.error('获取购物车失败')
  }
})

// 计算总价
const totalPrice = computed(() => {
  return store.cartList.reduce((sum, item) => {
    return sum + (item.productPrice || 0) * (item.quantity || 0)
  }, 0).toFixed(2)
})

// 修改数量
const handleQuantityChange = (cartId, quantity) => {
  store.changeCartQuantity(cartId, quantity)
}

// 删除单个
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

//提交订单
const handleCheckout = async () => {
  try {
    await ElMessageBox.confirm('确认生成订单吗？', '提示', { type: 'info' })
    await store.submitCartToOrder()
    ElMessage.success('订单已生成')
    router.push('/orders')
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error(e.message || '下单失败')
    }
  }
}

// 清空购物车
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
</script>

<style scoped>
.cart-page {
  padding: 20px;
}
.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.empty-cart {
  text-align: center;
  padding: 40px;
}
.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}
.total-price {
  font-size: 18px;
  color: #303133;
}
.price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 22px;
}
</style>