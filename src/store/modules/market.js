import { defineStore } from "pinia";
import { ref } from "vue";
import { getEnabledMarkets, getFreeBooths, getAllBooths  } from "@/api/vendor";

export const useMarketStore = defineStore("market", () => {
  const marketList = ref([]);
  const currentMarket = ref(null);
  const boothList = ref([]);
  const loading = ref(false);

  // 获取启用集市列表
  async function fetchMarkets() {
    loading.value = true;
    try {
      const res = await getEnabledMarkets();
      marketList.value = res.data;
    } finally {
      loading.value = false;
    }
  }

  // 获取指定集市的空闲摊位
  async function fetchFreeBooths(marketId) {
    loading.value = true;
    try {
      const res = await getFreeBooths(marketId);
      boothList.value = res.data;
    } finally {
      loading.value = false;
    }
  }

  //获取所有集市
  async function fetchAllBooths(marketId) {
    loading.value = true;
    try {
      const res = await getAllBooths(marketId);
      boothList.value = res.data;
    } finally {
      loading.value = false;
    }
  }

  // 设置当前集市（从列表中匹配）
  function setCurrentMarketById(marketId) {
    currentMarket.value =
      marketList.value.find((m) => m.id === marketId) || null;
  }

  return {
    marketList,
    currentMarket,
    boothList,
    loading,
    fetchMarkets,
    fetchFreeBooths,
    fetchAllBooths,
    setCurrentMarketById,
  };
});
