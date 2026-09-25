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
import './styles/tokens.css'
import './styles/theme.css'
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

// 全局注册图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}


app.use(pinia)
app.use(router)
app.use(ElementPlus)
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
