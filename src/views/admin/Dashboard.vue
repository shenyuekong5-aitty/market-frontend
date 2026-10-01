<template>
  <div class="dashboard">
    <section class="dashboard-intro">
      <div>
        <span class="intro-kicker">集市运营工作台</span>
        <h1>掌握集市动态，<br /><em>从容处理每一项事务。</em></h1>
        <p>在这里查看负责的集市、处理待审批申请，并快速进入常用管理页面。</p>
      </div>
      <div class="intro-summary">
        <span>当前待办</span>
        <strong>{{ adminStore.applyList.length }}</strong>
        <small>项申请等待处理</small>
      </div>
    </section>
    <div class="dashboard-grid">
      <div class="dashboard-col">
        <section class="market-card dashboard-card">
          <div class="card-header">
            <div>
              <span class="eyebrow">01 / 集市概览</span>
              <h2>我的集市</h2>
            </div>
            <UiTag v-if="adminStore.market" type="success">运营中</UiTag>
          </div>
          <div class="card-body">
            <div v-if="adminStore.market" class="market-info">
              <p><strong>名称：</strong>{{ adminStore.market.name }}</p>
              <p><strong>位置：</strong>{{ adminStore.market.location }}</p>
              <p><strong>状态：</strong>{{ adminStore.market.status === 1 ? "启用" : "停用" }}</p>
            </div>
            <div v-else class="empty-state">
              <p>您还没有管理任何集市</p>
              <UiButton type="primary" size="small" @click="$router.push('/admin/market/list')">创建集市</UiButton>
            </div>
          </div>
        </section>
      </div>

      <div class="dashboard-col">
        <section class="market-card dashboard-card">
          <div class="card-header">
            <div>
              <span class="eyebrow">02 / 待办事项</span>
              <h2>待审批申请</h2>
            </div>
            <UiBadge :value="adminStore.applyList.length" :max="99" />
          </div>
          <div class="card-body">
            <div v-if="adminStore.applyList.length > 0" class="apply-list-wrapper">
              <div v-for="apply in adminStore.applyList" :key="apply.id" class="apply-item">
                <p><strong>申请人：</strong>{{ apply.vendorName }}</p>
                <p><strong>类型：</strong>{{ apply.type }}</p>
                <p><strong>目标摊位：</strong>{{ apply.targetBoothTitle }}</p>
                <p><strong>申请时间：</strong>{{ apply.applyTime }}</p>
                <div class="apply-actions">
                  <UiButton type="success" size="small" @click="handleApprove(apply.id)">通过</UiButton>
                  <UiButton type="danger" size="small" @click="handleReject(apply.id)">拒绝</UiButton>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">暂无待审批申请</div>
          </div>
        </section>
      </div>

      <div class="dashboard-col">
        <section class="market-card dashboard-card">
          <div class="card-header">
            <div>
              <span class="eyebrow">03 / 常用入口</span>
              <h2>快捷操作</h2>
            </div>
          </div>
          <div class="card-body">
            <div class="quick-actions">
              <button class="action-btn" @click="$router.push('/admin/operation-log')"><span>操作日志</span><ArrowRight class="action-arrow" aria-hidden="true" /></button>
              <button class="action-btn" @click="$router.push('/admin/income-stats')"><span>收入统计</span><ArrowRight class="action-arrow" aria-hidden="true" /></button>
              <button class="action-btn" @click="$router.push('/admin/market/list')"><span>集市管理</span><ArrowRight class="action-arrow" aria-hidden="true" /></button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch } from "vue";
import { useAdminStore } from "@/store/modules/admin";
import { useNotificationStore } from "@/store/modules/notification";
import { ArrowRight } from "@element-plus/icons-vue";

const adminStore = useAdminStore();
const notificationStore = useNotificationStore();

const handleApprove = (id) => adminStore.handleApprove(id);
const handleReject = (id) => adminStore.handleReject(id);

onMounted(async () => { await adminStore.refreshAll(); });
watch(() => notificationStore.unreadCount, () => { adminStore.refreshAll(); });
</script>

