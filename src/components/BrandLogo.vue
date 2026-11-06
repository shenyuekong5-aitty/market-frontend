<template>
  <router-link class="brand-logo" :class="{ 'is-light': light, 'is-compact': compact }" :to="to" aria-label="智慧集市首页">
    <span class="brand-logo__mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10 5 4h14l2 6M4 10v10h16V10M3 10c0 3 4 3 4 0 0 3 5 3 5 0 0 3 5 3 5 0 0 3 4 3 4 0M9 20v-6h6v6"/></svg></span>
    <span class="brand-logo__copy"><strong>智慧集市</strong><small>MARKET / 让好物相遇</small></span>
  </router-link>
</template>
<script setup>
defineProps({ light: Boolean, compact: Boolean, to: { type: String, default: '/welcome' } })
</script>
<style scoped>
.brand-logo { display: inline-flex; align-items: center; gap: 11px; color: var(--ink-strong); text-decoration: none; white-space: nowrap; }
.brand-logo__mark { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 11px; color: #fff; background: var(--brand-primary); flex: none; }
.brand-logo__mark svg { width: 23px; height: 23px; }
.brand-logo__copy { display: grid; gap: 5px; }
.brand-logo strong { font-size: 17px; font-weight: 650; letter-spacing: .04em; }
.brand-logo small { font-size: 8px; font-weight: 500; letter-spacing: .12em; color: var(--ink-muted); }
.brand-logo.is-light { color: #fff; }.is-light .brand-logo__mark { background: #b7e4cb; color: #1d3b30; }.is-light small { color: #8fa79d; }
.is-compact .brand-logo__copy { display: none; }
</style>
