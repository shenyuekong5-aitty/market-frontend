<template><footer class="public-footer"><div><BrandLogo/><p>让每一份用心被看见，让身边的日常多一点新鲜。</p></div><nav aria-label="页脚导航"><router-link to="/discover">发现好物</router-link><router-link to="/about">关于平台</router-link><router-link to="/login">进入集市 ↗</router-link></nav><span class="public-footer__note">智慧集市 · SMART MARKET</span></footer></template>
<script setup>import BrandLogo from '@/components/BrandLogo.vue'</script>
<style scoped>
.public-footer { width: min(100% - 96px,1200px); margin: auto; display: grid; grid-template-columns: 1fr auto; gap: 35px; padding: 46px 0 26px; border-top: 1px solid var(--line); }.public-footer p { color: var(--ink-muted); font-size: 11px; line-height: 1.8; margin: 18px 0 0; }nav { display: flex; align-items: start; gap: 28px; font-size: 12px; color: var(--ink); }nav a:hover { color: var(--brand-primary); }.public-footer__note { grid-column: 1/-1; font-size: 9px; color: #a4ada1; letter-spacing: .12em; padding-top: 20px; border-top: 1px solid var(--line); }
@media(max-width:767px) { .public-footer { width: calc(100% - 40px); grid-template-columns: 1fr; padding-top: 32px; gap: 25px; } nav { flex-wrap: wrap; gap: 22px; } }
</style>
