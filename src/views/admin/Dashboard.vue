<template>
  <div class="dashboard">
    <PageHeading title="集市运营概览" description="集市动态与待办事项，在一个工作台有序处理。" eyebrow="OVERVIEW / 工作台" />
    <div class="overview-cards dashboard-metrics">
      <section class="stat-card"><span class="stat-label">负责的集市</span><strong class="stat-value stat-value-name">{{ adminStore.market?.name || '尚未创建' }}</strong><span class="stat-caption">当前管理空间</span></section>
      <section class="stat-card"><span class="stat-label">待审批申请</span><strong class="stat-value">{{ adminStore.applyList.length }}<small>项</small></strong><span class="stat-caption">入驻与摊位变更</span></section>
      <section class="stat-card"><span class="stat-label">集市状态</span><strong class="stat-value stat-value-name">{{ adminStore.market ? (adminStore.market.status === 1 ? '正在运营' : '已停用') : '待配置' }}</strong><span class="stat-caption">{{ adminStore.market?.location || '创建集市后开始运营' }}</span></section>
    </div>
    <div class="dashboard-grid">
      <div class="dashboard-col">
        <section class="market-card dashboard-card">
          <div class="card-header">
            <div>
              <span class="eyebrow">01 / 集市概览</span>
              <h2>我的集市</h2>
            </div>
            <UiTag v-if="adminStore.market" :type="adminStore.market.status === 1 ? 'success' : 'info'">{{ adminStore.market.status === 1 ? '运营中' : '已停用' }}</UiTag>
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
import PageHeading from '@/components/PageHeading.vue'
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
