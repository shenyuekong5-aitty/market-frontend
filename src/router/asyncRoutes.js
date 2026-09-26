import Layout from "@/layout/Layout.vue";

// 集市管理员路由（只管理本人所属集市）
const marketAdminRoutes = [
  {
    path: "admin/dashboard",
    name: "AdminDashboard",
    component: () => import("@/views/admin/Dashboard.vue"),
    meta: { title: "集市工作台", icon: "HomeFilled", roles: ["market_admin"] },
  },
  {
    path: "admin/market/list",
    name: "AdminMarketList",
    component: () => import("@/views/admin/MarketList.vue"),
    meta: { title: "集市管理", icon: "Shop", roles: ["market_admin"] },
  },
  {
    path: "admin/market/:id",
    name: "AdminMarketDetail",
    component: () => import("@/views/admin/MarketDetail.vue"),
    meta: {
      title: "集市详情",
      icon: "InfoFilled",
      roles: ["market_admin"],
      hidden: true,
    },
  },
  {
    path: "admin/operation-log",
    name: "AdminOperationLog",
    component: () => import("@/views/admin/OperationLog.vue"),
    meta: { title: "操作日志", icon: "DocumentChecked", roles: ["market_admin"] },
  },
  {
    path: "admin/income-stats",
    name: "AdminIncomeStats",
    component: () => import("@/views/admin/IncomeStats.vue"),
    meta: { title: "收入统计", icon: "TrendCharts", roles: ["market_admin"] },
  },
  {
    path: "admin/messages",
    name: "AdminMessages",
    component: () => import("@/views/admin/Messages.vue"),
    meta: { title: "消息中心", icon: "Bell", roles: ["market_admin", "super_admin"] },
  },
];

const superAdminRoutes = [
  {
    path: "admin/manage",
    name: "AdminManage",
    component: () => import("@/views/admin/AdminManage.vue"),
    meta: { title: "管理员管理", icon: "Avatar", roles: ["super_admin"] },
  },
  {
    path: "admin/applies",
    name: "SuperAdminApplies",
    component: () => import("@/views/admin/SuperAdminApplies.vue"),
    meta: { title: "全平台审批", icon: "DocumentChecked", roles: ["super_admin"] },
  },
  marketAdminRoutes.find(route => route.name === "AdminMessages"),
];

// 小贩路由（作为 Layout 的 children）
const vendorRoutes = [
  {
    path: "vendor/home",
    name: "VendorHome",
    component: () => import("@/views/vendor/Home.vue"),
    meta: { title: "工作台", icon: "HomeFilled", roles: ["vendor"] },
  },
  {
    path: "vendor/market-select",
    name: "VendorMarketSelect",
    component: () => import("@/views/vendor/MarketSelect.vue"),
    meta: { title: "选择入驻集市", icon: "MapLocation", roles: ["vendor"] },
  },
  {
    path: "vendor/my-booth",
    name: "VendorMyBooth",
    component: () => import("@/views/vendor/MyBooth.vue"),
    meta: { title: "我的摊位", icon: "House", roles: ["vendor"] },
  },
  {
    path: "vendor/goods",
    name: "VendorGoods",
    component: () => import("@/views/vendor/Goods.vue"),
    meta: { title: "商品管理", icon: "Goods", roles: ["vendor"] },
  },
  {
    path: "vendor/reservations",
    name: "VendorReservations",
    component: () => import("@/views/vendor/Reservations.vue"),
    meta: { title: "预定处理", icon: "Calendar", roles: ["vendor"] },
  },
  {
    path: "vendor/orders",
    name: "VendorOrders",
    component: () => import("@/views/vendor/Orders.vue"),
    meta: { title: "订单查看", icon: "Document", roles: ["vendor"] },
  },
  {
    path: "vendor/income-stats",
    name: "VendorIncomeStats",
    component: () => import("@/views/vendor/IncomeStats.vue"),
    meta: { title: "收入统计", icon: "TrendCharts", roles: ["vendor"] },
  },
];

// 普通用户路由（作为 Layout 的 children，path 不带 /）
const userRoutes = [
  {
    path: "markets",
    name: "MarketList",
    component: () => import("@/views/user/MarketList.vue"),
    meta: { title: "集市列表", icon: "Shop", roles: ["user"] },
  },
  {
    path: "market/:id",
    name: "MarketDetail",
    component: () => import("@/views/user/MarketDetail.vue"),
    meta: { title: "集市摊位", icon: "House", roles: ["user"], hidden: true },
  },
  {
    path: "booth/:id",
    name: "BoothDetail",
    component: () => import("@/views/user/BoothDetail.vue"),
    meta: {
      title: "摊位详情",
      icon: "InfoFilled",
      roles: ["user"],
      hidden: true,
    },
  },
  {
    path: "cart",
    name: "Cart",
    component: () => import("@/views/user/Cart.vue"),
    meta: { title: "购物车", icon: "ShoppingCart", roles: ["user"] },
  },
  {
    path: "orders",
    name: "MyOrders",
    component: () => import("@/views/user/Orders.vue"),
    meta: { title: "我的订单", icon: "Document", roles: ["user"] },
  },
  {
    path: "follows",
    name: "Follows",
    component: () => import("@/views/user/Follows.vue"),
    meta: { title: "我的关注", icon: "Star", roles: ["user"] },
  },
  {
    path: "reservations",
    name: "MyReservations",
    component: () => import("@/views/user/Reservations.vue"),
    meta: { title: "我的预定", icon: "Calendar", roles: ["user"] },
  },
];

// 共享路由（作为 Layout 的子路由）
const sharedRoutes = [
  {
    path: "profile",
    name: "SharedProfile",
    component: () => import("@/views/common/Profile.vue"),
    meta: { title: "个人信息", icon: "User", roles: ["super_admin", "market_admin", "user", "vendor"] },
  },
  {
    path: "messages",
    name: "SharedMessages",
    component: () => import("@/views/user/Messages.vue"),
    meta: { title: "消息中心", icon: "Bell", roles: ["user", "vendor"] },
  },
];

// 根据角色获取子路由数组
export function getRoleChildrenRoutes(role) {
  if (role === "super_admin") return superAdminRoutes;
  if (role === "market_admin") return marketAdminRoutes;
  if (role === "vendor") return vendorRoutes;
  if (role === "user") return userRoutes;
  return [];
}

export { superAdminRoutes, marketAdminRoutes, vendorRoutes, userRoutes, sharedRoutes };
