<template><div class="ui-empty"><div class="ui-empty__mark"><slot name="image"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="m4 8 3-4h10l3 4v12H4V8ZM4 8h16M9 12h6"/></svg></slot></div><p>{{ description }}</p><slot /></div></template>
<script setup>defineProps({ description: { type: String, default: '这里还没有内容' } })</script>
<style scoped>
.ui-empty { display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 18px; min-height: 200px; padding: 36px 18px; text-align: center; color: var(--ink-muted); }.ui-empty__mark { width: 54px; height: 54px; display: grid; place-items: center; color: #95a98a; background: #f0f4e9; border-radius: 16px; }.ui-empty__mark :deep(svg) { width: 27px; height: 27px; }.ui-empty p { font-size: 12px; line-height: 1.9; margin: 0; }
</style>
