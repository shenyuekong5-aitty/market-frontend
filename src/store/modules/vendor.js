import { defineStore } from "pinia";
import { ref } from "vue";
import {
  getMyBooth,
  updateMyBooth,
  applyForBooth,
  applyChangeBooth,       
  applyReturnBooth, 
  getMyProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  uploadProductImage,
  getVendorReservations,
  confirmReservation,
  rejectReservation,
  getVendorOrders,
  getOrderItems,
} from "@/api/vendor";

export const useVendorStore = defineStore("vendor", () => {
  //  摊位
  const myBooth = ref(null);
  const boothLoading = ref(false);
  //  商品
  const productList = ref([]);
  const productLoading = ref(false);
  // 预定
  const vendorReservationList = ref([]);
  const vendorReservationLoading = ref(false);
  // 订单相关
  const vendorOrderList = ref([]);
  const vendorOrderLoading = ref(false);
  const vendorOrderItems = ref([]);
  const vendorOrderDetailVisible = ref(false);

  async function fetchMyBooth() {
    boothLoading.value = true;
    try {
      const res = await getMyBooth();
      myBooth.value = res.data;
    } catch (e) {
      console.error("获取摊位失败", e);
      throw e;
    } finally {
      boothLoading.value = false;
    }
  }

   // 更换摊位申请
  async function submitChangeBooth(targetBoothId) {
    await applyChangeBooth(targetBoothId)
    // 申请后不需要刷新摊位，因为我的摊位还是当前这个
  }

  // 归还摊位申请
  async function submitReturnBooth() {
    await applyReturnBooth()
    // 归还后，我的摊位可能会变成 null，重新拉一下
    await fetchMyBooth()
  }

  async function saveMyBooth(data) {
    await updateMyBooth(data);
    await fetchMyBooth();
  }

  async function submitBoothApplication(boothId) {
    await applyForBooth(boothId);
  }

  async function fetchProducts() {
    productLoading.value = true;
    try {
      const res = await getMyProducts();
      productList.value = res.data;
    } catch (e) {
      console.error("获取商品列表失败", e);
      throw e;
    } finally {
      productLoading.value = false;
    }
  }

  async function createProduct(data) {
    const res = await addProduct(data);
    await fetchProducts();
    return res;
  }

  async function editProduct(id, data) {
    await updateProduct(id, data);
    await fetchProducts();
  }

  async function removeProduct(id) {
    await deleteProduct(id);
    await fetchProducts();
  }

  async function switchProductStatus(id) {
    await toggleProductStatus(id);
    await fetchProducts();
  }

  async function uploadProductImg(formData) {
    const res = await uploadProductImage(formData);
    return res.data;
  }

  //  初始化
  async function init() {
    await fetchMyBooth();
    await fetchProducts();
  }

  //预定相关
  async function fetchVendorReservations() {
    vendorReservationLoading.value = true;
    try {
      const res = await getVendorReservations();
      vendorReservationList.value = res.data;
    } finally {
      vendorReservationLoading.value = false;
    }
  }

  async function handleConfirmReservation(id) {
    await confirmReservation(id);
    await fetchVendorReservations();
  }

  async function handleRejectReservation(id) {
    await rejectReservation(id);
    await fetchVendorReservations();
  }

  //订单相关
  async function fetchVendorOrders() {
    vendorOrderLoading.value = true;
    try {
      const res = await getVendorOrders();
      vendorOrderList.value = res.data;
    } finally {
      vendorOrderLoading.value = false;
    }
  }

  async function fetchVendorOrderItems(orderId) {
    try {
      const res = await getOrderItems(orderId);
      vendorOrderItems.value = res.data;
      vendorOrderDetailVisible.value = true;
    } catch (e) {
      throw e;
    }
  }

  function closeOrderDetail() {
    vendorOrderDetailVisible.value = false;
  }

  return {
    // 摊位
    myBooth,
    boothLoading,
    fetchMyBooth,
    saveMyBooth,
    submitBoothApplication,
    // 商品
    productList,
    productLoading,
    fetchProducts,
    createProduct,
    editProduct,
    removeProduct,
    switchProductStatus,
    uploadProductImg,
    // 初始化
    init,
    // 预定
    vendorReservationList,
    vendorReservationLoading,
    fetchVendorReservations,
    handleConfirmReservation,
    handleRejectReservation,
    // 订单相关
    vendorOrderList,
    vendorOrderLoading,
    vendorOrderItems,
    vendorOrderDetailVisible,
    fetchVendorOrders,
    fetchVendorOrderItems,
    closeOrderDetail,
    submitChangeBooth,
    submitReturnBooth
  };
});
