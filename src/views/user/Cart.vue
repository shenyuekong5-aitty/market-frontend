<template>
  <div class="cart-page">
    <PageHeading title="我的购物车" description="把喜欢的好物带回日常。结算前请确认商品数量与库存。" eyebrow="SHOPPING BAG / 购物车" />
    <CollectionToolbar v-model="searchQuery" :count="filteredRows.length" placeholder="搜索购物车中的商品…" />
    <UiEmpty v-if="searchQuery && !filteredRows.length" description="没有找到匹配的内容，试试其他关键词。" class="search-empty" />
    <UiCard>
      <template #header>
        <div class="cart-header">
          <span>待结算商品（{{ store.cartList.length }} 件）</span>
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
            :data="filteredRows"
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
            v-for="item in filteredRows"
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
              <button type="button" class="item-delete" :aria-label="`从购物车移除${item.productName}`" @click="handleDelete(item.cartId)">
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
              </button>
            </div>
            <!-- 底部操作栏：数量 + 小计 -->
            <div class="item-actions">
              <div class="quantity-control">
                <button
                  class="qty-btn"
                  :aria-label="`减少${item.productName}的数量`"
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
                  :aria-label="`增加${item.productName}的数量`"
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
import CollectionToolbar from '@/components/CollectionToolbar.vue'
import { useCollectionSearch } from '@/composables/useCollectionSearch'
import PageHeading from '@/components/PageHeading.vue'
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

const { searchQuery, filteredRows } = useCollectionSearch(() => store.cartList, ['productName'])
</script>
