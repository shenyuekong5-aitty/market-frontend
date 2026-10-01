import router from "./index";
import { useUserStore } from "@/store/modules/user";
import { homePathForRole, isAdminRole } from "@/utils/roles";

const whiteList = ["Welcome", "About", "Discover", "Login", "Register", "Forbidden"];

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
      next({ path: homePathForRole(role) });
      return;
    }

    // ========== 3. 登录页重定向 ==========
    if (to.name === "Login") {
      const role = userStore.userInfo.role;
      next({ path: homePathForRole(role) });
      return;
    }

    // ========== 4. 权限检查 ==========
    if (to.meta.roles && !to.meta.roles.includes(userStore.userInfo.role)) {
      next({ name: "Forbidden" });
      return;
    }

    // ========== 5. 越权保护 ==========
    if (to.name === "NotFound" && to.path.startsWith("/admin")) {
      const role = userStore.userInfo.role;
      const superOnly = /^\/admin\/(manage|applies)(\/|$)/.test(to.path);
      const marketOnly = /^\/admin\/(dashboard|market|operation-log|income-stats)(\/|$)/.test(to.path);
      if (!isAdminRole(role) || (superOnly && role !== "super_admin")
          || (marketOnly && role !== "market_admin")) {
        next({ name: "Forbidden" });
        return;
      }
    }
    if (to.name === "NotFound" && to.fullPath.startsWith("/vendor") && userStore.userInfo.role !== "vendor") {
      next({ name: "Forbidden" });
      return;
    }

    next();
  } else {
    // 未登录
    if (to.path === "/") {
      next({ name: "Welcome", replace: true });
    } else if (whiteList.includes(to.name)) {
      next();
    } else {
      next({ name: "Login", query: { redirect: to.fullPath } });
    }
  }
});
