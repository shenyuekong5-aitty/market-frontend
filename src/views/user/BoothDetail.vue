<template>
  <div class="booth-detail-page">
    <!-- 摊位信息卡片 -->
    <UiCard class="booth-card" v-loading="store.boothLoading">
      <template #header>
        <div class="booth-header">
          <div class="header-left">
            <h3>{{ store.booth?.title || "加载中..." }}</h3>
            <UiTag
              :type="store.booth?.status === '空闲' ? 'success' : 'warning'"
              class="status-tag"
            >
              {{ store.booth?.status }}
            </UiTag>
          </div>
          <div class="header-actions">
            <button
              v-if="store.booth?.vendorId"
              class="btn-follow"
              :class="{ followed: isFollowed }"
              @click="toggleFollow"
            >
              {{ isFollowed ? "已关注" : "+ 关注" }}
            </button>
          </div>
        </div>
      </template>
      <div class="booth-body">
        <div class="booth-avatar">
          <el-icon size="40"><Shop /></el-icon>
        </div>
        <div class="booth-info">
          <p class="booth-desc">{{ store.booth?.description || "暂无描述" }}</p>
          <div class="booth-meta">
            <span>
              <el-icon><Clock /></el-icon>
              {{ store.booth?.openTime || "营业时间未设置" }}
            </span>
          </div>
        </div>
      </div>
    </UiCard>

    <!-- 商品列表标题 -->
    <div class="section-title">
      <h3>在售商品（{{ store.productList.length }}）</h3>
      <UiDivider />
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
          class="product-col"
        >
          <UiCard class="product-card">
            <div class="product-image">
              <UiImage
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
                <UiInputNumber
                  v-model="store.quantities[product.id]"
                  :min="1"
                  :max="Math.max(1, product.stock)"
                  :disabled="product.stock === 0"
                  size="small"
                  class="quantity-input"
                />
                <UiButton
                  type="primary"
                  size="small"
                  @click="
                    handleAddToCart(product.id, store.quantities[product.id])
                  "
                  :disabled="product.stock === 0"
                >
                  {{ product.stock === 0 ? "缺货" : "加入购物车" }}
                </UiButton>
              </div>
              <button
                v-if="product.canReserve === 1 && product.stock > 0"
                class="reserve-btn"
                @click="openReserveDialog(product.id)"
              >
                预定
              </button>
              <div v-else class="reserve-placeholder"></div>
            </div>
          </UiCard>
        </el-col>
      </el-row>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!store.productLoading" class="empty-container">
      <UiEmpty description="该摊位暂无上架商品" />
    </div>

    <!-- 预定时间弹窗 -->
    <UiDialog
      v-model="reserveVisible"
      title="预定商品"
      width="450px"
      class="reserve-dialog"
    >
      <div class="dialog-tip">
        <el-icon><InfoFilled /></el-icon>
        本次预定数量固定为 <strong>1 个</strong>，如需多个请分次预定。
      </div>
      <el-form label-width="80px">
        <UiFormItem label="开始时间">
          <UiDateInput
            v-model="reserveStartTime"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </UiFormItem>
        <UiFormItem label="结束时间">
          <UiDateInput
            v-model="reserveEndTime"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </UiFormItem>
      </el-form>
      <template #footer>
        <UiButton @click="reserveVisible = false">取消</UiButton>
        <UiButton type="primary" @click="handleReserve">提交预定</UiButton>
      </template>
    </UiDialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useUserMarketStore } from "@/store/modules/userMarket";
import { ElMessage } from "element-plus";
import {
  InfoFilled,
  Shop,
  Clock,
  PictureFilled,
} from "@element-plus/icons-vue";
import { getFullUrl } from "@/utils/urlHelper";
import { submitReservation } from "@/api/user";

const route = useRoute();
const boothId = Number(route.params.id);
const store = useUserMarketStore();

const reserveVisible = ref(false);
const reserveProductId = ref(null);
const reserveStartTime = ref("");
const reserveEndTime = ref("");

//关注相关
const isFollowed = ref(false);

// 当摊位数据加载后，检查关注状态
watch(
  () => store.booth?.vendorId,
  async (vendorId) => {
    if (vendorId) {
      try {
        isFollowed.value = await store.isFollowed(vendorId);
      } catch (e) {
        /* 忽略 */
      }
    }
  },
  { immediate: true },
);

onMounted(async () => {
  try {
    await Promise.all([
      store.fetchBooth(boothId),
      store.fetchProducts(boothId),
    ]);
  } catch (e) {
    ElMessage.error("加载摊位信息失败");
  }
});

const handleAddToCart = async (productId, quantity) => {
  try {
    await store.addProductToCart(productId, quantity);
    ElMessage.success("已加入购物车");
    store.quantities[productId] = 1;
  } catch (e) {
    ElMessage.error(e.message || "添加失败");
  }
};

const openReserveDialog = (productId) => {
  reserveProductId.value = productId;
  reserveStartTime.value = "";
  reserveEndTime.value = "";
  reserveVisible.value = true;
};

