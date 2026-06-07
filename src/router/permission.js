import router from "./index";
import { useUserStore } from "@/store/modules/user";
import { getRoleChildrenRoutes } from "./asyncRoutes";

// 不需要登录就能访问的路由名称（白名单）
const whiteList = ["Login", "Register", "NotFound", "Forbidden"];

// 静态路由名称集合（包括 Layout 父路由、Profile 等），这些路由不会被移除
const staticRouteNames = [
  "Login",
  "Register",
  "Profile",
  "Forbidden",
  "Layout",
  "NotFound",
];

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  // 已登录
  if (userStore.isLoggedIn) {
    if (to.name === "Login") {
      // 已登录用户访问登录页，跳转到对应主页
      const role = userStore.userInfo.role;
      if (role === "admin") next({ name: "AdminDashboard" });
      else if (role === "vendor") next({ name: "VendorHome" });
      else next({ name: "MarketList" });
    } else {
      // 首次登录时动态添加路由
      if (!userStore.dynamicAdded) {
        // 清理之前可能残留的动态路由
        const currentRoutes = router.getRoutes();
        currentRoutes.forEach((route) => {
          if (route.name && !staticRouteNames.includes(route.name)) {
            router.removeRoute(route.name);
          }
        });

        // 添加当前角色对应的子路由到 Layout 下
        const children = getRoleChildrenRoutes(userStore.userInfo.role);
        children.forEach((child) => {
          router.addRoute("Layout", child);
        });

        userStore.dynamicAdded = true;

        // 确保 404 永远是最后一条路由
        router.removeRoute("NotFound");
        router.addRoute({
          path: "/:pathMatch(.*)*",
          name: "NotFound",
          component: () => import("@/views/common/NotFound.vue"),
          meta: { title: "页面不存在" },
        });
        next({ ...to, replace: true });
      } else {
        // 如果路由定义了 roles，并且当前角色的权限不符合，直接去 403
        if (to.meta.roles && !to.meta.roles.includes(userStore.userInfo.role)) {
          next({ name: "Forbidden" });
        }
        // 避免用户在地址栏乱输入其它角色的路径导致不可预期的行为
        else if (
          to.name === "NotFound" &&
          to.fullPath.startsWith("/admin") &&
          userStore.userInfo.role !== "admin"
        ) {
          next({ name: "Forbidden" });
        } else if (
          to.name === "NotFound" &&
          to.fullPath.startsWith("/vendor") &&
          userStore.userInfo.role !== "vendor"
        ) {
          next({ name: "Forbidden" });
        } else {
          next();
        }
      }
    }
  } else {
    // 未登录
    if (whiteList.includes(to.name)) {
      next();
    } else {
      next({ name: "Login", query: { redirect: to.fullPath } });
    }
  }
});
