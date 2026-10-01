<script setup>
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
    <header class="public-nav">
      <router-link to="/welcome" class="public-brand">✳ <strong>智慧集市</strong><small>MARKET</small></router-link>
      <nav aria-label="公共页面导航"><router-link to="/discover">发现好物</router-link><router-link to="/about" aria-current="page">平台介绍</router-link></nav>
      <router-link class="nav-cta" :to="entryPath">{{ userStore.isLoggedIn ? '进入集市' : '登录 / 注册' }} ↗</router-link>
    </header>
    <main>
      <section class="about-hero">
        <div class="hero-copy"><span class="kicker">ABOUT SMART MARKET / 平台介绍</span><h1>让身边的集市，<br /><em>更好逛，<br class="mobile-break" />也更好经营。</em></h1><p>智慧集市是面向校园及周边场景的线上集市平台。它把集市管理、摊位入驻、商品展示和交易协作放在同一个地方，让用户找得到好物，让摊主照顾好小店，也让管理员清楚地运营集市。</p><div class="hero-actions"><router-link to="/discover" class="primary-link">免登录逛逛好物 <span>↗</span></router-link><router-link :to="entryPath" class="text-link">{{ userStore.isLoggedIn ? '进入我的空间' : '登录或注册' }} →</router-link></div></div>
        <div class="hero-photos"><img :src="produce" alt="新鲜蔬果摊位" /><img :src="flowers" alt="集市花卉摊位" /></div>
      </section>
      <section class="platform-story" aria-label="平台定位"><span class="story-label">从线下热闹到线上有序</span><p>这里不是单纯的商品列表。一个商品属于一个摊位，一个摊位属于一座集市；从发现、入驻到经营与管理，每个环节都能找到自己的位置。</p></section>
      <section class="path-section" aria-labelledby="path-title"><div class="section-title"><span>WHO IT IS FOR / 为谁而建</span><h2 id="path-title">三种视角，同一座集市</h2><p>不同身份看到的内容与可进行的操作不同，但都围绕真实的集市生活展开。</p></div><div class="path-grid">
        <article class="path-card"><span class="path-number">01 / 逛集市的人</span><h3>看见身边的好物</h3><p>无需登录，就能在公开橱窗浏览当前可见的上架商品。登录后可以进入集市和摊位、关注店铺、加入购物车，并查看订单与预订。</p><router-link to="/discover">看看现在有哪些商品 <span aria-hidden="true">↗</span></router-link></article>
        <article class="path-card"><span class="path-number">02 / 经营摊位的人</span><h3>把小店打理妥当</h3><p>小贩选择集市、申请空闲摊位，获批后维护摊位资料与商品，处理用户订单和预订，也能回顾自己的经营收入。</p><router-link to="/login">以小贩身份进入 <span aria-hidden="true">↗</span></router-link></article>
        <article class="path-card"><span class="path-number">03 / 运营集市的人</span><h3>让日常运转更清晰</h3><p>集市管理员管理所属集市和摊位、审核入驻申请并查看运营数据；超级管理员负责平台层面的管理员与审批事务。</p><router-link to="/login">进入管理端 <span aria-hidden="true">↗</span></router-link></article>
      </div></section>
      <section class="about-last"><img :src="cups" alt="手作商品展示" /><div><span class="kicker">A MORE CONNECTED MARKET / 平台能力</span><h2>每一件好物背后，<br />都有一条清晰的连接。</h2><p>平台将商品、摊位、集市与对应身份关联起来，支持商品浏览、摊位申请、订单与预订处理。智能客服提供公开业务指引；具体订单、审批状态仍以登录后的对应页面为准。</p><p class="last-note">公开商品页仅供浏览；购买、预订和申请摊位等操作需要登录。</p><router-link to="/discover" class="primary-link">先逛逛发现好物 <span>↗</span></router-link></div></section>
    </main>
    <footer>智慧集市 · 让每一份用心被看见</footer>
  </div>
</template>

