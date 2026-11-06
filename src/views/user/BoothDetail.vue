<template>
  <div class="booth-detail-page">
    <PageHeading title="小店好物" description="用心挑选的商品，等你慢慢发现。" eyebrow="SHOP / 商品" />
    <CollectionToolbar v-model="searchQuery" :count="filteredRows.length" placeholder="搜索店内商品…" />
    <UiEmpty v-if="searchQuery && !filteredRows.length" description="没有找到匹配的内容，试试其他关键词。" class="search-empty" />
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
          v-for="product in filteredRows"
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
import CollectionToolbar from '@/components/CollectionToolbar.vue'
import { useCollectionSearch } from '@/composables/useCollectionSearch'
import PageHeading from '@/components/PageHeading.vue'
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

const { searchQuery, filteredRows } = useCollectionSearch(() => store.productList, ['name'])
</script>
