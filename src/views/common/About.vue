<script setup>
import PublicFooter from '@/components/PublicFooter.vue'
import PublicHeader from '@/components/PublicHeader.vue'
import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { homePathForRole } from '@/utils/roles'
import produce from '@/assets/landing/market-vegetables.jpg'
import flowers from '@/assets/landing/market-flowers.jpg'
import cups from '@/assets/landing/handmade-cups.jpg'

const userStore = useUserStore()
const entryPath = computed(() => userStore.isLoggedIn ? homePathForRole(userStore.userInfo.role) : '/login')
</script>

<template>
  <div class="about-page">
    <PublicHeader />
    <main>
      <section class="about-hero">
        <div class="hero-copy"><span class="kicker">ABOUT SMART MARKET / 平台介绍</span><h1>让身边的集市，<br /><em>更好逛，<br class="mobile-break" />也更好经营。</em></h1><p>智慧集市是面向校园及周边场景的线上集市平台。它把集市管理、摊位入驻、商品展示和交易协作放在同一个地方，让用户找得到好物，让摊主照顾好小店，也让管理员清楚地运营集市。</p><div class="hero-actions"><router-link to="/discover" class="primary-link">免登录逛逛好物 <span>↗</span></router-link><router-link :to="entryPath" class="text-link">{{ userStore.isLoggedIn ? '进入我的空间' : '登录或注册' }} →</router-link></div></div>
        <div class="hero-photos"><img :src="produce" alt="新鲜蔬果摊位" /><img :src="flowers" alt="集市花卉摊位" /></div>
      </section>
      <section class="platform-story" aria-label="平台定位"><span class="story-label">从线下热闹到线上有序</span><p>从一座集市到一家小店，从发现一件好物到认真经营每一天。我们让商品、摊位与集市相连，让每一种参与都有清晰的位置。</p></section>
      <section class="path-section" aria-labelledby="path-title"><div class="section-title"><span>WHO IT IS FOR / 为谁而建</span><h2 id="path-title">三种视角，同一座集市</h2><p>不同身份看到的内容与可进行的操作不同，但都围绕真实的集市生活展开。</p></div><div class="path-grid">
        <article class="path-card"><span class="path-number">01 / 逛集市的人</span><h3>看见身边的好物</h3><p>无需登录，就能在公开橱窗浏览当前可见的上架商品。登录后可以进入集市和摊位、关注店铺、加入购物车，并查看订单与预订。</p><router-link to="/discover">看看现在有哪些商品 <span aria-hidden="true">↗</span></router-link></article>
        <article class="path-card"><span class="path-number">02 / 经营摊位的人</span><h3>把小店打理妥当</h3><p>小贩选择集市、申请空闲摊位，获批后维护摊位资料与商品，处理用户订单和预订，也能回顾自己的经营收入。</p><router-link :to="{ path: '/login', query: { role: 'vendor' } }">以小贩身份进入 <span aria-hidden="true">↗</span></router-link></article>
        <article class="path-card"><span class="path-number">03 / 运营集市的人</span><h3>让日常运转更清晰</h3><p>集市管理员管理所属集市和摊位、审核入驻申请并查看运营数据；超级管理员负责平台层面的管理员与审批事务。</p><router-link :to="{ path: '/login', query: { role: 'market_admin' } }">进入管理端 <span aria-hidden="true">↗</span></router-link></article>
      </div></section>
      <section class="about-last"><img :src="cups" alt="手作商品展示" /><div><span class="kicker">A MORE CONNECTED MARKET / 平台能力</span><h2>每一件好物背后，<br />都有一条清晰的连接。</h2><p>平台将商品、摊位、集市与对应身份关联起来，支持商品浏览、摊位申请、订单与预订处理。智能客服提供公开业务指引；具体订单、审批状态仍以登录后的对应页面为准。</p><p class="last-note">公开商品页仅供浏览；购买、预订和申请摊位等操作需要登录。</p><router-link to="/discover" class="primary-link">先逛逛发现好物 <span>↗</span></router-link></div></section>
    </main>
    <PublicFooter />
  </div>
</template>

