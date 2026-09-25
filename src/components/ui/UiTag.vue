<template><span class="ui-tag" :class="`is-${type}`"><slot /></span></template>
<script setup>defineProps({ type: { type: String, default: 'info' } })</script>
<style scoped>
.ui-tag { display: inline-flex; align-items: center; min-height: 24px; padding: 0 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.is-success { color: #26765c; background: #e8f5ef; }.is-warning { color: #96651d; background: #fff3d8; }.is-danger { color: #a64a4a; background: #fdebea; }.is-info { color: var(--ink); background: var(--surface-subtle); }.is-primary { color: var(--brand-primary); background: var(--brand-primary-soft); }
</style>
