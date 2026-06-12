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
    const token = localStorage.getItem('token');
    if (token) {
      if (typeof token !== 'string' || token === '[object Object]' || token.length < 10) {
        console.error('检测到无效 token，清除并跳转登录:', token?.substring?.(0, 30));
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
        return Promise.reject(new Error('无效的登录凭证'));
      }
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('请求未携带 token:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
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
      console.error('API 错误响应:', {
        status: error.response.status,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        data: error.response.data
      });
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
