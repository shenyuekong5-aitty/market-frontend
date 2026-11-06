<template><span class="ui-tag" :class="`is-${type}`"><slot /></span></template>
<script setup>defineProps({ type: { type: String, default: 'info' } })</script>
<style scoped>
.ui-tag { display: inline-flex; align-items: center; min-height: 23px; padding: 0 10px; border-radius: 5px; font-size: 10px; font-weight: 500; }
.is-success { color: #26765c; background: #e8f5ef; }.is-warning { color: #96651d; background: #fff3d8; }.is-danger { color: #a64a4a; background: #fdebea; }.is-info { color: var(--ink); background: var(--surface-subtle); }.is-primary { color: var(--brand-primary); background: var(--brand-primary-soft); }
</style>
