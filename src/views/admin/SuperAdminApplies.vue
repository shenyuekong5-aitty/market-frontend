<template>
  <div class="super-applies">
    <UiCard>
      <template #header>
        <div class="heading">
          <div><span class="eyebrow">PLATFORM REVIEW</span><h2>全平台待审批申请</h2></div>
          <UiButton size="small" :loading="loading" @click="load">刷新</UiButton>
        </div>
      </template>
      <p class="intro">超级管理员可处理所有集市的摊位申请；集市管理员只能处理自己负责的集市。</p>
      <UiEmpty v-if="!adminStore.applyList.length" description="暂无待审批申请" />
      <div v-else class="apply-list">
        <article v-for="item in adminStore.applyList" :key="item.id" class="apply-item">
          <div class="apply-copy">
            <strong>{{ item.vendorName || `申请人 #${item.vendorId}` }}</strong>
            <span>{{ item.type }} · {{ item.targetBoothTitle || `目标摊位 #${item.targetBoothId}` }}</span>
            <small>{{ item.applyTime || '待处理' }}</small>
          </div>
          <div class="actions">
            <UiButton size="small" type="success" @click="handle(item.id, true)">通过</UiButton>
            <UiButton size="small" type="danger" @click="handle(item.id, false)">拒绝</UiButton>
          </div>
        </article>
      </div>
    </UiCard>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useAdminStore } from '@/store/modules/admin'

const adminStore = useAdminStore()
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    await adminStore.fetchApplies()
  } catch (error) {
    ElMessage.error(error.message || '获取申请失败')
  } finally {
    loading.value = false
  }
}

async function handle(id, approve) {
  try {
    if (approve) await adminStore.handleApprove(id)
    else await adminStore.handleReject(id)
    ElMessage.success(approve ? '已通过申请' : '已拒绝申请')
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

onMounted(load)
</script>

<style scoped>
.super-applies { padding: 4px; }
.heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.heading h2 { margin: 4px 0 0; font-size: 20px; color: var(--ink-strong); }
.eyebrow { color: var(--brand-primary); font-size: 11px; font-weight: 700; letter-spacing: .1em; }
.intro { margin: 0 0 16px; color: var(--ink-muted); font-size: 13px; }
.apply-list { display: grid; gap: 12px; }
.apply-item { display: flex; justify-content: space-between; gap: 18px; align-items: center; padding: 16px; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--surface-subtle); }
.apply-copy { display: grid; gap: 5px; min-width: 0; }
.apply-copy strong { color: var(--ink-strong); }
.apply-copy span, .apply-copy small { color: var(--ink-muted); }
.actions { display: flex; gap: 8px; flex-shrink: 0; }
@media (min-width: 768px) and (max-width: 1024px) { .super-applies { padding: 0; } }
@media (max-width: 767px) { .super-applies { padding: 0; }.heading { align-items: flex-start; flex-wrap: wrap; }.apply-item { align-items: stretch; flex-direction: column; }.actions { flex-wrap: wrap; }.actions > * { flex: 1; } }
</style>
