import { createRouter, createWebHistory } from 'vue-router'
import constantRoutes from './constantRoutes'

// 404 兜底路由
const catchAllRoute = {
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: () => import('@/views/common/NotFound.vue'),
  meta: { title: '页面不存在' }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...constantRoutes,
    catchAllRoute
  ]
})

export default router