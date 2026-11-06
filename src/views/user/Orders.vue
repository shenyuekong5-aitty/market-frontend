<template>
  <div class="orders-page">
    <PageHeading title="我的订单" description="从下单到收货，每一笔交易都在这里。" eyebrow="ORDERS / 订单" />
    <CollectionToolbar v-model="searchQuery" :count="filteredRows.length" placeholder="搜索订单编号或状态…" />
    <UiEmpty v-if="searchQuery && !filteredRows.length" description="没有找到匹配的内容，试试其他关键词。" class="search-empty" />
    <UiCard>
      <template #header>
        <div class="orders-header">
          <span>订单记录</span>
          <span class="order-count" v-if="store.orderList.length > 0">
            共 {{ store.orderList.length }} 笔订单
          </span>
        </div>
      </template>

      <!-- 超时提示横幅 -->
      <UiAlert
        title="演示环境使用模拟付款；订单提交后请在30分钟内完成，超时系统将自动取消订单。"
        type="info"
        :closable="false"
        show-icon
        class="alert-banner"
      />

      <!-- 空状态 -->
      <div
        v-if="store.orderList.length === 0 && !store.orderLoading"
        class="empty-state"
      >
        <UiEmpty description="暂无订单">
          <UiButton type="primary" @click="$router.push('/markets')">
            去逛逛集市
          </UiButton>
        </UiEmpty>
      </div>

      <!-- 非空状态：包含表格和移动端卡片 -->
      <div v-else>
        <!-- ===== 桌面/平板：订单列表表格 ===== -->
        <div class="table-wrapper">
          <UiTable
            :data="filteredRows"
            border
            style="width: 100%"
            v-loading="store.orderLoading"
            class="order-table"
          >
            <UiTableColumn prop="orderNo" label="订单编号" width="180" />
            <UiTableColumn prop="vendorUsername" label="摊主" width="120" />
            <UiTableColumn prop="totalAmount" label="总金额" width="100" align="center" />
            <UiTableColumn label="状态" width="120" align="center">
              <template #default="{ row }">
                <div class="status-cell">
                  <span
                    class="status-badge"
                    :class="statusClass(row.status)"
                  >
                    {{ row.status }}
                  </span>
                  <el-tooltip
                    v-if="row.status === '已取消'"
                    content="您已手动取消订单或超时未付款，系统自动取消"
                    placement="top"
                  >
                    <el-icon class="cancel-icon"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
              </template>
            </UiTableColumn>
            <UiTableColumn prop="createTime" label="下单时间" width="180" />
            <UiTableColumn label="操作" width="280" align="center">
              <template #default="{ row }">
                <div class="table-actions">
                  <button class="btn-outline btn-sm" @click="showDetail(row.id)">
                    详情
                  </button>
                  <button
                    v-if="row.status === '待付款'"
                    class="btn-primary btn-sm"
                    @click="handlePay(row.id)"
                  >
                    模拟付款
                  </button>
                  <button
                    v-if="row.status === '待取货'"
                    class="btn-success btn-sm"
                    @click="handleConfirmReceive(row.id)"
                  >
                    确认取货
                  </button>
                  <button
                    v-if="row.status === '待付款'"
                    class="btn-danger btn-sm"
                    @click="handleCancel(row.id)"
                  >
                    取消
                  </button>
                </div>
              </template>
            </UiTableColumn>
          </UiTable>
        </div>

        <!-- ===== 移动端：订单卡片列表 ===== -->
        <div class="order-card-list">
          <div
            v-for="order in filteredRows"
            :key="order.id"
            class="order-card"
          >
            <!-- 第一行：订单编号 + 状态 -->
            <div class="order-card-row">
              <span class="order-card-no">{{ order.orderNo }}</span>
              <span
                class="status-badge"
                :class="statusClass(order.status)"
              >
                {{ order.status }}
              </span>
            </div>

            <!-- 第二行：信息网格 -->
            <div class="order-card-info">
              <div class="info-item">
                <span class="info-label">摊主</span>
                <span class="info-value">{{ order.vendorUsername }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">总金额</span>
                <span class="info-value price">¥{{ Number(order.totalAmount).toFixed(2) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">下单时间</span>
                <span class="info-value">{{ order.createTime }}</span>
              </div>
            </div>

            <!-- 第三行：操作按钮 -->
            <div class="order-card-actions">
              <button class="btn-outline btn-sm" @click="showDetail(order.id)">
                详情
              </button>
              <button
                v-if="order.status === '待付款'"
                class="btn-primary btn-sm"
                @click="handlePay(order.id)"
              >
                模拟付款
              </button>
              <button
                v-if="order.status === '待取货'"
                class="btn-success btn-sm"
                @click="handleConfirmReceive(order.id)"
              >
                确认取货
              </button>
              <button
                v-if="order.status === '待付款'"
                class="btn-danger btn-sm"
                @click="handleCancel(order.id)"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    </UiCard>

    <!-- 订单明细弹窗 -->
    <UiDialog v-model="detailVisible" title="订单明细" width="650px" class="detail-dialog">
      <OrderItemsDetail :items="store.currentOrderItems" :total="detailTotal" />
    </UiDialog>
  </div>
</template>

<script setup>
import CollectionToolbar from '@/components/CollectionToolbar.vue'
import { useCollectionSearch } from '@/composables/useCollectionSearch'
import PageHeading from '@/components/PageHeading.vue'
import { ref, computed, onMounted, watch } from "vue";
import { useUserMarketStore } from "@/store/modules/userMarket";
import { useNotificationStore } from "@/store/modules/notification";
import { ElMessage, ElMessageBox } from "element-plus";
import OrderItemsDetail from '@/components/OrderItemsDetail.vue'
import { QuestionFilled } from "@element-plus/icons-vue";

const store = useUserMarketStore();
const notificationStore = useNotificationStore();
const detailVisible = ref(false);

// 状态样式映射
const statusClass = (status) => {
  const map = {
    待付款: "status-pending",
    已付款: "status-paid",
    待取货: "status-ready",
    已完成: "status-done",
    已取消: "status-cancelled",
  };
  return map[status] || "status-pending";
};

const detailTotal = computed(() => {
  return store.currentOrderItems
    .reduce((sum, item) => {
      return sum + (item.productPrice || 0) * (item.quantity || 0);
    }, 0)
    .toFixed(2);
});

onMounted(async () => {
  try {
    await store.fetchOrders();
  } catch (e) {
    ElMessage.error("获取订单列表失败");
  }
});

watch(
  () => notificationStore.unreadCount,
  () => {
    store.fetchOrders()
  }
)

const showDetail = async (orderId) => {
  try {
    await store.fetchOrderDetail(orderId);
    detailVisible.value = true;
  } catch (e) {
    ElMessage.error("获取明细失败");
  }
};

const handlePay = (orderId) => {
  ElMessageBox.confirm("该操作仅模拟付款状态，不会发生真实扣款。确认继续吗？", "模拟付款", { type: "info" }).then(
    async () => {
      try {
        await store.handlePayOrder(orderId);
        ElMessage.success("模拟付款成功");
      } catch (e) {
        ElMessage.error(e.message || "模拟付款失败");
      }
    },
  );
};

const handleCancel = (orderId) => {
  ElMessageBox.confirm("确定要取消该订单吗？库存将恢复。", "取消订单", {
    type: "warning",
  }).then(async () => {
    try {
      await store.handleCancelOrder(orderId);
      ElMessage.success("订单已取消");
    } catch (e) {
      ElMessage.error(e.message || "取消失败");
    }
  });
};

const handleConfirmReceive = (orderId) => {
  ElMessageBox.confirm("确认已在摊位取到商品吗？", "确认取货", { type: "info" }).then(
    async () => {
      try {
        await store.handleConfirmReceive(orderId);
        ElMessage.success("已确认取货，订单完成");
      } catch (e) {
        ElMessage.error(e.message || "操作失败");
      }
    },
  );
};

const { searchQuery, filteredRows } = useCollectionSearch(() => store.orderList, ['orderNo', 'productNames', 'status'])
</script>
