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
// element-plus样式
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.mount('#app')