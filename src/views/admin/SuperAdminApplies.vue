<template>
  <div class="super-applies">
    <PageHeading title="入驻申请审批" description="集中处理集市的摊位申请，跟进每一次入驻与变更。" eyebrow="REVIEW / 审批" />
    <CollectionToolbar v-model="searchQuery" :count="filteredRows.length" placeholder="搜索申请人、摊位或申请类型…" />
    <UiEmpty v-if="searchQuery && !filteredRows.length" description="没有找到匹配的内容，试试其他关键词。" class="search-empty" />
    <UiCard>
      <template #header>
        <div class="heading">
          <div><span class="eyebrow">PLATFORM REVIEW</span><h2>待办申请</h2></div>
          <UiButton size="small" :loading="loading" @click="load">刷新</UiButton>
        </div>
      </template>
      <p class="intro">超级管理员可处理所有集市的摊位申请；集市管理员只能处理自己负责的集市。</p>
      <UiEmpty v-if="!adminStore.applyList.length" description="暂无待审批申请" />
      <div v-else class="apply-list">
        <article v-for="item in filteredRows" :key="item.id" class="apply-item">
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
import CollectionToolbar from '@/components/CollectionToolbar.vue'
import { useCollectionSearch } from '@/composables/useCollectionSearch'
import PageHeading from '@/components/PageHeading.vue'
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

const { searchQuery, filteredRows } = useCollectionSearch(() => adminStore.applyList, ['vendorName', 'targetBoothTitle', 'type', 'marketName'])
</script>
