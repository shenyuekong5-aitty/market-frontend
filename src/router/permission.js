import router from "./index";
import { useUserStore } from "@/store/modules/user";

const whiteList = ["Login", "Register", "Forbidden"];

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  if (userStore.isLoggedIn) {
    // ========== 1. 确保动态路由已添加 ==========
    if (!userStore.dynamicAdded) {
      userStore.addDynamicRoutes(userStore.userInfo.role);
      // 重新进入守卫，此时 dynamicAdded 变为 true，动态路由已就绪
      next({ path: to.fullPath, replace: true });
      return;
    }

    // ========== 2. 根路径重定向 ==========
    if (to.path === "/") {
      const role = userStore.userInfo.role;
      if (role === "admin") next({ name: "AdminDashboard" });
      else if (role === "vendor") next({ name: "VendorHome" });
      else next({ name: "MarketList" });
      return;
    }

    // ========== 3. 登录页重定向 ==========
    if (to.name === "Login") {
      const role = userStore.userInfo.role;
      if (role === "admin") next({ name: "AdminDashboard" });
      else if (role === "vendor") next({ name: "VendorHome" });
      else next({ name: "MarketList" });
      return;
    }

    // ========== 4. 权限检查 ==========
    if (to.meta.roles && !to.meta.roles.includes(userStore.userInfo.role)) {
      next({ name: "Forbidden" });
      return;
    }

    // ========== 5. 越权保护 ==========
    if (to.name === "NotFound" && to.fullPath.startsWith("/admin") && userStore.userInfo.role !== "admin") {
      next({ name: "Forbidden" });
      return;
    }
    if (to.name === "NotFound" && to.fullPath.startsWith("/vendor") && userStore.userInfo.role !== "vendor") {
      next({ name: "Forbidden" });
      return;
    }

    next();
  } else {
    // 未登录
    if (whiteList.includes(to.name)) {
      next();
    } else {
      next({ name: "Login", query: { redirect: to.fullPath } });
    }
  }
});