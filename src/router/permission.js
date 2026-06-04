import router from "./index";
import { useUserStore } from "@/store/modules/user";
import { getRoleChildrenRoutes } from "./asyncRoutes";

// 不需要登录就能访问的路由名称
const whiteList = ["Login", "Register", "NotFound", "Forbidden"];

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
        const children = getRoleChildrenRoutes(userStore.userInfo.role)
        // 将子路由添加到名为 'Layout' 的父路由下
        children.forEach(child => {
          router.addRoute('Layout', child)
        })

        userStore.dynamicAdded = true;

        // 确保 404 永远是最后一条路由
        router.removeRoute("NotFound");
        router.addRoute({
          path: "/:pathMatch(.*)*",
          name: "NotFound",
          component: () => import("@/views/common/NotFound.vue"),
          meta: { title: "页面不存在" },
        });

        // 重新匹配当前路由，避免白屏
        next({ ...to, replace: true });
      } else {
        // 检查角色权限
        if (to.meta.roles && !to.meta.roles.includes(userStore.userInfo.role)) {
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
