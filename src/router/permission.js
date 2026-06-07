import router from "./index";
import { useUserStore } from "@/store/modules/user";

const whiteList = ["Login", "Register", "Forbidden"];

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  if (userStore.isLoggedIn) {
    if (to.name === "Login") {
      // 已登录用户访问登录页，跳转到主页
      const role = userStore.userInfo.role;
      if (role === "admin") next({ name: "AdminDashboard" });
      else if (role === "vendor") next({ name: "VendorHome" });
      else next({ name: "MarketList" });
      return;
    }

    // 动态路由尚未添加时，重新添加（刷新后 dynamicAdded 为 false）
    if (!userStore.dynamicAdded) {
      userStore.addDynamicRoutes(userStore.userInfo.role);
      next({ path: to.fullPath, replace: true });
      return;
    }

    // 权限检查
    if (to.meta.roles && !to.meta.roles.includes(userStore.userInfo.role)) {
      next({ name: "Forbidden" });
      return;
    }
    // 越权检查
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