<script setup>
import BrandLogo from '@/components/BrandLogo.vue'
import flowers from '@/assets/landing/market-flowers.jpg'
defineProps({ register: Boolean })
</script>
<template>
  <div class="auth-layout">
    <aside class="auth-story"><BrandLogo light/><div class="auth-story__copy"><span>GOOD THINGS, CLOSE TO HOME.</span><h2>日常的美好，<br/>从这里开始。</h2><p>有温度的小店，有心意的选择。<br/>在身边的集市，遇见喜欢的生活。</p></div><div class="auth-story__photo"><img :src="flowers" alt="集市里色彩鲜明的花束"/><span>一束花，一点日常里的好心情。 <b>↗</b></span></div><small>智慧集市 / SMART MARKET</small></aside>
    <main class="auth-main"><nav class="auth-top"><router-link to="/welcome">← 返回首页</router-link><span>{{ register ? '已有账号？' : '还没有账号？' }} <router-link :to="register ? '/login' : '/register'">{{ register ? '立即登录' : '创建账号' }} ↗</router-link></span></nav><div class="auth-form"><slot/></div><footer>智慧集市 · 让每一份用心被看见</footer></main>
  </div>
</template>
<style scoped>
.auth-layout { min-height: 100dvh; display: grid; grid-template-columns: minmax(320px,.85fr) 1.15fr; background: #fff; }.auth-story { display: flex; flex-direction: column; background: #1d352a; color: #fff; padding: 40px clamp(30px,4vw,65px); }.auth-story__copy { margin: auto 0; padding: 55px 0 40px; }.auth-story__copy > span { font-size: 9px; letter-spacing: .12em; color: #8faa8e; }.auth-story h2 { font-size: clamp(30px,3.2vw,47px); line-height: 1.5; font-weight: 500; letter-spacing: -.025em; margin: 22px 0; }.auth-story p { font-size: 12px; line-height: 2.1; color: #9fb4a1; margin: 0; }.auth-story__photo { border-radius: 12px; overflow: hidden; margin-bottom: 34px; }.auth-story__photo img { width: 100%; height: 230px; object-fit: cover; object-position: center 45%; }.auth-story__photo > span { display: flex; justify-content: space-between; align-items: center; background: #ffffff09; padding: 16px; font-size: 10px; color: #9fb3a2; }.auth-story__photo b { font-size: 16px; font-weight: 400; }.auth-story > small { font-size: 8px; letter-spacing: .15em; color: #6d8a72; }.auth-main { min-width: 0; padding: 32px 40px 24px; display: flex; flex-direction: column; }.auth-top { display: flex; justify-content: space-between; gap: 16px; font-size: 11px; color: var(--ink-muted); }.auth-top > span a { color: var(--brand-primary); margin-left: 8px; }.auth-form { width: min(100%,400px); margin: auto; padding: 50px 0; }.auth-main footer { text-align: center; font-size: 10px; color: #a8b09f; }
@media(min-width:1400px) { .auth-story__photo img { height: 280px; } }
@media(max-width:900px) { .auth-layout { grid-template-columns: 1fr; }.auth-story { display: none; }.auth-main { min-height: 100dvh; padding: 24px; }.auth-form { padding: 48px 0; }.auth-top { font-size: 10px; } }
@media(max-width:400px) { .auth-top > span { font-size: 9px; }.auth-top > span a { margin-left: 3px; }.auth-main { padding: 20px; } }
</style>
