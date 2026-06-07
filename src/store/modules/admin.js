import { defineStore } from "pinia";
import { ref } from "vue";
import {
  getMyMarket,
  getPendingApplies,
  approveApply,
  rejectApply,
  getOperationLogs, 
} from "@/api/admin";

export const useAdminStore = defineStore("admin", () => {
  //  集市
  const market = ref(null);
  //  申请列表
  const applyList = ref([]);
  //  操作日志
  const logList = ref([]);
  const logLoading = ref(false);

  const loading = ref(false);

  // 集市相关
  async function fetchMarket() {
    const res = await getMyMarket();
    market.value = res.data;
  }

  // 申请相关
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

  //  操作日志相关
  async function fetchOperationLogs(start, end) {
    logLoading.value = true;
    try {
      const res = await getOperationLogs(start, end);
      logList.value = res.data;
    } finally {
      logLoading.value = false;
    }
  }

  // 全局刷新
  async function refreshAll() {
    loading.value = true;
    try {
      await Promise.all([fetchMarket(), fetchApplies()]);
    } finally {
      loading.value = false;
    }
  }

  return {
    market,
    applyList,
    logList,
    logLoading,
    loading,
    fetchMarket,
    fetchApplies,
    handleApprove,
    handleReject,
    fetchOperationLogs,
    refreshAll,
  };
});
