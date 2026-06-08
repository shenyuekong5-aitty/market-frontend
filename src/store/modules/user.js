import router from "@/router";
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { login as loginApi, getCurrentUser } from "@/api/auth";
import { getFullUrl } from '@/utils/urlHelper'
import {
  uploadAvatar,
  updateProfile,
  sendChangePhoneSms,
  sendResetPasswordSms,
  resetPassword,
  checkPhone,
  changePassword as changePasswordApi,
  deactivateAccount as deactivateApi,
} from "@/api/user";

import { createMarket, updateMarket, toggleMarketStatus } from "@/api/admin";

import { getRoleChildrenRoutes } from "@/router/asyncRoutes";

export const useUserStore = defineStore("user", () => {
  // localStorage 恢复状态
  const savedToken = localStorage.getItem("token") || "";
  const savedUserInfo = localStorage.getItem("userInfo");

  const token = ref(savedToken);
  const userInfo = ref(
    savedUserInfo
      ? JSON.parse(savedUserInfo)
      : {
          id: null,
          phone: "",
          username: "",
          nickname: "",
          avatar: "",
          role: "",
          status: 1,
          gender: 1,
          createTime: "",
        },
  );
  const dynamicAdded = ref(false);

  // 计算属性
  const isLoggedIn = computed(() => !!token.value);

  // 头像完整 URL（拼接后端地址，方便模板直接使用）
  const avatarFullUrl = computed(() => getFullUrl(userInfo.value.avatar))

  // 持久化函数
  function saveTokenToStorage() {
    if (token.value) {
      localStorage.setItem("token", token.value);
    } else {
      localStorage.removeItem("token");
    }
  }

  function saveUserInfoToStorage() {
    localStorage.setItem("userInfo", JSON.stringify(userInfo.value));
  }

  function clearStorage() {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
  }

  // 登录
  async function login(username, password, role) {
    const res = await loginApi(username, password, role);
    const data = res.data;
    setLoginData({
      token: data,
      username,
      role,
      nickname: username,
      avatar: "",
      id: null,
    });
    await fetchCurrentUser();
  }

  // 获取当前用户信息
  async function fetchCurrentUser() {
    try {
      const res = await getCurrentUser();
      if (res.data) {
        userInfo.value = {
          id: res.data.id,
          phone: res.data.phone || "",
          username: res.data.username,
          nickname: res.data.nickname || res.data.username,
          avatar: res.data.avatar || "",
          role: res.data.role,
          status: res.data.status,
          gender: res.data.gender ?? 1,
          createTime: res.data.createTime,
        };
        saveUserInfoToStorage(); // 保存到 localStorage
      }
    } catch (error) {
      console.error("获取用户信息失败", error);
    }
  }

  // 设置登录数据
  function setLoginData(data) {
    token.value = data.token;
    userInfo.value = {
      id: data.id || null,
      phone: data.phone || "",
      username: data.username || "",
      nickname: data.nickname || data.username || "",
      avatar: data.avatar || "",
      role: data.role || "",
      status: data.status !== undefined ? data.status : 1,
    };
    saveTokenToStorage();
    saveUserInfoToStorage();
  }

  // 退出登录
  function logout() {
    token.value = "";
    userInfo.value = {};
    dynamicAdded.value = false;
    clearStorage(); // 清空 localStorage
    window.location.href = "/login";
  }

  // 修改用户资料
  async function updateUserProfile(params) {
    let avatarPath = userInfo.value.avatar;
    if (params.avatarFile) {
      const formData = new FormData();
      formData.append("file", params.avatarFile);
      const uploadRes = await uploadAvatar(formData);
      avatarPath = uploadRes.data;
    }

    const requestData = {
      nickname: params.nickname,
      avatar: avatarPath,
      gender: params.gender,
    };
    if (params.newPhone) {
      requestData.newPhone = params.newPhone;
      requestData.phoneCode = params.phoneCode;
      requestData.confirmPassword = params.confirmPassword;
    }

    const res = await updateProfile(requestData);
    const updatedUser = res.data;

    setLoginData({
      token: token.value,
      id: updatedUser.id,
      username: updatedUser.username,
      nickname: updatedUser.nickname,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      phone: updatedUser.phone,
      gender: updatedUser.gender,
      status: updatedUser.status,
    });
    return updatedUser;
  }

  // 忘记密码相关
  async function sendResetPasswordCode(phone) {
    await sendResetPasswordSms(phone);
  }

  async function resetPasswordByPhone(phone, code, newPassword) {
    await resetPassword(phone, code, newPassword);
  }

  // 修改密码（登录状态）
  async function changePassword(oldPassword, newPassword) {
    await changePasswordApi(oldPassword, newPassword);
  }

  // 检查手机号是否已注册
  async function isPhoneRegistered(phone) {
    const res = await checkPhone(phone);
    return res.data;
  }

  // 动态路由添加
  function addDynamicRoutes(role) {
    if (dynamicAdded.value) return; // 内存中的标记，刷新后自动消失

    const children = getRoleChildrenRoutes(role);
    children.forEach((child) => {
      router.addRoute("Layout", child);
    });

    // 确保 404 在最后
    router.removeRoute("NotFound");
    router.addRoute({
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("@/views/common/NotFound.vue"),
      meta: { title: "页面不存在" },
    });

    dynamicAdded.value = true;
  }

  // 注销账号
  async function deactivateAccount() {
    await deactivateApi();
  }

  //市场模块
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
    // 刷新集市信息
    await fetchMarket();
  }
  return {
    token,
    userInfo,
    dynamicAdded,
    isLoggedIn,
    avatarFullUrl,
    login,
    fetchCurrentUser,
    setLoginData,
    logout,
    updateUserProfile,
    sendResetPasswordCode,
    resetPasswordByPhone,
    changePassword,
    isPhoneRegistered,
    addDynamicRoutes,
    deactivateAccount,
    handleCreateMarket,
    handleUpdateMarket,
    handleToggleStatus,
  };
});
