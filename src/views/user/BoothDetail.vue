<template>
  <div class="booth-detail-page">
    <!-- 摊位信息卡片 -->
    <el-card class="booth-card" v-loading="store.boothLoading">
      <div class="booth-header">
        <div class="booth-avatar">
          <el-icon size="48"><Shop /></el-icon>
        </div>
        <div class="booth-info">
          <h2>{{ store.booth?.title || '加载中...' }}</h2>
          <p class="booth-desc">{{ store.booth?.description || '暂无描述' }}</p>
          <div class="booth-meta">
            <span><el-icon><Clock /></el-icon> {{ store.booth?.openTime || '营业时间未设置' }}</span>
            <el-tag :type="store.booth?.status === '空闲' ? 'success' : 'warning'" size="small">
              {{ store.booth?.status }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 商品列表标题 -->
    <div class="section-title">
      <h3>在售商品（{{ store.productList.length }}）</h3>
      <el-divider />
    </div>

    <!-- 商品卡片网格 -->
    <div v-if="store.productList.length > 0" class="product-grid">
      <el-row :gutter="20">
        <el-col
          v-for="product in store.productList"
          :key="product.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <el-card class="product-card" shadow="hover">
            <div class="product-image">
              <el-image
                v-if="product.imageUrl"
                :src="getFullUrl(product.imageUrl)"
                fit="cover"
                class="image"
              />
              <div v-else class="image-placeholder">
                <el-icon size="32"><PictureFilled /></el-icon>
              </div>
            </div>
            <div class="product-info">
              <h4>{{ product.name }}</h4>
              <div class="price">¥{{ product.price }}</div>
              <div class="stock">库存：{{ product.stock }}</div>
            </div>
            <div class="product-actions">
              <div class="cart-action">
                <el-input-number
                  v-model="store.quantities[product.id]"
                  :min="1"
                  :max="product.stock"
                  size="small"
                  class="quantity-input"
                />
                <el-button type="primary" size="small" @click="handleAddToCart(product.id, store.quantities[product.id])">
                  加入购物车
                </el-button>
              </div>
              <el-button
                v-if="product.canReserve === 1"
                size="small"
                class="reserve-btn"
                @click="openReserveDialog(product.id)"
              >
                预定
              </el-button>
              <!-- 占位元素，保证卡片高度一致 -->
              <div v-else class="reserve-placeholder"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!store.productLoading" class="empty-container">
      <el-empty description="该摊位暂无上架商品" />
    </div>

    <!-- 预定时间弹窗 -->
    <el-dialog v-model="reserveVisible" title="预定商品" width="450px">
      <div style="margin-bottom: 15px; color: #606266;">
        <el-icon><InfoFilled /></el-icon>
        本次预定数量固定为 <strong>1 个</strong>，如需多个请分次预定。
      </div>
      <el-form label-width="80px">
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="reserveStartTime"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="reserveEndTime"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reserveVisible = false">取消</el-button>
        <el-button type="primary" @click="handleReserve">提交预定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserMarketStore } from '@/store/modules/userMarket'
import { ElMessage } from 'element-plus'
import { InfoFilled, Shop, Clock, PictureFilled } from '@element-plus/icons-vue'
import { getFullUrl } from '@/utils/urlHelper'
import { submitReservation } from '@/api/user'

const route = useRoute()
const boothId = Number(route.params.id)
const store = useUserMarketStore()

const reserveVisible = ref(false)
const reserveProductId = ref(null)
const reserveStartTime = ref('')
const reserveEndTime = ref('')

onMounted(async () => {
  try {
    await Promise.all([store.fetchBooth(boothId), store.fetchProducts(boothId)])
  } catch (e) {
    ElMessage.error('加载摊位信息失败')
  }
})

const handleAddToCart = async (productId, quantity) => {
  try {
    await store.addProductToCart(productId, quantity)
    ElMessage.success('已加入购物车')
    store.quantities[productId] = 1
  } catch (e) {
    ElMessage.error(e.message || '添加失败')
  }
}

const openReserveDialog = (productId) => {
  reserveProductId.value = productId
  reserveStartTime.value = ''
  reserveEndTime.value = ''
  reserveVisible.value = true
}

const handleReserve = async () => {
  if (!reserveStartTime.value || !reserveEndTime.value) {
    ElMessage.warning('请选择时间段')
    return
  }
  if (new Date(reserveStartTime.value) >= new Date(reserveEndTime.value)) {
    ElMessage.warning('结束时间必须大于开始时间')
    return
  }
  try {
    await submitReservation(reserveProductId.value, reserveStartTime.value, reserveEndTime.value)
    ElMessage.success('预定已提交，请等待摊主确认')
    reserveVisible.value = false
  } catch (e) {
    ElMessage.error(e.message || '预定失败')
  }
}
</script>

<style scoped>
.booth-detail-page {
  padding: 20px;
}

.booth-card {
  margin-bottom: 24px;
}

.booth-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.booth-avatar {
  width: 80px;
  height: 80px;
  background: #f5f7fa;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
}

.booth-info h2 {
  margin: 0 0 8px 0;
  font-size: 22px;
  color: #303133;
}

.booth-desc {
  color: #909399;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.booth-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #606266;
}

.section-title {
  margin: 8px 0 16px;
}

.section-title h3 {
  margin: 0;
  font-size: 18px;
}

.product-grid {
  margin-bottom: 20px;
}

.product-card {
  margin-bottom: 20px;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.product-image {
  height: 180px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 12px;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
}

.product-info {
  flex: 1;
}

.product-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
  margin-bottom: 4px;
}

.stock {
  font-size: 12px;
  color: #909399;
  margin-bottom: 12px;
}

.product-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 68px;
}

.cart-action {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-input {
  width: 80px;
}

.reserve-btn {
  width: 100%;
  background: #ecf5ff;
  border-color: #b3d8ff;
  color: #409eff;
}

.reserve-btn:hover {
  background: #d9ecff;
  border-color: #a0cfff;
}

.reserve-btn:active {
  background: #b3d8ff;
}

.reserve-placeholder {
  height: 32px;
}

.empty-container {
  margin-top: 40px;
}

@media (max-width: 767px) {
  .booth-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>