import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
// Element Plus 只注册页面实际使用的基础组件，避免把整套组件库打进首屏。
import {
  ElCol,
  ElCollapse,
  ElCollapseItem,
  ElForm,
  ElFormItem,
  ElIcon,
  ElRow,
  ElTable,
  ElTableColumn,
  ElTooltip,
} from 'element-plus'
// 路由
import './router/permission'
// 全局样式
import '@/assets/css/reset.css'
// 系统样式
import './style.css'
// Element Plus 按需样式（含程序化消息与确认框）。
import 'element-plus/theme-chalk/base.css'
import 'element-plus/theme-chalk/el-col.css'
import 'element-plus/theme-chalk/el-collapse.css'
import 'element-plus/theme-chalk/el-collapse-item.css'
import 'element-plus/theme-chalk/el-form.css'
import 'element-plus/theme-chalk/el-form-item.css'
import 'element-plus/theme-chalk/el-icon.css'
import 'element-plus/theme-chalk/el-message.css'
import 'element-plus/theme-chalk/el-message-box.css'
import 'element-plus/theme-chalk/el-row.css'
import 'element-plus/theme-chalk/el-table.css'
import 'element-plus/theme-chalk/el-table-column.css'
import 'element-plus/theme-chalk/el-tooltip.css'
import './styles/tokens.css'
import './styles/theme.css'
import './styles/workspace-pages.css'
import UiCard from '@/components/ui/UiCard.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiTag from '@/components/ui/UiTag.vue'
import UiEmpty from '@/components/ui/UiEmpty.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiImage from '@/components/ui/UiImage.vue'
import UiDivider from '@/components/ui/UiDivider.vue'
import UiAlert from '@/components/ui/UiAlert.vue'
import UiDialog from '@/components/ui/UiDialog.vue'
import UiInput from '@/components/ui/UiInput.vue'
import UiInputNumber from '@/components/ui/UiInputNumber.vue'
import UiSelect from '@/components/ui/UiSelect.vue'
import UiOption from '@/components/ui/UiOption.vue'
import UiDateInput from '@/components/ui/UiDateInput.vue'
import UiDrawer from '@/components/ui/UiDrawer.vue'
import UiSkeleton from '@/components/ui/UiSkeleton.vue'
import UiTable from '@/components/ui/UiTable.vue'
import UiTableColumn from '@/components/ui/UiTableColumn.vue'
import UiDropdown from '@/components/ui/UiDropdown.vue'
import UiFormItem from '@/components/ui/UiFormItem.vue'
import UiRadioGroup from '@/components/ui/UiRadioGroup.vue'
import UiRadio from '@/components/ui/UiRadio.vue'
import UiSwitch from '@/components/ui/UiSwitch.vue'

// 仅字符串动态菜单需要全局图标；页面内静态图标由各组件按需导入。
import {
  Avatar,
  Bell,
  Calendar,
  Check,
  Document,
  DocumentChecked,
  Goods,
  HomeFilled,
  House,
  InfoFilled,
  Lock,
  MapLocation,
  Promotion,
  Shop,
  ShoppingCart,
  Star,
  TrendCharts,
  User,
  Warning,
} from '@element-plus/icons-vue'

const app = createApp(App)
const elementComponents = {
  ElCol,
  ElCollapse,
  ElCollapseItem,
  ElForm,
  ElFormItem,
  ElIcon,
  ElRow,
  ElTable,
  ElTableColumn,
  ElTooltip,
}
const menuIcons = {
  Avatar,
  Bell,
  Calendar,
  Check,
  Document,
  DocumentChecked,
  Goods,
  HomeFilled,
  House,
  InfoFilled,
  Lock,
  MapLocation,
  Promotion,
  Shop,
  ShoppingCart,
  Star,
  TrendCharts,
  User,
  Warning,
}
Object.entries({ ...elementComponents, ...menuIcons }).forEach(([name, component]) => {
  app.component(name, component)
})

app.use(pinia)
app.use(router)
app.component('UiCard', UiCard)
app.component('UiButton', UiButton)
app.component('UiTag', UiTag)
app.component('UiEmpty', UiEmpty)
app.component('UiBadge', UiBadge)
app.component('UiImage', UiImage)
app.component('UiDivider', UiDivider)
app.component('UiAlert', UiAlert)
app.component('UiDialog', UiDialog)
app.component('UiInput', UiInput)
app.component('UiInputNumber', UiInputNumber)
app.component('UiSelect', UiSelect)
app.component('UiOption', UiOption)
app.component('UiDateInput', UiDateInput)
app.component('UiDrawer', UiDrawer)
app.component('UiSkeleton', UiSkeleton)
app.component('UiTable', UiTable)
app.component('UiTableColumn', UiTableColumn)
app.component('UiDropdown', UiDropdown)
app.component('UiFormItem', UiFormItem)
app.component('UiRadioGroup', UiRadioGroup)
app.component('UiRadio', UiRadio)
app.component('UiSwitch', UiSwitch)
app.mount('#app')
