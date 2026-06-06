import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { login as loginApi, getCurrentUser } from "@/api/auth";
import { uploadAvatar, updateProfile } from "@/api/user";

export const useUserStore = defineStore(
  "user",
  () => {
    // 状态定义
    const token = ref("");
    const userInfo = ref({
      id: null,
      phone: "",
      username: "",
      nickname: "",
      avatar: "",
      role: "",
      status: 1,
    });
    const dynamicAdded = ref(false);

    // 计算属性
    const isLoggedIn = computed(() => !!token.value);

    // 头像完整 URL（拼接后端地址，方便模板直接使用）
    const avatarFullUrl = computed(() => {
      if (userInfo.value.avatar) {
        return `http://localhost:8088${userInfo.value.avatar}`;
      }
      return "";
    });

    // 登陆函数
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

    // 获取用户信息
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
          };
        }
      } catch (error) {
        console.error("获取用户信息失败", error);
      }
    }

    // 置空用户信息
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
    }

    // 退出登录
    function logout() {
      // 清空状态（插件会自动同步 localStorage）
      token.value = "";
      userInfo.value = {};
      dynamicAdded.value = false;
      // 强制跳转登录页并刷新，确保路由表重置
      window.location.href = "/login";
    }

    // 修改用户资料
    /**
     * @param {Object} params
     * @param {String} params.nickname
     * @param {Number} params.gender
     * @param {File|null} params.avatarFile - 新头像文件对象，选填
     * @param {String|null} params.newPhone - 新手机号，选填
     * @param {String|null} params.phoneCode - 手机验证码，选填
     * @param {String|null} params.confirmPassword - 确认密码，选填
     */
    async function updateUserProfile(params) {
      let avatarPath = userInfo.value.avatar; // 默认保留原头像

      // 1. 如果有新头像文件，先上传获取路径
      if (params.avatarFile) {
        const formData = new FormData();
        formData.append("file", params.avatarFile);
        const uploadRes = await uploadAvatar(formData);
        avatarPath = uploadRes.data; // 返回的路径如 /uploads/avatar/...
      }

      // 2. 构建请求数据
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

      // 3. 提交修改
      const res = await updateProfile(requestData);
      const updatedUser = res.data;

      // 4. 更新本地 store（同步到界面）
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
    };
  },
  {
    // persist 配置：持久化哪些状态
    persist: {
      key: "user-store", // localStorage 的 key
      storage: localStorage, // 存储方式
      paths: ["token", "userInfo"], // 只持久化 token 和 userInfo
    },
  },
);
