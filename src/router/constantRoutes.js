const constantRoutes = [
  // 静态 Layout 父路由，子路由将在登录后动态添加
  {
    path: "/",
    name: "Layout",
    component: () => import("@/layout/Layout.vue"),
    children: [
      {
        path: "/profile",
        name: "Profile",
        component: () => import("@/views/common/Profile.vue"),
        meta: {
          title: "个人信息",
          icon: "User",
          roles: ["admin", "vendor", "user"],
        },
      },
    ], // 初始为空，动态添加
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/common/Login.vue"),
    meta: { title: "登录", icon: "Lock" },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/common/Register.vue"),
    meta: { title: "注册", icon: "EditPen" },
  },
  // 追加为所有角色的子路由
  // {
  //   path: '/profile',
  //   name: 'Profile',
  //   component: () => import('@/views/common/Profile.vue'),
  //   meta: { title: '个人信息', icon: 'User', requiresAuth: true }
  // },
  {
    path: "/403",
    name: "Forbidden",
    component: () => import("@/views/common/Forbidden.vue"),
    meta: { title: "无权限", icon: "WarningFilled" },
  },
];

export default constantRoutes;
