<template>
  <div class="orders-page">
    <UiCard>
      <template #header>
        <div class="orders-header">
          <span>我的订单</span>
          <span class="order-count" v-if="store.orderList.length > 0">
            共 {{ store.orderList.length }} 笔订单
          </span>
        </div>
      </template>

      <!-- 超时提示横幅 -->
      <UiAlert
        title="订单提交后请在30分钟内完成付款，超时系统将自动取消订单。"
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
            :data="store.orderList"
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
                    付款
                  </button>
                  <button
                    v-if="row.status === '已付款'"
                    class="btn-success btn-sm"
                    @click="handleConfirmReceive(row.id)"
                  >
                    确认收货
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
            v-for="order in store.orderList"
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
                付款
              </button>
              <button
                v-if="order.status === '已付款'"
                class="btn-success btn-sm"
                @click="handleConfirmReceive(order.id)"
              >
                确认收货
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
      <UiTable :data="store.currentOrderItems" border class="detail-table">
        <UiTableColumn label="商品图片" width="80">
          <template #default="{ row }">
            <UiImage
              v-if="row.productImageUrl"
              :src="getFullUrl(row.productImageUrl)"
              fit="cover"
              style="width: 50px; height: 50px; border-radius: 8px"
            />
            <span v-else class="muted-placeholder">暂无</span>
          </template>
        </UiTableColumn>
        <UiTableColumn prop="productName" label="商品名称" min-width="120" />
        <UiTableColumn prop="productPrice" label="单价" width="80" align="center" />
        <UiTableColumn prop="quantity" label="数量" width="60" align="center" />
        <UiTableColumn label="小计" width="80" align="right">
          <template #default="{ row }">
            ¥{{ (row.productPrice * row.quantity).toFixed(2) }}
          </template>
        </UiTableColumn>
      </UiTable>
      <div class="detail-total" v-if="store.currentOrderItems.length > 0">
        订单总金额：<span>¥{{ detailTotal }}</span>
      </div>
    </UiDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useUserMarketStore } from "@/store/modules/userMarket";
import { useNotificationStore } from "@/store/modules/notification";
import { ElMessage, ElMessageBox } from "element-plus";
import { getFullUrl } from "@/utils/urlHelper";
import { QuestionFilled } from "@element-plus/icons-vue";

const store = useUserMarketStore();
const notificationStore = useNotificationStore();
const detailVisible = ref(false);

