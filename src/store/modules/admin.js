import { defineStore } from "pinia";
import { ref } from "vue";
import {
  getMyMarket,
  getPendingApplies,
  approveApply,
  rejectApply,
  getOperationLogs,
  createMarket,
  updateMarket,
  toggleMarketStatus,
  getBoothsByMarketId,
  createBooth,
  updateBooth,
  deleteBooth,
  toggleBoothStatus,
  getAdminIncomeStats,
} from "@/api/admin";

export const useAdminStore = defineStore("admin", () => {
  const market = ref(null);
  const applyList = ref([]);
  const logList = ref([]);
  const logLoading = ref(false);
  const loading = ref(false);

  //  集市
  async function fetchMarket() {
    const res = await getMyMarket();
    market.value = res.data;
  }

  async function handleCreateMarket(data) {
    const res = await createMarket(data);
    market.value = res.data;
  }

  async function handleUpdateMarket(id, data) {
    const res = await updateMarket(id, data);
    market.value = res.data;
  }
  //摊位
  // 摊位列表
  const boothList = ref([]);

  //收入
  const incomeStats = ref({
    totalIncome: 0,
    totalOrders: 0,
    completedOrders: 0,
    todayIncome: 0,
    trend: [],
    boothIncome: [],
  });
  const incomeLoading = ref(false);

  async function handleToggleStatus(id) {
    await toggleMarketStatus(id);
    await fetchMarket();
  }

  //  申请
  async function fetchApplies() {
    const res = await getPendingApplies();
    applyList.value = res.data;
  }

  async function handleApprove(id) {
    await approveApply(id);
    await fetchApplies();
  }

  async function handleReject(id) {
    await rejectApply(id);
    await fetchApplies();
  }

  //  日志
  async function fetchOperationLogs(start, end) {
    logLoading.value = true;
    try {
      const res = await getOperationLogs(start, end);
      logList.value = res.data;
    } finally {
      logLoading.value = false;
    }
  }

  //  全局刷新
  async function refreshAll() {
    loading.value = true;
    try {
      await Promise.all([fetchMarket(), fetchApplies()]);
    } finally {
      loading.value = false;
    }
  }

  //摊位
  // 获取摊位列表
  async function fetchBooths(marketId) {
    const res = await getBoothsByMarketId(marketId);
    boothList.value = res.data;
  }

  // 创建摊位
  async function handleCreateBooth(data) {
    await createBooth(data);
    // 创建后刷新列表
    await fetchBooths(data.marketId);
  }

  // 更新摊位
  async function handleUpdateBooth(id, data) {
    await updateBooth(id, data);
    await fetchBooths(data.marketId);
  }

  // 删除摊位
  async function handleDeleteBooth(id, marketId) {
    await deleteBooth(id);
    await fetchBooths(marketId);
  }

  // 切换摊位状态
  async function handleToggleBoothStatus(id, marketId) {
    await toggleBoothStatus(id);
    await fetchBooths(marketId);
  }

  //收入
  async function fetchIncomeStats() {
    incomeLoading.value = true;
    try {
      const res = await getAdminIncomeStats();
      incomeStats.value = res.data;
    } finally {
      incomeLoading.value = false;
    }
  }

  return {
    market,
    applyList,
    logList,
    logLoading,
    loading,
    fetchMarket,
    handleCreateMarket,
    handleUpdateMarket,
    handleToggleStatus,
    fetchApplies,
    handleApprove,
    handleReject,
    fetchOperationLogs,
    refreshAll,
    boothList,
    fetchBooths,
    handleCreateBooth,
    handleUpdateBooth,
    handleDeleteBooth,
    handleToggleBoothStatus,
    //收入
    incomeStats,
    incomeLoading,
    fetchIncomeStats,
  };
});
