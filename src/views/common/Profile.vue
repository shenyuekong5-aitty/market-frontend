<template>
  <div class="profile-page" :class="`role-${roleKey}`">
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

const handleLogout = () => { ElMessageBox.confirm('确定要退出登录吗？', '退出当前账号', { confirmButtonText: '确定退出', cancelButtonText: '暂不退出', type: 'warning' }).then(() => { userStore.logout(); ElMessage.success('已退出登录'); router.push('/login') }).catch(() => {}) }
const handleDeactivate = () => { ElMessageBox.confirm('注销后可通过忘记密码重新激活，确定继续吗？', '注销账号', { confirmButtonText: '确认注销', cancelButtonText: '保留账号', type: 'warning' }).then(async () => { try { await userStore.deactivateAccount(); ElMessage.success('账号已注销'); userStore.logout() } catch (error) { ElMessage.error(error.message || '注销失败') } }).catch(() => {}) }
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

<style scoped>
.profile-page { --profile-accent: var(--brand-primary); --profile-accent-soft: var(--brand-primary-soft); width: 100%; max-width: 1240px; margin: 0 auto; padding: 4px 0 36px; color: var(--ink-strong); }
.role-vendor { --profile-accent: var(--brand-secondary); --profile-accent-soft: var(--brand-secondary-soft); }.role-user { --profile-accent: var(--brand-primary); --profile-accent-soft: var(--brand-primary-soft); }
.profile-hero { position: relative; overflow: hidden; margin-bottom: 18px; padding: 30px; border: 1px solid rgba(23,107,104,.18); border-radius: 24px; background: linear-gradient(135deg, #153f46 0%, var(--brand-primary) 56%, #3d978b 100%); color: #fff; box-shadow: 0 18px 42px rgba(23,107,104,.18); }.role-super_admin .profile-hero { background: linear-gradient(135deg, #172c42 0%, #28515c 56%, #3d978b 100%); }.role-vendor .profile-hero { background: linear-gradient(135deg, #6d4333 0%, var(--brand-secondary) 56%, #f1ae8b 100%); box-shadow: 0 18px 42px rgba(239,139,104,.18); }
.hero-main, .hero-stats { position: relative; z-index: 1; }.hero-main { display: flex; align-items: center; justify-content: space-between; gap: 24px; }.identity-block { display: flex; align-items: center; min-width: 0; gap: 20px; }.avatar-shell { position: relative; flex: 0 0 auto; }.profile-avatar { display: block; width: 92px; height: 92px; border: 4px solid rgba(255,255,255,.32); border-radius: 50%; object-fit: cover; background: rgba(255,255,255,.16); }.avatar-fallback { display: grid; place-items: center; color: #fff; font-size: 34px; font-weight: 750; letter-spacing: .04em; }.online-dot { position: absolute; right: 4px; bottom: 6px; width: 16px; height: 16px; border: 3px solid #246c6d; border-radius: 50%; background: #9be4bc; }.role-vendor .online-dot { border-color: #8f5a45; }.online-dot.is-offline { background: #f49e92; }
.identity-copy { min-width: 0; }.eyebrow, .section-kicker { display: block; color: rgba(255,255,255,.65); font-size: 10px; font-weight: 750; letter-spacing: .18em; }.identity-copy h1 { margin: 5px 0 4px; color: #fff; font-size: clamp(25px, 3vw, 36px); line-height: 1.1; }.identity-copy p { max-width: 510px; margin: 0; color: rgba(255,255,255,.78); font-size: 13px; }.identity-meta { display: flex; flex-wrap: wrap; gap: 12px 18px; margin-top: 14px; color: rgba(255,255,255,.76); font-size: 12px; }.identity-meta span { display: inline-flex; align-items: center; gap: 5px; }.meta-icon { width: 14px; height: 14px; }
.hero-actions { display: flex; flex: 0 0 auto; gap: 8px; }.hero-actions :deep(.ui-button) { border-color: rgba(255,255,255,.3); }.hero-actions :deep(.ui-button.is-primary) { border-color: #fff; background: #fff; color: var(--profile-accent); }.hero-actions :deep(.ui-button.is-plain) { background: rgba(255,255,255,.1); color: #fff; }
.hero-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1px; margin-top: 28px; border-top: 1px solid rgba(255,255,255,.2); }.hero-stat { min-width: 0; padding: 18px 18px 0 0; }.stat-label, .stat-note { display: block; color: rgba(255,255,255,.62); font-size: 11px; }.hero-stat strong { display: block; overflow: hidden; margin: 4px 0 2px; color: #fff; font-size: clamp(17px, 2vw, 24px); text-overflow: ellipsis; white-space: nowrap; }.hero-glow { position: absolute; border-radius: 50%; pointer-events: none; }.hero-glow-one { right: -90px; top: -130px; width: 330px; height: 330px; background: rgba(255,255,255,.08); }.hero-glow-two { right: 22%; bottom: -170px; width: 290px; height: 290px; border: 1px solid rgba(255,255,255,.13); }
.profile-content-grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr); gap: 18px; }.profile-card { min-width: 0; }.profile-card :deep(.ui-card__body) { height: calc(100% - 70px); }.section-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }.section-heading .section-kicker { color: var(--profile-accent); font-size: 9px; }.section-heading h2 { margin: 4px 0 0; color: var(--ink-strong); font-size: 17px; }.section-index { color: var(--ink-faint); font-size: 18px; font-weight: 750; }.security-score { color: var(--profile-accent); font-size: 24px; font-weight: 800; }.security-score small { color: var(--ink-muted); font-size: 11px; font-weight: 600; }
.detail-list { display: grid; gap: 0; }.detail-row { display: flex; align-items: center; justify-content: space-between; gap: 18px; min-height: 48px; border-bottom: 1px solid var(--line); }.detail-row:last-child { border-bottom: 0; }.detail-label { color: var(--ink-muted); font-size: 13px; }.detail-value { max-width: 64%; overflow: hidden; color: var(--ink-strong); font-size: 13px; font-weight: 650; text-align: right; text-overflow: ellipsis; white-space: nowrap; }.detail-value.is-muted { color: var(--ink-muted); font-weight: 500; }
.security-intro { display: flex; align-items: center; gap: 13px; margin-bottom: 18px; }.security-ring { display: grid; flex: 0 0 auto; place-items: center; width: 42px; height: 42px; border-radius: 14px; background: var(--profile-accent-soft); color: var(--profile-accent); }.security-ring svg { width: 22px; height: 22px; }.security-ring.is-warning { background: #fff3d8; color: #a26a1b; }.security-intro strong { font-size: 14px; }.security-intro p { margin: 3px 0 0; color: var(--ink-muted); font-size: 12px; }.security-list { display: grid; gap: 8px; }.security-row { display: flex; align-items: center; gap: 9px; min-height: 32px; color: var(--ink); font-size: 12px; }.security-state { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 7px; }.security-state svg { width: 14px; height: 14px; }.security-state.is-good { background: #e8f5ef; color: #26765c; }.security-state.is-warning { background: #fff3d8; color: #a26a1b; }.security-state.is-danger { background: #fdebea; color: #b6534f; }.security-state.is-neutral { background: var(--surface-subtle); color: var(--ink-muted); }.security-value { margin-left: auto; color: var(--ink-muted); }
.role-card { grid-column: 1 / -1; }.role-summary { display: flex; align-items: center; gap: 13px; }.role-mark { display: grid; flex: 0 0 auto; place-items: center; width: 44px; height: 44px; border-radius: 14px; background: var(--profile-accent-soft); color: var(--profile-accent); }.role-mark svg { width: 22px; height: 22px; }.role-summary strong { display: block; font-size: 15px; }.role-summary p { margin: 4px 0 0; color: var(--ink-muted); font-size: 12px; }.role-facts { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }.role-facts div { flex: 1; min-width: 160px; padding: 12px 14px; border-radius: 12px; background: var(--surface-subtle); }.role-facts span, .role-facts strong { display: block; }.role-facts span { color: var(--ink-muted); font-size: 11px; }.role-facts strong { margin-top: 3px; color: var(--ink-strong); font-size: 14px; }
.actions-card { grid-column: 1 / -1; }.action-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; }.action-tile { position: relative; display: flex; min-width: 0; flex-direction: column; align-items: flex-start; gap: 13px; min-height: 126px; padding: 15px; border: 1px solid var(--line); border-radius: 15px; background: var(--surface-card); text-align: left; cursor: pointer; transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; }.action-tile:hover { transform: translateY(-2px); border-color: var(--profile-accent); box-shadow: var(--shadow-sm); }.action-icon { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 11px; }.action-icon svg { width: 18px; height: 18px; }.action-copy { min-width: 0; }.action-copy strong, .action-copy small { display: block; }.action-copy strong { color: var(--ink-strong); font-size: 13px; }.action-copy small { margin-top: 4px; color: var(--ink-muted); font-size: 11px; line-height: 1.4; }.action-arrow { position: absolute; right: 13px; top: 14px; width: 15px; height: 15px; color: var(--ink-faint); }.tone-primary .action-icon { background: var(--brand-primary-soft); color: var(--brand-primary); }.tone-success .action-icon { background: #e8f5ef; color: #26765c; }.tone-warning .action-icon { background: #fff3d8; color: #a26a1b; }.tone-neutral .action-icon { background: var(--surface-subtle); color: var(--ink-muted); }.tone-danger .action-icon { background: #fdebea; color: var(--danger); }.tone-danger:hover { border-color: var(--danger); }
@media (max-width: 900px) { .profile-content-grid { grid-template-columns: 1fr; }.role-card, .actions-card { grid-column: auto; }.action-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 640px) { .profile-page { padding-bottom: 22px; }.profile-hero { padding: 22px 18px; border-radius: 20px; }.hero-main { align-items: flex-start; flex-direction: column; gap: 18px; }.identity-block { align-items: flex-start; gap: 13px; }.profile-avatar { width: 68px; height: 68px; border-width: 3px; }.avatar-fallback { font-size: 26px; }.online-dot { right: 1px; bottom: 2px; width: 13px; height: 13px; border-width: 2px; }.identity-copy h1 { font-size: 24px; }.identity-copy p { font-size: 12px; line-height: 1.5; }.identity-meta { gap: 6px 12px; margin-top: 10px; font-size: 11px; }.hero-actions { width: 100%; }.hero-actions :deep(.ui-button) { flex: 1; }.hero-stats { margin-top: 22px; }.hero-stat { padding: 14px 8px 0 0; }.stat-label, .stat-note { font-size: 10px; }.hero-stat strong { font-size: 16px; }.profile-content-grid { gap: 12px; }.profile-card :deep(.ui-card__header) { padding: 16px; }.profile-card :deep(.ui-card__body) { height: auto; padding: 16px; }.detail-row { min-height: 44px; }.detail-label, .detail-value { font-size: 12px; }.action-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }.action-tile { min-height: 112px; padding: 12px; }.action-copy small { font-size: 10px; }.role-facts div { min-width: 120px; } }
@media (max-width: 360px) { .identity-meta { flex-direction: column; gap: 4px; }.hero-actions :deep(.ui-button) { padding: 0 10px; font-size: 12px; }.action-tile { min-height: 104px; }.action-copy strong { font-size: 12px; } }
</style>