// 状态样式映射
const statusClass = (status) => {
  const map = {
    待付款: "status-pending",
    已付款: "status-paid",
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
  ElMessageBox.confirm("确认支付该订单吗？", "付款", { type: "info" }).then(
    async () => {
      try {
        await store.handlePayOrder(orderId);
        ElMessage.success("支付成功");
      } catch (e) {
        ElMessage.error(e.message || "支付失败");
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
  ElMessageBox.confirm("确认已收到商品吗？", "确认收货", { type: "info" }).then(
    async () => {
      try {
        await store.handleConfirmReceive(orderId);
        ElMessage.success("已确认收货，订单完成");
      } catch (e) {
        ElMessage.error(e.message || "操作失败");
      }
    },
  );
};
</script>

<style scoped>
/* ============================================================
   1. 设计 Token
   ============================================================ */
.orders-page {
  --bg: var(--surface-page);
  --text: var(--ink-strong);
  --text-secondary: var(--ink);
  --text-muted: var(--ink-muted);
  --accent: var(--brand-primary);
  --accent-light: var(--brand-primary-soft);
  --green: var(--success);
  --green-bg: #e8f5ef;
  --red: var(--danger);
  --red-bg: #fdebea;
  --shadow: var(--shadow-sm);
  --radius: var(--radius-md);

  padding: 20px;
  max-width: 1100px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: var(--text);
}

/* ============================================================
   2. 卡片样式
   ============================================================ */
:deep(.el-card) {
  border: none !important;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
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

/* ============================================================
   3. 头部
   ============================================================ */
.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  color: var(--text);
}

.order-count {
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--text-secondary);
}

/* ============================================================
   4. 提示横幅
   ============================================================ */
.alert-banner {
  margin-bottom: 16px;
  border-radius: 12px;
  background: var(--surface-subtle) !important;
  border: 1px solid var(--line) !important;
}

:deep(.alert-banner .el-alert__title) {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

:deep(.alert-banner .el-alert__icon) {
  color: var(--accent);
}

/* ============================================================
   5. 表格样式
   ============================================================ */
.table-wrapper {
  overflow-x: auto;
  margin: 0 -4px;
}

.order-table {
  border: none !important;
  font-size: 14px;
}

:deep(.order-table.el-table) {
  border: none !important;
}

:deep(.order-table th.el-table__cell) {
  background: var(--surface-subtle) !important;
  color: var(--text-secondary);
  font-weight: 500;
  border-bottom: none;
  padding: 12px 0;
}

:deep(.order-table td.el-table__cell) {
  border-bottom: 1px solid var(--line);
  padding: 14px 0;
}

:deep(.order-table--border) {
  border: none;
}

:deep(.order-table--border .el-table__cell) {
  border-right: none;
}

:deep(.order-table--border .el-table__cell:last-child) {
  border-right: none;
}

:deep(.order-table .cell) {
  padding: 0 8px;
}

:deep(.order-table .el-table__body-wrapper) {
  color: var(--text);
}

/* ============================================================
   6. 状态标签
   ============================================================ */
.status-badge {
  display: inline-block;
  padding: 2px 14px;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 500;
}

.status-pending {
  background-color: #fdf6e8;
  color: #d4a24e;
}

.status-paid {
  background-color: var(--green-bg);
  color: var(--green);
}

.status-done {
  background-color: var(--line);
  color: var(--text-muted);
}

.status-cancelled {
  background-color: var(--red-bg);
  color: var(--red);
}

.status-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.cancel-icon {
  font-size: 14px;
  color: var(--text-muted);
  cursor: help;
}

/* ============================================================
   7. 按钮
   ============================================================ */
.btn-primary {
  background: var(--text);
  border: none;
  border-radius: 100px;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.25s, transform 0.2s;
  padding: 6px 18px;
  font-size: 0.75rem;
}
.btn-primary:hover {
  background: var(--accent);
}
.btn-primary:active {
  transform: scale(0.96);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 100px;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.25s, color 0.25s, background 0.25s;
  padding: 5px 18px;
  font-size: 0.75rem;
}
.btn-outline:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

.btn-danger {
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 100px;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.25s, color 0.25s, background 0.25s;
  padding: 5px 18px;
  font-size: 0.75rem;
}
.btn-danger:hover {
  border-color: var(--red);
  color: var(--red);
  background: var(--red-bg);
}

.btn-success {
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 100px;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.25s, color 0.25s, background 0.25s;
  padding: 5px 18px;
  font-size: 0.75rem;
}
.btn-success:hover {
  border-color: var(--green);
  color: var(--green);
  background: var(--green-bg);
}

.btn-sm {
  padding: 4px 14px;
  font-size: 0.7rem;
}

.table-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

/* ============================================================
   8. 移动端卡片列表（默认隐藏）
   ============================================================ */
.order-card-list {
  display: none;
}

/* ============================================================
   9. 空状态
   ============================================================ */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state .el-button--primary {
  background: var(--text);
  border: none;
  border-radius: 100px;
  padding: 10px 28px;
  font-weight: 500;
}
.empty-state .el-button--primary:hover {
  background: var(--accent);
}

/* ============================================================
   10. 明细弹窗
   ============================================================ */
.detail-dialog :deep(.el-dialog) {
  border-radius: var(--radius);
}

.detail-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid var(--line);
  padding: 18px 24px;
  background: var(--surface-card);
}

.detail-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.detail-table {
  border: none !important;
}

:deep(.detail-table.el-table) {
  border: none !important;
}

:deep(.detail-table th.el-table__cell) {
  background: var(--surface-subtle) !important;
  color: var(--text-secondary);
  font-weight: 500;
  border-bottom: none;
  padding: 10px 0;
}

:deep(.detail-table td.el-table__cell) {
  border-bottom: 1px solid var(--line);
  padding: 12px 0;
}

:deep(.detail-table--border) {
  border: none;
}

:deep(.detail-table--border .el-table__cell) {
  border-right: none;
}

:deep(.detail-table--border .el-table__cell:last-child) {
  border-right: none;
}

.detail-total {
  text-align: right;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
  font-size: 16px;
  color: var(--text-secondary);
}

.detail-total span {
  font-weight: 600;
  color: var(--text);
  font-size: 18px;
  margin-left: 8px;
}

/* ============================================================
   11. 响应式适配
   ============================================================ */

/* ---- 移动端（< 768px） ---- */
@media (max-width: 767px) {
  .orders-page {
    padding: 8px;
  }

  :deep(.el-card__header) {
    padding: 14px 16px;
  }

  :deep(.el-card__body) {
    padding: 12px 8px;
  }

  .orders-header {
    font-size: 14px;
  }

  .order-count {
    font-size: 12px;
  }

  .alert-banner {
    margin-bottom: 12px;
  }

  :deep(.alert-banner .el-alert__title) {
    font-size: 12px;
  }

  /* ---- 隐藏表格 ---- */
  .table-wrapper {
    display: none;
  }

  /* ---- 显示卡片列表 ---- */
  .order-card-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 4px 0;
  }

  .order-card {
    background: #ffffff;
    border-radius: 14px;
    padding: 14px 16px;
    box-shadow: 0 2px 12px rgba(44, 37, 32, 0.04);
    border: 1px solid var(--line);
  }

  .order-card-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--line);
  }

  .order-card-no {
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
    font-family: 'SF Mono', 'Menlo', monospace;
    letter-spacing: 0.02em;
    word-break: break-all;
  }

  .order-card .status-badge {
    font-size: 0.6rem;
    padding: 2px 12px;
    flex-shrink: 0;
  }

  .order-card-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 16px;
    padding: 10px 0;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .info-item:nth-child(3) {
    grid-column: 1 / -1;
  }

  .info-label {
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .info-value {
    font-size: 13px;
    color: var(--text);
  }

  .info-value.price {
    font-weight: 600;
    color: var(--text);
  }

  .order-card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding-top: 10px;
    border-top: 1px solid var(--line);
  }

  .order-card-actions .btn-sm {
    flex: 1;
    min-width: 60px;
    padding: 8px 12px;
    font-size: 12px;
    text-align: center;
  }

  .order-card-actions .btn-sm:only-child {
    flex: 1;
  }

  /* 明细弹窗移动端适配 */
  .detail-dialog :deep(.el-dialog) {
    width: 95% !important;
    margin: 10px auto !important;
  }

  .detail-dialog :deep(.el-dialog__header) {
    padding: 14px 16px;
  }

  .detail-dialog :deep(.el-dialog__body) {
    padding: 12px 8px;
  }

  .detail-table {
    font-size: 12px;
  }

  :deep(.detail-table th.el-table__cell) {
    padding: 6px 0;
    font-size: 11px;
  }

  :deep(.detail-table td.el-table__cell) {
    padding: 8px 0;
  }

  .detail-total {
    font-size: 14px;
  }

  .detail-total span {
    font-size: 16px;
  }
}

/* ---- 平板端（768px ~ 1024px） ---- */
@media (min-width: 768px) and (max-width: 1024px) {
  .orders-page {
    padding: 24px;
    max-width: 100%;
  }

  :deep(.el-card__header) {
    padding: 18px 20px;
  }

  :deep(.el-card__body) {
    padding: 20px;
  }

  .order-table {
    font-size: 13px;
  }

  :deep(.order-table th.el-table__cell) {
    padding: 10px 0;
  }

  :deep(.order-table td.el-table__cell) {
    padding: 12px 0;
  }

  .btn-sm {
    padding: 4px 12px;
    font-size: 0.65rem;
  }

  .table-actions {
    gap: 4px;
  }

  .detail-dialog :deep(.el-dialog) {
    width: 90% !important;
  }
}

/* ---- 桌面端（≥ 1024px） ---- */
@media (min-width: 1025px) {
  .orders-page {
    padding: 32px 20px;
  }

  :deep(.el-card__header) {
    padding: 24px 28px;
  }

  :deep(.el-card__body) {
    padding: 28px;
  }
}
</style>
