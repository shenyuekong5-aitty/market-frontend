<template>
  <div class="booth-detail-page">
    <!-- 摊位信息 -->
    <el-card v-loading="store.boothLoading">
      <template #header>
        <div class="booth-header">
          <h3>{{ store.booth?.title || '加载中...' }}</h3>
          <el-tag :type="store.booth?.status === '空闲' ? 'success' : 'warning'">
            {{ store.booth?.status }}
          </el-tag>
        </div>
      </template>
      <div v-if="store.booth">
        <p><strong>主营：</strong>{{ store.booth.description || '未填写' }}</p>
        <p><strong>营业时间：</strong>{{ store.booth.openTime || '未设置' }}</p>
      </div>
    </el-card>

    <!-- 商品列表 -->
    <el-card class="product-list-card" v-loading="store.productLoading">
      <template #header>
        <span>在售商品（{{ store.productList.length }}）</span>
      </template>
      <el-table :data="store.productList" border style="width: 100%">
        <el-table-column label="图片" width="80">
          <template #default="{ row }">
            <el-image
              v-if="row.imageUrl"
              :src="getFullUrl(row.imageUrl)"
              fit="cover"
              style="width: 50px; height: 50px; border-radius: 4px;"
            />
            <span v-else style="color: #c0c4cc;">暂无</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="price" label="价格" />
        <el-table-column prop="stock" label="库存" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <div class="cart-action">
              <el-input-number
                v-model="store.quantities[row.id]"
                :min="1"
                :max="row.stock"
                size="small"
                style="width: 80px;"
              />
              <el-button
                type="primary"
                size="small"
                @click="handleAddToCart(row.id, store.quantities[row.id])"
              >
                加入购物车
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="store.productList.length === 0 && !store.productLoading" class="empty-tip">
        该摊位暂无上架商品
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserMarketStore } from '@/store/modules/userMarket'
import { ElMessage } from 'element-plus'
import { getFullUrl } from '@/utils/urlHelper'

const route = useRoute()
const boothId = Number(route.params.id)
const store = useUserMarketStore()

onMounted(async () => {
  try {
    await Promise.all([
      store.fetchBooth(boothId),
      store.fetchProducts(boothId)
    ])
  } catch (e) {
    ElMessage.error('加载摊位信息失败')
  }
})

const handleAddToCart = async (productId, quantity) => {
  try {
    await store.addProductToCart(productId, quantity)
    ElMessage.success('已加入购物车')
  } catch (e) {
    ElMessage.error(e.message || '添加失败')
  }
}
</script>

<style scoped>
.booth-detail-page {
  padding: 20px;
}
.booth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.product-list-card {
  margin-top: 20px;
}
.cart-action {
  display: flex;
  align-items: center;
  gap: 8px;
}
.empty-tip {
  text-align: center;
  color: #909399;
  padding: 40px;
}
</style>