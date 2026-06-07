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
  toggleMarketStatus     
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
  };
});