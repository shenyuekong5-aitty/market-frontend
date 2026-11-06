<template>
  <div class="profile-page" :class="`role-${roleKey}`">
    <PageHeading title="个人中心" description="管理个人资料、账号安全与常用操作。" eyebrow="ACCOUNT / 账号" />
    <section class="profile-hero">
      <div class="hero-glow hero-glow-one" />
      <div class="hero-glow hero-glow-two" />
      <div class="hero-main">
        <div class="identity-block">
          <div class="avatar-shell">
            <img v-if="userStore.avatarFullUrl" :src="userStore.avatarFullUrl" class="profile-avatar" alt="头像" />
            <span v-else class="profile-avatar avatar-fallback">{{ initials }}</span>
            <span class="online-dot" :class="{ 'is-offline': userStore.userInfo.status !== 1 }" />
          </div>
          <div class="identity-copy">
            <span class="eyebrow">{{ profileCopy.eyebrow }}</span>
            <h1>{{ userStore.userInfo.nickname || '未设置昵称' }}</h1>
            <p>{{ profileCopy.description }}</p>
            <div class="identity-meta">
              <span><User class="meta-icon" /> {{ userStore.userInfo.username || '未设置账号' }}</span>
              <span><CircleCheck class="meta-icon" /> {{ roleText }}</span>
            </div>
          </div>
        </div>
        <div class="hero-actions">
          <UiButton type="primary" :icon="Edit" @click="editProfileRef?.open()">编辑资料</UiButton>
          <UiButton plain :icon="Monitor" @click="checkAccountRef?.open()">安全检测</UiButton>
        </div>
      </div>
      <div class="hero-stats">
        <div v-for="metric in profileMetrics" :key="metric.label" class="hero-stat">
          <span class="stat-label">{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
          <span class="stat-note">{{ metric.note }}</span>
        </div>
      </div>
    </section>

    <div class="profile-content-grid">
      <UiCard class="profile-card details-card">
        <template #header>
          <div class="section-heading"><div><span class="section-kicker">PROFILE</span><h2>个人资料</h2></div><span class="section-index">01</span></div>
        </template>
        <div class="detail-list">
          <div v-for="item in profileDetails" :key="item.label" class="detail-row">
            <span class="detail-label">{{ item.label }}</span>
            <span class="detail-value" :class="{ 'is-muted': !item.value }">{{ item.value || '未设置' }}</span>
          </div>
        </div>
      </UiCard>

      <UiCard class="profile-card security-card">
        <template #header>
          <div class="section-heading"><div><span class="section-kicker">SECURITY</span><h2>账号安全</h2></div><span class="security-score">{{ securityScore }}<small>/100</small></span></div>
        </template>
        <div class="security-intro">
          <div class="security-ring" :class="securityTone"><CircleCheck /></div>
          <div><strong>{{ securityTitle }}</strong><p>{{ securityDescription }}</p></div>
        </div>
        <div class="security-list">
          <div v-for="item in securityItems" :key="item.label" class="security-row">
            <span class="security-state" :class="item.tone"><component :is="item.icon" /></span>
            <span>{{ item.label }}</span><span class="security-value">{{ item.value }}</span>
          </div>
        </div>
      </UiCard>

      <UiCard v-if="roleKey === 'market_admin' || roleKey === 'vendor'" class="profile-card role-card">
        <template #header>
          <div class="section-heading">
            <div><span class="section-kicker">{{ roleKey === 'market_admin' ? 'MARKET SPACE' : 'BUSINESS SPACE' }}</span><h2>{{ roleKey === 'market_admin' ? '集市管理' : '摊位经营' }}</h2></div>
            <UiTag :type="roleKey === 'market_admin' ? 'primary' : 'warning'">{{ roleKey === 'market_admin' ? '集市管理员' : '经营者' }}</UiTag>
          </div>
        </template>
        <div class="role-summary">
          <div class="role-mark"><Shop /></div>
          <div><strong>{{ roleKey === 'market_admin' ? adminStore.market?.name || '尚未配置集市' : vendorStore.myBooth?.title || '尚未分配摊位' }}</strong><p>{{ roleKey === 'market_admin' ? adminStore.market?.location || '完善集市信息后即可开始管理' : vendorStore.myBooth?.position || '申请摊位后即可开始经营' }}</p></div>
        </div>
        <div class="role-facts">
          <div><span>当前状态</span><strong>{{ roleKey === 'market_admin' ? marketStatus : boothStatus }}</strong></div>
          <div><span>{{ roleKey === 'market_admin' ? '待处理申请' : '商品数量' }}</span><strong>{{ roleKey === 'market_admin' ? adminStore.applyList.length : vendorStore.productList.length }}</strong></div>
        </div>
      </UiCard>

      <UiCard class="profile-card actions-card">
        <template #header>
          <div class="section-heading"><div><span class="section-kicker">QUICK ACTIONS</span><h2>快捷操作</h2></div><span class="section-index">02</span></div>
        </template>
        <div class="action-grid">
          <button v-for="action in actions" :key="action.title" type="button" class="action-tile" :class="action.tone" @click="action.handler">
            <span class="action-icon"><component :is="action.icon" /></span>
            <span class="action-copy"><strong>{{ action.title }}</strong><small>{{ action.description }}</small></span>
            <ArrowRight class="action-arrow" />
          </button>
        </div>
      </UiCard>
    </div>

    <EditProfile ref="editProfileRef" />
    <UpdatePassword ref="updatePasswordRef" />
    <CheckAccount ref="checkAccountRef" />
  </div>
</template>

<script setup>
import PageHeading from '@/components/PageHeading.vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowRight, CircleCheck, CircleClose, Delete, Edit, Lock, Monitor, Shop, SwitchButton, User, Warning } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { useAdminStore } from '@/store/modules/admin'
import { useVendorStore } from '@/store/modules/vendor'
import EditProfile from '@/layout/TopBar/EditProfile.vue'
import UpdatePassword from '@/layout/TopBar/UpdatePassword.vue'
import CheckAccount from '@/components/CheckAccount.vue'

const router = useRouter()
const userStore = useUserStore()
const adminStore = useAdminStore()
const vendorStore = useVendorStore()
const editProfileRef = ref(null)
const updatePasswordRef = ref(null)
const checkAccountRef = ref(null)

const roleKey = computed(() => userStore.userInfo.role || 'user')
const initials = computed(() => (userStore.userInfo.nickname || userStore.userInfo.username || 'U').slice(0, 1).toUpperCase())
const roleText = computed(() => ({ super_admin: '超级管理员', market_admin: '集市管理员', vendor: '摊位经营者', user: '普通用户' }[roleKey.value] || '平台用户'))
const genderText = computed(() => ({ 0: '女', 1: '男', 2: '保密' }[userStore.userInfo.gender] || '未设置'))
const statusText = computed(() => userStore.userInfo.status === 1 ? '正常' : '已停用')
const profileCopy = computed(() => ({
  super_admin: { eyebrow: 'PLATFORM CONTROL', description: '管理平台管理员账号与跨集市审批。' },
  market_admin: { eyebrow: 'MARKET CONTROL', description: '管理所属集市、摊位与申请。' },
  vendor: { eyebrow: 'BUSINESS SPACE', description: '整理经营资料，专注于你的摊位与商品。' },
  user: { eyebrow: 'PERSONAL SPACE', description: '管理你的账号资料，保持账户安全与活跃。' },
}[roleKey.value] || { eyebrow: 'PERSONAL SPACE', description: '管理你的账号资料与账户安全。' }))

const formatDate = (value) => value ? String(value).replace('T', ' ').slice(0, 16) : '未记录'
const daysSince = (value) => { if (!value) return '—'; const diff = Math.max(0, Date.now() - new Date(value).getTime()); return Number.isFinite(diff) ? `${Math.floor(diff / 86400000)} 天` : '—' }
const marketStatus = computed(() => adminStore.market?.status === 1 || adminStore.market?.status === '启用' ? '营业中' : adminStore.market ? '已停用' : '待配置')
const boothStatus = computed(() => {
  if (!vendorStore.myBooth) return '待申请'
  if (vendorStore.myBooth.status === '已占用') return '经营中'
  return vendorStore.myBooth.status || '待处理'
})

const profileMetrics = computed(() => {
  if (roleKey.value === 'super_admin') return [{ label: '管理员账号', value: adminStore.adminList.length, note: '平台管理员' }, { label: '待处理申请', value: adminStore.applyList.length, note: '跨集市审批' }, { label: '账号状态', value: statusText.value, note: `注册于 ${daysSince(userStore.userInfo.createTime)} 前` }]
  if (roleKey.value === 'market_admin') return [{ label: '集市状态', value: marketStatus.value, note: adminStore.market?.name || '管理空间' }, { label: '待处理申请', value: adminStore.applyList.length, note: '需要及时关注' }, { label: '账号状态', value: statusText.value, note: `注册于 ${daysSince(userStore.userInfo.createTime)} 前` }]
  if (roleKey.value === 'vendor') return [{ label: '摊位状态', value: boothStatus.value, note: vendorStore.myBooth?.title || '经营空间' }, { label: '在售商品', value: vendorStore.productList.filter(item => item.saleStatus === '上架').length, note: '商品管理' }, { label: '账号状态', value: statusText.value, note: `注册于 ${daysSince(userStore.userInfo.createTime)} 前` }]
  return [{ label: '账号状态', value: statusText.value, note: '账户运行正常' }, { label: '手机绑定', value: userStore.userInfo.phone ? '已绑定' : '未绑定', note: '建议完成绑定' }, { label: '加入平台', value: daysSince(userStore.userInfo.createTime), note: formatDate(userStore.userInfo.createTime) }]
})

const profileDetails = computed(() => {
  const common = [{ label: '登录账号', value: userStore.userInfo.username }, { label: '手机号码', value: userStore.userInfo.phone || '未绑定' }, { label: '性别', value: genderText.value }, { label: '注册时间', value: formatDate(userStore.userInfo.createTime) }]
  if (roleKey.value === 'super_admin') return [{ label: '当前身份', value: roleText.value }, ...common, { label: '管理范围', value: '全平台' }]
  if (roleKey.value === 'market_admin') return [{ label: '当前身份', value: roleText.value }, ...common, { label: '管理集市', value: adminStore.market?.name || '尚未配置' }]
  if (roleKey.value === 'vendor') return [{ label: '当前身份', value: roleText.value }, ...common, { label: '经营摊位', value: vendorStore.myBooth?.title || '尚未分配' }]
  return [{ label: '当前身份', value: roleText.value }, ...common]
})

const securityScore = computed(() => 60 + (userStore.userInfo.phone ? 20 : 0) + (userStore.userInfo.nickname ? 10 : 0) + (userStore.userInfo.avatar ? 10 : 0))
const securityTone = computed(() => securityScore.value >= 80 ? 'is-good' : 'is-warning')
const securityTitle = computed(() => securityScore.value >= 80 ? '账号状态良好' : '还有空间可以完善')
const securityDescription = computed(() => securityScore.value >= 80 ? '关键账号信息已完成基础保护。' : '补充手机号或头像，可以提升账号识别度。')
const securityItems = computed(() => [
  { label: '账号状态', value: statusText.value, tone: userStore.userInfo.status === 1 ? 'is-good' : 'is-danger', icon: userStore.userInfo.status === 1 ? CircleCheck : CircleClose },
  { label: '手机号绑定', value: userStore.userInfo.phone ? '已完成' : '待完善', tone: userStore.userInfo.phone ? 'is-good' : 'is-warning', icon: userStore.userInfo.phone ? CircleCheck : Warning },
  { label: '最近更新', value: formatDate(userStore.userInfo.updateTime || userStore.userInfo.createTime), tone: 'is-neutral', icon: CircleCheck },
])

const handleLogout = () => { ElMessageBox.confirm('退出后将回到登录页面，未提交的内容请先保存。', '退出当前账号', { confirmButtonText: '确认退出', cancelButtonText: '继续使用', type: 'warning', customClass: 'market-confirm-dialog' }).then(() => { userStore.logout(); ElMessage.success('已退出登录'); router.push('/login') }).catch(() => {}) }
const handleDeactivate = () => { ElMessageBox.confirm('注销后可通过忘记密码重新激活，确定继续吗？', '注销账号', { confirmButtonText: '确认注销', cancelButtonText: '保留账号', type: 'warning', customClass: 'market-confirm-dialog is-danger' }).then(async () => { try { await userStore.deactivateAccount(); ElMessage.success('账号已注销'); userStore.logout() } catch (error) { ElMessage.error(error.message || '注销失败') } }).catch(() => {}) }
const actions = computed(() => [
  { title: '编辑资料', description: '更新头像、昵称与性别', icon: Edit, tone: 'tone-primary', handler: () => editProfileRef.value?.open() },
  { title: '修改密码', description: '定期更换登录密码', icon: Lock, tone: 'tone-success', handler: () => updatePasswordRef.value?.open() },
  { title: '账号检测', description: '查看当前安全状态', icon: Monitor, tone: 'tone-warning', handler: () => checkAccountRef.value?.open() },
  { title: '退出登录', description: '安全退出当前账号', icon: SwitchButton, tone: 'tone-neutral', handler: handleLogout },
  { title: '注销账号', description: '永久停用当前账户', icon: Delete, tone: 'tone-danger', handler: handleDeactivate },
])

onMounted(async () => {
  if (roleKey.value === 'super_admin') {
    adminStore.fetchAdminList().catch(() => {})
    adminStore.fetchApplies().catch(() => {})
  }
  if (roleKey.value === 'market_admin' && !adminStore.market) adminStore.fetchMarket().catch(() => {})
  if (roleKey.value === 'vendor') {
    if (!vendorStore.myBooth) vendorStore.fetchMyBooth().catch(() => {})
    if (!vendorStore.productList.length) vendorStore.fetchProducts().catch(() => {})
  }
})
</script>
