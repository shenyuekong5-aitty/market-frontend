<template>
  <div class="cart-page">
    <UiCard>
      <template #header>
        <div class="cart-header">
          <span>购物车（{{ store.cartList.length }} 件商品）</span>
          <UiButton
            type="danger"
            size="small"
            :disabled="store.cartList.length === 0"
            @click="handleClear"
          >
            清空购物车
          </UiButton>
        </div>
      </template>

      <!-- 空购物车提示 -->
      <div
        v-if="store.cartList.length === 0 && !store.cartLoading"
        class="empty-cart"
      >
        <UiEmpty description="购物车是空的">
          <UiButton type="primary" @click="$router.push('/markets')">去逛逛集市</UiButton>
        </UiEmpty>
      </div>

      <!-- ===== 购物车列表 ===== -->
      <div v-else>
        <!-- 桌面/平板：表格 -->
        <div class="table-wrapper">
          <UiTable
            :data="store.cartList"
            border
            style="width: 100%"
            v-loading="store.cartLoading"
          >
            <UiTableColumn
              label="商品图片"
              width="80"
              class-name="hide-on-mobile"
              header-class-name="hide-on-mobile"
            >
              <template #default="{ row }">
                <UiImage
                  v-if="row.productImageUrl"
                  :src="getFullUrl(row.productImageUrl)"
                  fit="cover"
                  style="width: 50px; height: 50px; border-radius: 8px"
                />
                <span v-else style="color: #c0c4cc">暂无</span>
              </template>
            </UiTableColumn>
            <UiTableColumn
              prop="productName"
              label="商品名称"
              min-width="120"
            />
            <UiTableColumn
              prop="productPrice"
              label="单价"
              width="100"
              align="center"
              class-name="hide-on-mobile"
              header-class-name="hide-on-mobile"
            />
            <UiTableColumn label="数量" width="150" align="center">
              <template #default="{ row }">
                <UiInputNumber
                  v-model="row.quantity"
                  :min="1"
                  :max="row.stock"
                  size="small"
                  @change="(val) => handleQuantityChange(row.cartId, val)"
                />
              </template>
            </UiTableColumn>
            <UiTableColumn label="小计" width="100" align="right">
              <template #default="{ row }">
                ¥{{ (row.productPrice * row.quantity).toFixed(2) }}
              </template>
            </UiTableColumn>
            <UiTableColumn label="操作" width="80" align="center">
              <template #default="{ row }">
                <UiButton
                  type="danger"
                  size="small"
                  @click="handleDelete(row.cartId)"
                  >删除</UiButton
                >
              </template>
            </UiTableColumn>
          </UiTable>
        </div>

        <!-- ===== 移动端：卡片列表 ===== -->
        <div class="cart-card-list">
          <div
            v-for="item in store.cartList"
            :key="item.cartId"
            class="cart-item-card"
          >
            <div class="item-row">
              <!-- 图片 -->
              <div class="item-image">
                <UiImage
                  v-if="item.productImageUrl"
                  :src="getFullUrl(item.productImageUrl)"
                  fit="cover"
                  style="width: 72px; height: 72px; border-radius: 10px"
                />
                <span v-else class="image-placeholder">无图</span>
              </div>
              <!-- 信息 -->
              <div class="item-info">
                <div class="item-name">{{ item.productName }}</div>
                <div class="item-price">
                  ¥{{ Number(item.productPrice).toFixed(2) }}
                </div>
              </div>
              <!-- 删除按钮 -->
              <div class="item-delete" @click="handleDelete(item.cartId)">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
            </div>
            <!-- 底部操作栏：数量 + 小计 -->
            <div class="item-actions">
              <div class="quantity-control">
                <button
                  class="qty-btn"
                  @click="updateQuantity(item, -1)"
                  :disabled="item.quantity <= 1"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <span class="qty-num">{{ item.quantity }}</span>
                <button
                  class="qty-btn"
                  @click="updateQuantity(item, 1)"
                  :disabled="item.quantity >= item.stock"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
              <div class="item-subtotal">
                小计
                <span class="subtotal-price"
                  >¥{{ (item.productPrice * item.quantity).toFixed(2) }}</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- 底部合计 -->
        <div class="cart-footer">
          <div class="total-price">
            合计：<span class="price">¥{{ totalPrice }}</span>
          </div>
          <div class="actions">
            <UiButton
              type="primary"
              size="large"
              :disabled="store.cartList.length === 0"
              @click="handleCheckout"
            >
              去结算
            </UiButton>
          </div>
        </div>
      </div>
    </UiCard>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserMarketStore } from "@/store/modules/userMarket";
import { ElMessage, ElMessageBox } from "element-plus";
import { getFullUrl } from "@/utils/urlHelper";

const router = useRouter();
const store = useUserMarketStore();

onMounted(async () => {
  try {
    await store.fetchCart();
  } catch (e) {
    ElMessage.error("获取购物车失败");
  }
});