const handleReserve = async () => {
  if (!reserveStartTime.value || !reserveEndTime.value) {
    ElMessage.warning("请选择时间段");
    return;
  }
  if (new Date(reserveStartTime.value) >= new Date(reserveEndTime.value)) {
    ElMessage.warning("结束时间必须大于开始时间");
    return;
  }
  try {
    await submitReservation(
      reserveProductId.value,
      reserveStartTime.value,
      reserveEndTime.value,
    );
    ElMessage.success("预定已提交，请等待摊主确认");
    reserveVisible.value = false;
  } catch (e) {
    ElMessage.error(e.message || "预定失败");
  }
};

//关注功能
const toggleFollow = async () => {
  if (!store.booth?.vendorId) return;
  try {
    if (isFollowed.value) {
      await store.unfollow(store.booth.vendorId);
      ElMessage.success("已取消关注");
    } else {
      await store.follow(store.booth.vendorId);
      ElMessage.success("已关注");
    }
    isFollowed.value = !isFollowed.value;
  } catch (e) {
    ElMessage.error(e.message || "操作失败");
  }
};
</script>

<style scoped>
/* ============================================================
   1. 设计 Token
   ============================================================ */
.booth-detail-page {
  --bg: var(--surface-page);
  --text: var(--ink-strong);
  --text-secondary: var(--ink);
  --text-muted: var(--ink-muted);
  --accent: var(--brand-primary);
  --accent-light: var(--brand-primary-soft);
  --green: var(--success);
  --green-bg: #e8f5ef;
  --shadow: var(--shadow-sm);
  --shadow-hover: var(--shadow-md);
  --radius: var(--radius-md);

  padding: 20px;
  max-width: 1100px;
  margin: 0 auto;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "PingFang SC",
    "Microsoft YaHei",
    sans-serif;
  color: var(--text);
}

/* ============================================================
   2. 卡片样式
   ============================================================ */
