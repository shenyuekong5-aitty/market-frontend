// src/utils/request.js
import axios from "axios";
import { ElMessage } from "element-plus";
import router from "@/router";
import { useUserStore } from "@/store/modules/user";

// 创建 axios 实例
const request = axios.create({
  baseURL: "http://localhost:8088/api", // 后端 API 基础地址
  timeout: 10000, // 10 秒超时
});

// 请求拦截器：每次请求前自动添加 token
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器：统一处理错误
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code === 200) {
      return res;
    } else {
      ElMessage.error(res.message || "请求失败");
      return Promise.reject(new Error(res.message || "请求失败"));
    }
  },
  (error) => {
    let message = "网络连接失败，请检查网络";
    if (error.response && error.response.data) {
      // 优先取 message，其次取 error，最后取默认
      message =
        error.response.data.message || error.response.data.error || message;
    }

    // 特殊状态码处理
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = "登录已过期，请重新登录";
          const userStore = useUserStore();
          userStore.logout();
          router.push("/login");
          break;
        case 403:
          message = "没有权限访问";
          router.push("/403");
          break;
      }
    }

    ElMessage.error(message);
    return Promise.reject(new Error(message)); // 关键：把具体消息传出去
  },
);

export default request;