const totalPrice = computed(() => {
  return store.cartList
    .reduce((sum, item) => {
      return sum + (item.productPrice || 0) * (item.quantity || 0);
    }, 0)
    .toFixed(2);
});

const handleQuantityChange = (cartId, quantity) => {
  store.changeCartQuantity(cartId, quantity);
};

// 移动端加减数量
const updateQuantity = (item, delta) => {
  const newVal = item.quantity + delta;
  if (newVal < 1 || newVal > item.stock) return;
  store.changeCartQuantity(item.cartId, newVal);
};

const handleDelete = (cartId) => {
  ElMessageBox.confirm("确定要移除该商品吗？", "提示", {
    type: "warning",
  }).then(async () => {
    try {
      await store.deleteCartItem(cartId);
      ElMessage.success("已移除");
    } catch (e) {
      ElMessage.error(e.message || "移除失败");
    }
  });
};

const handleCheckout = async () => {
  try {
    await ElMessageBox.confirm("确认生成订单吗？", "提示", { type: "info" });
    await store.submitCartToOrder();
    ElMessage.success("订单已生成");
    router.push("/orders");
  } catch (e) {
    if (e !== "cancel") {
      ElMessage.error(e.message || "下单失败");
    }
  }
};

const handleClear = () => {
  ElMessageBox.confirm("确定要清空购物车吗？", "提示", {
    type: "warning",
  }).then(async () => {
    try {
      await store.emptyCart();
      ElMessage.success("购物车已清空");
    } catch (e) {
      ElMessage.error(e.message || "清空失败");
    }
  });
};
</script>

<style scoped>
/* ============================================================
   1. 基础容器
   ============================================================ */
.cart-page {
  --text: var(--ink-strong);
  --text-secondary: var(--ink);
  --text-muted: var(--ink-muted);
  --accent: var(--brand-primary);
  --accent-light: var(--brand-primary-soft);
  --shadow: var(--shadow-sm);
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

/* ============================================================
   2. 卡片样式
   ============================================================ */
:deep(.el-card) {
  border: none !important;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(44, 37, 32, 0.04);
  overflow: hidden;
}

:deep(.el-card__header) {
  border-bottom: 1px solid var(--line);
  padding: 20px 24px;
  background: var(--surface-card);
}

:deep(.el-card__body) {
  padding: 24px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  color: var(--ink-strong);
}

.cart-header .el-button--danger {
  border-radius: 100px;
  border: 1px solid var(--line);
  color: var(--ink-muted);
  background: transparent;
  font-weight: 400;
  padding: 8px 16px;
}
.cart-header .el-button--danger:hover {
  background: #fdf6f5;
  border-color: var(--danger);
  color: var(--danger);
}
.cart-header .el-button--danger.is-disabled {
  border-color: var(--line);
  color: #c5b9aa;
  background: transparent;
}

/* ============================================================
   3. 桌面/平板表格
   ============================================================ */
.table-wrapper {
  overflow-x: auto;
  margin: 0 -4px;
}

:deep(.el-table) {
  border: none !important;
  font-size: 14px;
}
:deep(.el-table th.el-table__cell) {
  background: var(--surface-page) !important;
  color: var(--ink-muted);
  font-weight: 500;
  border-bottom: none;
  padding: 12px 0;
}
:deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid var(--line);
  padding: 16px 0;
}
:deep(.el-table--border) {
  border: none;
}
:deep(.el-table--border .el-table__cell) {
  border-right: none;
}
:deep(.el-table--border .el-table__cell:last-child) {
  border-right: none;
}
:deep(.el-table .cell) {
  padding: 0 8px;
}
:deep(.el-table .el-table__body-wrapper) {
  color: var(--ink-strong);
}

/* ============================================================
   4. 数量输入框
   ============================================================ */
:deep(.el-input-number) {
  border-radius: 100px;
}
:deep(.el-input-number .el-input__wrapper) {
  border-radius: 100px;
  box-shadow: none !important;
  border: 1px solid var(--line);
  padding: 0 12px;
}
:deep(.el-input-number .el-input__wrapper.is-focus) {
  border-color: var(--brand-primary);
}
:deep(.el-input-number .el-input__inner) {
  text-align: center;
  color: var(--ink-strong);
}
:deep(.el-input-number .el-input-number__decrease),
:deep(.el-input-number .el-input-number__increase) {
  background: transparent;
  border: none;
  color: var(--ink-muted);
}
:deep(.el-input-number .el-input-number__decrease:hover),
:deep(.el-input-number .el-input-number__increase:hover) {
  color: var(--brand-primary);
}

/* ============================================================
   5. 按钮
   ============================================================ */