<style scoped>
.dashboard { padding: 4px; }
.dashboard-intro { position: relative; display: flex; justify-content: space-between; align-items: flex-end; gap: 32px; min-height: 240px; margin-bottom: 22px; padding: 34px clamp(24px, 4vw, 48px); overflow: hidden; border-radius: var(--radius-lg); background: linear-gradient(112deg, #123f44, #176b68 68%, #2b8982); color: #fff; box-shadow: var(--shadow-md); }
.dashboard-intro::after { content: ''; position: absolute; width: 350px; height: 350px; right: 11%; top: -230px; border: 1px solid rgba(255,255,255,.13); border-radius: 50%; pointer-events: none; }
.intro-kicker { color: #b8e7da; font-size: 11px; font-weight: 750; letter-spacing: .18em; }
.dashboard-intro h1 { margin: 12px 0 10px; font-size: clamp(25px, 3vw, 36px); line-height: 1.25; letter-spacing: -.03em; }
.dashboard-intro h1 em { color: #d2f1df; font-style: normal; }
.dashboard-intro p { max-width: 520px; margin: 0; color: #d2e6e4; font-size: 13px; line-height: 1.7; }
.intro-summary { z-index: 1; display: flex; flex-direction: column; align-items: flex-start; flex: 0 0 155px; padding: 18px 20px; border: 1px solid rgba(255,255,255,.2); border-radius: 18px; background: rgba(255,255,255,.11); backdrop-filter: blur(10px); }
.intro-summary span, .intro-summary small { color: #d2e6e4; font-size: 12px; }
.intro-summary strong { margin: 3px 0; font-size: 45px; line-height: 1.1; font-weight: 750; }
.dashboard-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.dashboard-col:last-child { grid-column: 1 / -1; }
.dashboard-col { display: flex; }
.dashboard-card { flex: 1; min-height: 260px; display: flex; flex-direction: column; }
.dashboard-col:last-child .dashboard-card { min-height: 0; }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding: 22px 24px 14px; }
.card-header h2 { margin: 3px 0 0; color: var(--ink-strong); font-size: 18px; letter-spacing: -.02em; }
.eyebrow { color: var(--brand-primary); font-size: 11px; font-weight: 700; letter-spacing: .08em; }
.card-body { flex: 1; padding: 6px 24px 24px; display: flex; flex-direction: column; }
.market-card { position: relative; overflow: hidden; background: var(--surface-card); border: 1px solid var(--line); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); transition: transform .2s ease, box-shadow .2s ease; }
.market-card::before { content: ""; position: absolute; inset: 0 0 auto; height: 3px; background: linear-gradient(90deg, var(--brand-primary), var(--brand-secondary)); }
.market-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.market-info p, .apply-item p { margin: 8px 0; color: var(--ink); font-size: 14px; }
.market-info strong, .apply-item strong { color: var(--ink-strong); }
.apply-item { padding: 12px 0; border-bottom: 1px solid var(--line); }
.apply-item:last-child { border-bottom: none; }
.apply-actions { margin-top: 10px; display: flex; gap: 8px; }
.empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; color: var(--ink-muted); padding: 20px; }
.quick-actions { flex: 1; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.action-btn { width: 100%; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--surface-subtle); color: var(--ink-strong); text-align: left; cursor: pointer; transition: .2s ease; }
.action-arrow { width: 18px; height: 18px; color: var(--brand-primary); flex: none; }
.action-btn:hover { color: #fff; border-color: var(--brand-primary); background: var(--brand-primary); transform: translateX(3px); }
.action-btn:hover .action-arrow { color: #fff; }
.apply-list-wrapper { max-height: 400px; overflow-y: auto; padding-right: 4px; }

@media (max-width: 900px) { .dashboard-intro { min-height: 210px; } .quick-actions { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .dashboard { padding: 0; } .dashboard-intro { align-items: flex-start; flex-direction: column; gap: 20px; min-height: 0; padding: 26px 22px; margin-bottom: 16px; } .dashboard-intro h1 { font-size: 25px; } .intro-summary { flex: none; width: 100%; padding: 12px 16px; } .intro-summary strong { font-size: 34px; } .dashboard-grid { grid-template-columns: 1fr; gap: 14px; } .dashboard-col:last-child { grid-column: auto; } .dashboard-card { min-height: 0; } .apply-list-wrapper { max-height: none; } .card-header { padding: 18px 18px 12px; } .card-body { padding: 4px 18px 18px; } }
</style>
