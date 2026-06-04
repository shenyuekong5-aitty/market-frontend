import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
// element-plus
import ElementPlus from 'element-plus'
// 路由
import './router/permission'
// 全局样式
import '@/assets/css/reset.css'
// 系统样式
import './style.css'
// element-plus样式
import 'element-plus/dist/index.css'

// 全局注册图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}


app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.mount('#app')