:deep(.el-button--danger) {
  border-radius: 100px;
  border: 1px solid transparent;
  color: var(--ink-muted);
  background: transparent;
  font-weight: 400;
  padding: 6px 14px;
}
:deep(.el-button--danger:hover) {
  background: #fdf6f5;
  border-color: var(--danger);
  color: var(--danger);
}
:deep(.el-button--primary) {
  background: var(--ink-strong);
  border: none;
  border-radius: 100px;
  padding: 12px 32px;
  font-weight: 500;
  color: #fff;
}
:deep(.el-button--primary:hover) {
  background: var(--brand-primary);
}
:deep(.el-button--primary.is-disabled) {
  background: var(--line);
  color: var(--ink-muted);
}

/* ============================================================
   6. 底部合计
   ============================================================ */
.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
}
.total-price {
  font-size: 16px;
  color: var(--ink-muted);
}
.price {
  color: var(--ink-strong);
  font-weight: 600;
  font-size: 24px;
  margin-left: 8px;
}

.empty-cart {
  padding: 60px 20px;
  text-align: center;
}
.empty-cart .el-button--primary {
  background: var(--ink-strong);
  border: none;
  border-radius: 100px;
  padding: 10px 28px;
  font-weight: 500;
}
.empty-cart .el-button--primary:hover {
  background: var(--brand-primary);
}

/* ============================================================
   7. 移动端卡片列表（默认隐藏，仅在手机显示）
   ============================================================ */
.cart-card-list {
  display: none;
}

/* ============================================================
   8. 移动端专用样式 (< 768px)
   ============================================================ */
@media (max-width: 767px) {
  .cart-page {
    padding: 8px;
  }

  :deep(.el-card__header) {
    padding: 12px 14px;
  }
  :deep(.el-card__body) {
    padding: 8px 4px;
  }

  .cart-header {
    font-size: 13px;
    flex-wrap: wrap;
    gap: 6px;
  }
  .cart-header .el-button--danger {
    padding: 4px 10px;
    font-size: 11px;
  }

  /* ---- 隐藏表格 ---- */
  .table-wrapper {
    display: none;
  }

  /* ---- 显示卡片列表 ---- */
  .cart-card-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 4px 0;
  }

  .cart-item-card {
    background: #ffffff;
    border-radius: 14px;
    padding: 14px 14px 12px;
    box-shadow: 0 2px 12px rgba(44, 37, 32, 0.04);
    border: 1px solid var(--line);
  }

  /* 第一行：图片 + 名称 + 删除 */
  .item-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .item-image {
    flex-shrink: 0;
  }
  .item-image .el-image {
    width: 72px !important;
    height: 72px !important;
    border-radius: 10px;
    object-fit: cover;
  }
  .image-placeholder {
    width: 72px;
    height: 72px;
    border-radius: 10px;
    background: var(--line);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: var(--ink-muted);
  }

  .item-info {
    flex: 1;
    min-width: 0;
  }
  .item-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--ink-strong);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .item-price {
    font-size: 15px;
    font-weight: 600;
    color: var(--brand-primary);
    margin-top: 4px;
  }

  .item-delete {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--ink-muted);
    transition:
      background 0.2s,
      color 0.2s;
    background: var(--surface-page);
  }
  .item-delete:active {
    background: #fdf6f5;
    color: var(--danger);
  }

  /* 第二行：数量 + 小计 */
  .item-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--line);
  }

  .quantity-control {
    display: flex;
    align-items: center;
    gap: 0;
    border: 1px solid var(--line);
    border-radius: 100px;
    overflow: hidden;
    background: #fff;
  }
  .qty-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--ink-strong);
    cursor: pointer;
    font-size: 18px;
    transition: background 0.15s;
  }
  .qty-btn:active {
    background: var(--line);
  }
  .qty-btn:disabled {
    color: #d5cdc2;
    cursor: not-allowed;
  }
  .qty-num {
    min-width: 36px;
    text-align: center;
    font-size: 15px;
    font-weight: 500;
    color: var(--ink-strong);
  }

  .item-subtotal {
    font-size: 13px;
    color: var(--ink-muted);
  }
  .subtotal-price {
    font-size: 16px;
    font-weight: 600;
    color: var(--ink-strong);
    margin-left: 4px;
  }

  /* 底部合计移动端适配 */
  .cart-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
    margin-top: 16px;
    padding-top: 16px;
  }
  .total-price {
    text-align: center;
    font-size: 15px;
  }
  .price {
    font-size: 22px;
  }
  .actions .el-button--primary {
    width: 100%;
    justify-content: center;
    padding: 14px 16px;
    font-size: 16px;
    height: auto;
  }
}

/* ---- 平板端（768px ~ 1024px） ---- */
@media (min-width: 768px) and (max-width: 1024px) {
  .cart-page {
    padding: 24px;
    max-width: 100%;
  }
  :deep(.el-card__header) {
    padding: 18px 20px;
  }
  :deep(.el-card__body) {
    padding: 20px;
  }
}

/* ---- 桌面端（> 1024px） ---- */
@media (min-width: 1025px) {
  .cart-page {
    padding: 28px 20px;
  }
  :deep(.el-card__header) {
    padding: 24px 28px;
  }
  :deep(.el-card__body) {
    padding: 28px;
  }
}
</style>
