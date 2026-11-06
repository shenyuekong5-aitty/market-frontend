<template>
  <header class="view-heading">
    <div><span v-if="eyebrow" class="view-heading__eyebrow">{{ eyebrow }}</span><h1>{{ title }}</h1><p v-if="description">{{ description }}</p></div>
    <div v-if="$slots.default" class="view-heading__actions"><slot /></div>
  </header>
</template>
<script setup>defineProps({ title: String, description: String, eyebrow: String })</script>
<style scoped>
.view-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 28px; padding: 4px 0 0; }
.view-heading__eyebrow { display: block; color: var(--ink-muted); font-size: 10px; letter-spacing: .14em; font-weight: 600; margin-bottom: 12px; }
h1 { margin: 0; color: var(--ink-strong); font-size: clamp(26px, 2.4vw, 32px); font-weight: 650; line-height: 1.35; letter-spacing: -.035em; }
p { color: var(--ink-muted); font-size: 13px; line-height: 1.8; margin: 10px 0 0; }
.view-heading__actions { display: flex; gap: 10px; flex: none; }
@media(max-width:767px) { .view-heading { align-items: flex-start; flex-direction: column; gap: 16px; margin-bottom: 22px; } h1 { font-size: 25px; } .view-heading__eyebrow { font-size: 9px; margin-bottom: 9px; } p { font-size: 12px; } }
</style>
