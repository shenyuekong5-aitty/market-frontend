<template>
  <div class="collection-toolbar">
    <label class="collection-search"><Search aria-hidden="true"/><input :value="modelValue" :placeholder="placeholder" :aria-label="placeholder" type="search" @input="$emit('update:modelValue', $event.target.value)"/></label>
    <div class="collection-meta"><span v-if="modelValue" role="status">找到 <strong>{{ count }}</strong> 条结果</span><span v-else>共 <strong>{{ count }}</strong> {{ unit }}</span><slot /></div>
  </div>
</template>
<script setup>
import { Search } from '@element-plus/icons-vue'
defineProps({ modelValue: String, count: Number, unit: { type: String, default: '条记录' }, placeholder: { type: String, default: '搜索名称、编号或状态…' } })
defineEmits(['update:modelValue'])
</script>
<style scoped>
.collection-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 22px; }
.collection-search { display: flex; align-items: center; gap: 10px; width: min(100%, 340px); min-height: 40px; border: 1px solid var(--line); border-radius: 8px; background: #fff; padding: 0 12px; }
.collection-search:focus-within { border-color: var(--brand-primary); box-shadow: var(--focus-ring); }.collection-search svg { width: 16px; height: 16px; color: var(--ink-muted); flex: none; }
input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; font: inherit; font-size: 12px; padding: 11px 0; color: var(--ink-strong); } input::placeholder { color: var(--ink-muted); }
.collection-meta { display: flex; align-items: center; gap: 12px; font-size: 12px; color: var(--ink-muted); white-space: nowrap; }.collection-meta strong { color: var(--ink-strong); font-weight: 600; }
@media(max-width:560px) { .collection-toolbar { gap: 12px; flex-wrap: wrap; } .collection-search { width: 100%; } }
</style>