<style scoped>
.about-page { background: #fcfdf9; color: var(--ink-strong); }.about-hero, .path-section, .about-last { width: min(100% - 96px,1200px); margin: auto; }.about-hero { display: grid; grid-template-columns: 1.1fr 1fr; align-items: center; gap: 65px; padding: 64px 0 72px; }.kicker, .section-title > span { color: #8e9d7e; font-size: 9px; letter-spacing: .13em; font-weight: 500; }.hero-copy h1 { margin: 24px 0; font-size: clamp(32px,3.7vw,49px); font-weight: 600; line-height: 1.55; letter-spacing: -.04em; }.hero-copy h1 em { color: var(--brand-primary); font-style: normal; }.mobile-break { display: none; }.hero-copy p, .about-last p { color: var(--ink-muted); font-size: 13px; line-height: 2.1; margin: 0 0 28px; max-width: 510px; }.hero-actions { display: flex; gap: 22px; align-items: center; flex-wrap: wrap; }.primary-link { display: inline-flex; align-items: center; gap: 28px; padding: 14px 21px; border-radius: 7px; background: var(--brand-primary); color: #fff; font-size: 12px; }.primary-link:hover { background: var(--brand-primary-hover); }.text-link { font-size: 12px; color: var(--brand-primary); }.hero-photos { display: grid; grid-template-columns: 1fr .65fr; gap: 14px; align-items: center; }.hero-photos img { width: 100%; height: 350px; object-fit: cover; border-radius: 12px; }.hero-photos img:last-child { height: 250px; margin-top: 110px; }.platform-story { display: flex; align-items: center; gap: 8%; padding: 36px max(48px,calc((100vw - 1200px)/2)); background: #edf2e7; }.story-label { flex: 0 0 22%; font-size: 12px; color: var(--brand-primary); }.platform-story p { margin: 0; color: #78866b; font-size: 15px; line-height: 2; }.path-section { padding: 70px 0; }.section-title h2, .about-last h2 { font-size: 30px; font-weight: 600; line-height: 1.6; letter-spacing: -.025em; margin: 15px 0 18px; }.section-title > p { font-size: 12px; color: var(--ink-muted); line-height: 1.9; margin: 0 0 30px; }.path-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 22px; }.path-card { display: flex; flex-direction: column; padding: 28px; border: 1px solid var(--line); border-radius: 12px; background: #fff; }.path-number { font-size: 9px; color: #94a67f; }.path-card h3 { font-size: 20px; font-weight: 500; margin: 24px 0 16px; }.path-card p { font-size: 12px; color: var(--ink-muted); line-height: 2; margin: 0 0 26px; }.path-card a { font-size: 11px; color: var(--brand-primary); margin-top: auto; }.path-card a span { margin-left: 9px; }.about-last { display: grid; grid-template-columns: .85fr 1.15fr; gap: 9%; align-items: center; padding: 8px 0 80px; }.about-last img { width: 100%; height: 370px; object-fit: cover; border-radius: 12px; }.about-last h2 { margin-top: 18px; }.about-last .last-note { color: #a0aa92; font-size: 10px; margin-top: -10px; }
@media(max-width:1024px) { .about-hero { gap: 32px; }.hero-copy h1 { font-size: 36px; }.hero-photos img { height: 310px; }.hero-photos img:last-child { height: 220px; }.path-card { padding: 22px; } }
@media(max-width:767px) { .about-hero, .path-section, .about-last { width: calc(100% - 40px); }.about-hero { grid-template-columns: 1fr; padding-block: 40px; gap: 30px; }.hero-copy h1 { font-size: 32px; }.hero-photos { gap: 14px; }.hero-photos img { height: 240px; }.hero-photos img:last-child { height: 190px; margin-top: 30px; }.platform-story { padding: 28px 20px; flex-direction: column; align-items: flex-start; gap: 16px; }.platform-story p { font-size: 13px; }.path-section { padding-block: 44px; }.section-title h2, .about-last h2 { font-size: 24px; }.path-grid { grid-template-columns: 1fr; gap: 18px; }.path-card { padding: 24px; }.path-card h3 { font-size: 19px; margin-top: 18px; }.about-last { grid-template-columns: 1fr; padding-bottom: 44px; gap: 28px; }.about-last img { height: 240px; } }
</style>
