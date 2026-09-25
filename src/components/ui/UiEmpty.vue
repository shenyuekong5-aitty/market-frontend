<template><div class="ui-empty"><div class="ui-empty__mark">⌁</div><p>{{ description }}</p><slot /></div></template>
<script setup>defineProps({ description: { type: String, default: '暂无内容' } })</script>
<style scoped>
.ui-empty { min-height: 150px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 28px 16px; color: var(--ink-muted); text-align: center; }.ui-empty__mark { width: 48px; height: 48px; display: grid; place-items: center; border-radius: 16px; background: var(--brand-primary-soft); color: var(--brand-primary); font-size: 27px; transform: rotate(-15deg); }.ui-empty p { margin: 0; font-size: 13px; }
</style>