<style scoped>
.about-page { min-height: 100vh; color: #173d3a; background: #f6f4ed; }
.public-nav { width: min(100% - 80px, 1320px); height: 82px; display: flex; align-items: center; gap: 28px; margin: auto; border-bottom: 1px solid #dce3dd; }
.public-brand { display: flex; align-items: center; gap: 8px; font-size: 20px; color: #176b68; }
.public-brand small { align-self: end; margin: 0 0 3px 3px; font-size: 9px; letter-spacing: .18em; }
.public-nav nav { display: flex; gap: 32px; margin-left: auto; font-size: 13px; font-weight: 650; }
.public-nav nav a[aria-current=page] { color: #e99173; }
.nav-cta, .primary-link { display: inline-flex; align-items: center; gap: 32px; color: #fff; background: #176b68; border-radius: 999px; padding: 13px 20px; font-size: 13px; font-weight: 750; }
.nav-cta { background: #173d3a; }
.about-hero, .path-section, .about-last { width: min(100% - 80px, 1320px); margin: auto; }
.about-hero { min-height: 650px; display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 50px; padding: 80px 0; }
.kicker, .section-title > span { color: #176b68; font-size: 11px; font-weight: 800; letter-spacing: .18em; }
.hero-copy h1 { margin: 25px 0; font-family: 'Noto Serif SC','Songti SC',serif; font-size: clamp(42px, 4vw, 64px); line-height: 1.3; letter-spacing: -.07em; }
.hero-copy h1 em { color: #e99173; font-style: normal; }
.mobile-break { display: none; }
.hero-copy p, .about-last p { max-width: 520px; margin-bottom: 32px; color: #637c72; font-size: 16px; line-height: 1.9; }
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 24px; }
.text-link { color: #176b68; font-size: 13px; font-weight: 750; }
.platform-story { display: flex; align-items: center; gap: 7%; padding: 38px max(40px, calc((100vw - 1320px) / 2)); background: #e8f0e9; }
.story-label { flex: 0 0 23%; color: #176b68; font-size: 14px; font-weight: 800; }
.platform-story p { max-width: 870px; margin: 0; color: #496d60; font-size: 18px; line-height: 1.8; }
.hero-photos { display: grid; grid-template-columns: 1fr .75fr; align-items: center; gap: 16px; height: 470px; }
.hero-photos img { width: 100%; height: 82%; object-fit: cover; border: 6px solid #fff; border-radius: 160px 160px 30px 30px; box-shadow: 0 18px 40px #173d3a1f; }
.hero-photos img:last-child { height: 65%; margin-top: 80px; border-radius: 120px 120px 26px 26px; }
.path-section { padding: 65px 0 90px; border-top: 1px solid #dce3dd; }
.section-title h2, .about-last h2 { margin: 14px 0 28px; font-family: 'Noto Serif SC','Songti SC',serif; font-size: clamp(32px, 3.6vw, 52px); line-height: 1.35; }
.section-title > p { margin: -10px 0 30px; color: #637c72; line-height: 1.8; }
.path-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
.path-card { min-height: 285px; display: flex; flex-direction: column; padding: 28px; border: 1px solid #dce3dd; border-radius: 22px; background: #fff; }
.path-number { color: #e99173; font-size: 12px; font-weight: 800; }
.path-card h3 { margin: 20px 0 10px; font-size: 24px; }
.path-card p { color: #637c72; line-height: 1.85; font-size: 14px; }
.path-card a { margin-top: auto; color: #176b68; font-size: 13px; font-weight: 800; }
.path-card a span { margin-left: 8px; }
.about-last { display: grid; grid-template-columns: .85fr 1.15fr; align-items: center; gap: 8%; padding: 60px 0 95px; }
.about-last img { width: 100%; height: 360px; object-fit: cover; border-radius: 34px 180px 34px 34px; }
.about-last .last-note { margin-top: -15px; font-size: 13px; }
.about-page footer { padding: 35px 24px; background: #eaf1ec; color: #637c72; text-align: center; font-size: 12px; }
@media (max-width: 1024px) { .about-hero { min-height: auto; } .path-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 767px) { .public-nav, .about-hero, .path-section, .about-last { width: calc(100% - 36px); } .public-nav { height: 70px; gap: 10px; } .public-brand { font-size: 16px; } .public-brand small, .public-nav nav { display: none; } .nav-cta { margin-left: auto; padding: 10px 13px; gap: 8px; font-size: 12px; } .about-hero { display: block; padding: 55px 0 35px; } .hero-copy h1 { font-size: clamp(39px, 10vw, 62px); } .mobile-break { display: initial; } .hero-copy p { font-size: 14px; } .hero-photos { height: 270px; margin-top: 36px; } .platform-story { display: block; padding: 30px 18px; } .platform-story p { margin-top: 13px; font-size: 15px; } .path-section { padding: 45px 0 55px; } .path-grid { grid-template-columns: 1fr; } .path-card { min-height: 225px; } .about-last { grid-template-columns: 1fr; gap: 30px; padding: 10px 0 65px; } .about-last img { height: 260px; } }
</style>