:deep(.ui-card) {
  border: none !important;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

:deep(.ui-card__header) {
  border-bottom: 1px solid var(--line);
  padding: 20px 24px;
  background: var(--surface-card);
}

:deep(.ui-card__body) {
  padding: 24px;
}

/* ============================================================
   3. 摊位头部
   ============================================================ */
.booth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.booth-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

/* 状态标签 */
.status-tag {
  border-radius: 100px;
  border: none !important;
  font-weight: 500;
  padding: 4px 16px;
  font-size: 0.75rem;
}

:deep(.status-tag.ui-tag.is-success) {
  background-color: var(--green-bg);
  color: var(--green);
}

:deep(.status-tag.ui-tag.is-warning) {
  background-color: #fdf6e8;
  color: #d4a24e;
}

/* 关注按钮 */
.header-actions {
  flex-shrink: 0;
}

.btn-follow {
  padding: 6px 20px;
  border-radius: 100px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.25s;
}

.btn-follow:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

.btn-follow.followed {
  background: var(--accent-light);
  border-color: var(--accent);
  color: var(--accent);
}

.btn-follow.followed:hover {
  background: transparent;
  border-color: var(--line);
  color: var(--text-secondary);
}

/* ============================================================
   4. 摊位主体
   ============================================================ */
.booth-body {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.booth-avatar {
  width: 72px;
  height: 72px;
  background: var(--accent-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  flex-shrink: 0;
}

.booth-info {
  flex: 1;
  min-width: 0;
}

.booth-desc {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin: 0 0 8px 0;
  line-height: 1.6;
}

.booth-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.booth-meta .el-icon {
  color: var(--accent);
  margin-right: 2px;
}

/* ============================================================
   5. 区块标题
   ============================================================ */
.section-title {
  margin: 32px 0 20px;
}

.section-title h3 {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

:deep(.section-title .el-divider) {
  margin: 8px 0 0;
  background-color: var(--line);
}

/* ============================================================
   6. 商品网格
   ============================================================ */
.product-grid {
  margin-bottom: 20px;
}

.product-col {
  display: flex;
}

.product-card {
  margin-bottom: 20px;
  border: none !important;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

:deep(.product-card .ui-card__body) {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* 商品图片 */
.product-image {
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f0ea;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

/* 商品信息 */
.product-info {
  flex: 1;
}

.product-info h4 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 6px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
}

.stock {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}

/* ============================================================
   7. 商品操作按钮
   ============================================================ */
.product-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.cart-action {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-input {
  width: 80px;
}

:deep(.quantity-input .el-input__wrapper) {
  border-radius: 100px;
  box-shadow: none !important;
  border: 1px solid var(--line);
  padding: 0 12px;
}

:deep(.quantity-input .el-input__wrapper.is-focus) {
  border-color: var(--accent);
}

:deep(.quantity-input .el-input__inner) {
  text-align: center;
  color: var(--text);
}

:deep(.quantity-input .el-input-number__decrease),
:deep(.quantity-input .el-input-number__increase) {
  background: transparent;
  border: none;
  color: var(--text-muted);
}

:deep(.quantity-input .el-input-number__decrease:hover),
:deep(.quantity-input .el-input-number__increase:hover) {
  color: var(--accent);
}

/* 加入购物车按钮 */
:deep(.product-actions .el-button--primary) {
  background: var(--text);
  border: none;
  border-radius: 100px;
  padding: 8px 16px;
  font-weight: 500;
  color: #fff;
  transition: background 0.25s;
  font-size: 0.75rem;
}

:deep(.product-actions .el-button--primary:hover) {
  background: var(--accent);
}

:deep(.product-actions .el-button--primary.is-disabled) {
  background: var(--line);
  color: var(--text-muted);
}

/* 预定按钮 */
.reserve-btn {
  width: 100%;
  border-radius: 100px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--text-secondary);
  font-weight: 500;
  padding: 6px 16px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.25s;
}

.reserve-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

.reserve-placeholder {
  height: 32px;
}

/* ============================================================
   8. 空状态
   ============================================================ */
.empty-container {
  margin-top: 40px;
}

:deep(.el-empty__description p) {
  color: var(--text-secondary);
}

/* ============================================================
   9. 预定弹窗
   ============================================================ */
:global(.ui-dialog.reserve-dialog) {
  border-radius: var(--radius);
}

:global(.ui-dialog.reserve-dialog .ui-dialog__header) {
  border-bottom: 1px solid var(--line);
  padding: 18px 24px;
  background: var(--surface-card);
}

:global(.ui-dialog.reserve-dialog .ui-dialog__body) {
  padding: 24px;
}

.dialog-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--surface-subtle);
  border-radius: 12px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.dialog-tip .el-icon {
  color: var(--accent);
  font-size: 1.1rem;
}

.reserve-dialog :deep(.el-form-item__label) {
  color: var(--text-secondary);
  font-weight: 500;
}

:deep(.reserve-dialog .el-date-editor .el-input__wrapper) {
  border-radius: 100px;
  box-shadow: none !important;
  border: 1px solid var(--line);
}

:deep(.reserve-dialog .el-date-editor .el-input__wrapper.is-focus) {
  border-color: var(--accent);
}

:deep(.reserve-dialog .el-button) {
  border-radius: 100px;
}

:deep(.reserve-dialog .el-button--primary) {
  background: var(--text);
  border: none;
  padding: 8px 24px;
  font-weight: 500;
}

:deep(.reserve-dialog .el-button--primary:hover) {
  background: var(--accent);
}

/* ============================================================
   10. 响应式适配
   ============================================================ */

/* ---- 移动端（< 768px） ---- */
@media (max-width: 767px) {
  .booth-detail-page {
    padding: 8px;
  }

  :deep(.ui-card__header) {
    padding: 14px 16px;
  }

  :deep(.ui-card__body) {
    padding: 16px;
  }

  .booth-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .header-left {
    flex-wrap: wrap;
  }

  .header-actions {
    width: 100%;
  }

  .btn-follow {
    width: 100%;
    text-align: center;
    padding: 8px 16px;
  }

  .booth-body {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .booth-avatar {
    width: 64px;
    height: 64px;
  }

  .booth-desc {
    font-size: 0.85rem;
  }

  .booth-meta {
    justify-content: center;
    font-size: 0.8rem;
    flex-wrap: wrap;
  }

  .section-title {
    margin: 24px 0 16px;
  }

  .section-title h3 {
    font-size: 1rem;
  }

  .product-image {
    height: 140px;
  }

  .product-info h4 {
    font-size: 0.85rem;
  }

  .price {
    font-size: 1rem;
  }

  .product-actions .el-button--primary {
    font-size: 0.7rem;
    padding: 6px 12px;
  }

  :deep(.product-actions .el-button--primary) {
    padding: 6px 12px;
    font-size: 0.7rem;
  }

  .quantity-input {
    width: 70px;
  }

  :deep(.quantity-input .el-input__wrapper) {
    padding: 0 6px;
  }

  .reserve-btn {
    font-size: 0.7rem;
    padding: 5px 12px;
  }

  /* 弹窗适配 */
  :global(.ui-dialog.reserve-dialog) {
    width: 95% !important;
    margin: 10px auto !important;
  }

  :global(.ui-dialog.reserve-dialog .ui-dialog__header) {
    padding: 14px 16px;
  }

  :global(.ui-dialog.reserve-dialog .ui-dialog__body) {
    padding: 16px;
  }

  .dialog-tip {
    font-size: 0.8rem;
    padding: 10px 14px;
  }
}

/* ---- 平板端（768px ~ 1024px） ---- */
@media (min-width: 768px) and (max-width: 1024px) {
  .booth-detail-page {
    padding: 24px;
    max-width: 100%;
  }

  :deep(.ui-card__header) {
    padding: 18px 20px;
  }

  :deep(.ui-card__body) {
    padding: 20px;
  }

  .product-image {
    height: 140px;
  }

  .btn-follow {
    padding: 5px 16px;
    font-size: 0.75rem;
  }

  :global(.ui-dialog.reserve-dialog) {
    width: 90% !important;
  }
}

/* ---- 桌面端（≥ 1024px） ---- */
@media (min-width: 1025px) {
  .booth-detail-page {
    padding: 32px 20px;
  }

  :deep(.ui-card__header) {
    padding: 24px 28px;
  }

  :deep(.ui-card__body) {
    padding: 28px;
  }
}
</style>
