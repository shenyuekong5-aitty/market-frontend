<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { homePathForRole } from '@/utils/roles'
import vegetables from '@/assets/landing/market-vegetables.jpg'
import cups from '@/assets/landing/handmade-cups.jpg'
import flowers from '@/assets/landing/market-flowers.jpg'
import bread from '@/assets/landing/artisan-bread.jpg'
import fruit from '@/assets/landing/market-fruit.jpg'

const userStore = useUserStore()
const entryPath = computed(() => userStore.isLoggedIn
  ? homePathForRole(userStore.userInfo.role)
  : '/login')
const entryText = computed(() => userStore.isLoggedIn ? '进入集市' : '登录探索')

const scenes = [
  { image: flowers, name: '花艺绿植', className: 'scene-flower', alt: '集市中的鲜花花束' },
  { image: vegetables, name: '新鲜蔬果', className: 'scene-vegetable', alt: '摊位上的新鲜蔬菜' },
  { image: bread, name: '手作烘焙', className: 'scene-bread', alt: '手工烘焙面包' },
  { image: fruit, name: '时令水果', className: 'scene-fruit', alt: '集市中的各色水果' },
  { image: cups, name: '手作好物', className: 'scene-cup', alt: '集市摊位上的手作杯具' },
]
</script>

<template>
  <div class="welcome-page">
    <header class="welcome-header">
      <router-link class="welcome-brand" to="/welcome" aria-label="智慧集市首页">
        <span class="brand-symbol" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none">
            <path d="M7 23.5 24 9l17 14.5v16H7v-16Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M7 24h34M16 24v15M32 24v15M20 39V29h8v10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <path d="m15 9 4 3m14-3-4 3" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="brand-wordmark">智慧集市<span>MARKET</span></span>
      </router-link>

      <nav class="welcome-nav" aria-label="首页导航">
        <router-link to="/discover">发现好物</router-link>
        <router-link to="/about">平台介绍</router-link>
      </nav>

      <div class="welcome-account">
        <router-link v-if="!userStore.isLoggedIn" class="account-login" to="/login">登录</router-link>
        <router-link class="account-entry" :to="entryPath">
          {{ userStore.isLoggedIn ? '进入集市' : '立即开始' }}
          <span aria-hidden="true">↗</span>
        </router-link>
      </div>
    </header>

    <main>
      <section id="discover" class="welcome-hero" aria-labelledby="welcome-title">
        <div class="hero-copy">
          <div class="hero-eyebrow"><span></span> A MARKET CLOSE TO YOU <span class="eyebrow-cn">/ 发现身边</span></div>
          <h1 id="welcome-title">把好物，<br /><em>逛</em>进日常。</h1>
          <p class="hero-description">从正在营业的集市，到用心经营的摊位。<br class="desktop-break" />在这里发现喜欢的商品，也让你的好物被看见。</p>

          <div class="hero-actions">
            <router-link class="hero-primary" :to="entryPath">
              {{ entryText }}
              <span class="button-arrow" aria-hidden="true">↗</span>
            </router-link>
            <router-link v-if="!userStore.isLoggedIn" class="hero-secondary" to="/register">还没有账号？注册 <span aria-hidden="true">→</span></router-link>
          </div>

          <div class="hero-note"><span class="note-spark" aria-hidden="true">✳</span> 逛集市 · 找摊位 · 发现好物</div>
        </div>

        <div class="hero-art" aria-label="集市好物图片展示">
          <div class="art-orbit art-orbit-one" aria-hidden="true"></div>
          <div class="art-orbit art-orbit-two" aria-hidden="true"></div>
          <figure v-for="scene in scenes" :key="scene.name" class="scene-card" :class="scene.className">
            <img :src="scene.image" :alt="scene.alt" loading="eager" decoding="async" />
            <figcaption>{{ scene.name }}</figcaption>
          </figure>
          <div class="art-sticker" aria-hidden="true">好物<br />就在身边<span>↗</span></div>
          <span class="art-star art-star-one" aria-hidden="true">✳</span>
          <span class="art-star art-star-two" aria-hidden="true">✳</span>
        </div>

        <div class="hero-scroll" aria-hidden="true"><span></span> SCROLL TO EXPLORE</div>
      </section>

      <section id="how-it-works" class="welcome-steps" aria-labelledby="steps-title">
        <div class="steps-heading">
          <p>MADE FOR YOUR EVERYDAY</p>
          <h2 id="steps-title">从发现，到相遇。</h2>
        </div>
        <div class="steps-list">
          <div class="step"><span>01</span><h3>探索集市</h3><p>查看开放中的集市，找到想去的地方。</p></div>
          <div class="step"><span>02</span><h3>发现商品</h3><p>浏览摊位和上架好物，找到心仪之选。</p></div>
          <div class="step"><span>03</span><h3>参与经营</h3><p>申请摊位，让更多人认识你的好物。</p></div>
        </div>
        <router-link class="steps-more" to="/about">认识智慧集市 <span aria-hidden="true">↗</span></router-link>
      </section>
    </main>

    <footer class="welcome-footer"><span>智慧集市 / SMART MARKET</span><span>让每一次相遇，都有新发现。</span></footer>
  </div>
</template>

<style scoped>
.welcome-page { --welcome-ink: #173d3a; --welcome-green: #176b68; --welcome-coral: #e99173; color: var(--welcome-ink); background: #f6f4ed; min-height: 100vh; overflow: hidden; }
.welcome-header { width: min(100% - 96px, 1440px); min-height: 88px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 32px; border-bottom: 1px solid rgba(23, 61, 58, .13); }
.welcome-brand { display: inline-flex; align-items: center; gap: 11px; flex: none; }
.brand-symbol { width: 39px; height: 39px; display: grid; place-items: center; border-radius: 50%; color: #fff; background: var(--welcome-green); }
.brand-symbol svg { width: 27px; height: 27px; }
.brand-wordmark { font-size: 20px; line-height: 1.08; letter-spacing: .02em; font-weight: 850; }
.brand-wordmark span { display: block; margin-top: 5px; font-size: 8px; letter-spacing: .32em; font-weight: 700; color: #76918a; }
.welcome-nav, .welcome-account { display: flex; align-items: center; }
.welcome-nav { gap: 38px; margin-left: auto; margin-right: 36px; }
.welcome-nav a, .account-login { font-size: 13px; font-weight: 650; transition: color .2s; }
.welcome-nav a:hover, .account-login:hover { color: var(--welcome-green); }
.welcome-account { gap: 26px; flex: none; }
.account-entry { display: inline-flex; align-items: center; justify-content: center; gap: 20px; padding: 12px 17px 12px 21px; min-height: 42px; background: var(--welcome-ink); border-radius: 999px; color: #fff; font-size: 13px; font-weight: 700; transition: transform .2s, background .2s; }
.account-entry:hover, .hero-primary:hover { transform: translateY(-2px); background: #105450; }
.account-entry span { font-size: 17px; line-height: 1; }
.welcome-hero { position: relative; width: min(100% - 96px, 1440px); min-height: min(710px, calc(100svh - 88px)); margin: 0 auto; display: grid; grid-template-columns: minmax(0, .88fr) minmax(0, 1.12fr); align-items: center; gap: 14px; padding: 32px 0 54px; }
.hero-copy { z-index: 2; padding-bottom: 30px; }
.hero-eyebrow { display: flex; align-items: center; gap: 11px; color: var(--welcome-green); font-size: 11px; letter-spacing: .13em; font-weight: 850; white-space: nowrap; }
.hero-eyebrow > span:first-child { width: 30px; height: 1px; background: var(--welcome-green); }
.eyebrow-cn { color: #7b8e88; letter-spacing: .05em; font-weight: 600; }
.hero-copy h1 { margin: 29px 0 23px; color: var(--welcome-ink); font-family: 'Noto Serif SC', 'Songti SC', 'STSong', Georgia, serif; font-size: clamp(64px, 6.3vw, 104px); line-height: 1.14; letter-spacing: -.075em; font-weight: 700; white-space: nowrap; }
.hero-copy h1 em { position: relative; color: var(--welcome-coral); font-style: normal; }
.hero-copy h1 em::after { position: absolute; content: ''; left: 8%; right: -4%; bottom: -9px; height: 13px; border-bottom: 3px solid var(--welcome-coral); border-radius: 50%; transform: rotate(-8deg); }
.hero-description { max-width: 465px; color: #607771; font-size: clamp(15px, 1.15vw, 17px); line-height: 1.95; letter-spacing: .025em; }
.hero-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 28px; margin-top: 36px; }
.hero-primary { display: inline-flex; align-items: center; justify-content: space-between; gap: 45px; padding: 11px 11px 11px 29px; min-width: 183px; min-height: 55px; color: #fff; background: var(--welcome-green); border-radius: 999px; font-size: 15px; font-weight: 750; box-shadow: 0 16px 28px rgba(23,107,104,.19); transition: transform .2s, background .2s; }
.button-arrow { display: grid; place-items: center; width: 35px; height: 35px; border-radius: 50%; color: var(--welcome-green); background: #fff; font-size: 19px; line-height: 1; }
.hero-secondary { color: var(--welcome-ink); border-bottom: 1px solid currentColor; padding-bottom: 3px; font-size: 13px; font-weight: 650; }
.hero-secondary span { margin-left: 7px; }
.hero-secondary:hover { color: var(--welcome-green); }
.hero-note { display: flex; align-items: center; gap: 11px; margin-top: 62px; color: #8ba09a; font-size: 12px; letter-spacing: .08em; }
.note-spark { color: var(--welcome-coral); font-size: 22px; line-height: 1; }
.hero-art { position: relative; height: min(610px, 64vw); min-height: 530px; isolation: isolate; }
.art-orbit { position: absolute; z-index: -1; border: 1px solid rgba(30, 104, 99, .1); border-radius: 50%; pointer-events: none; }
.art-orbit-one { width: 570px; height: 570px; top: 0; left: 5%; }
.art-orbit-two { width: 400px; height: 400px; top: 15%; left: 19%; }
.scene-card { position: absolute; overflow: hidden; margin: 0; border: 5px solid #fff; background: #e2e7df; box-shadow: 0 16px 45px rgba(23, 61, 58, .14); transition: transform .35s ease, box-shadow .35s ease; }
.scene-card:hover { z-index: 5; transform: translateY(-8px) rotate(0); box-shadow: 0 24px 55px rgba(23, 61, 58, .2); }
.scene-card img { width: 100%; height: 100%; object-fit: cover; }
.scene-card figcaption { position: absolute; left: 13px; bottom: 12px; padding: 7px 12px; border-radius: 999px; color: var(--welcome-ink); background: rgba(255,255,255,.94); font-size: 11px; font-weight: 800; box-shadow: 0 4px 12px rgba(0,0,0,.07); }
.scene-flower { width: 27%; height: 33%; left: 5%; top: 7%; border-radius: 105px 105px 24px 24px; transform: rotate(-7deg); }
.scene-vegetable { width: 43%; height: 58%; left: 31%; top: 10%; border-radius: 180px 180px 28px 28px; transform: rotate(3deg); }
.scene-bread { width: 25%; height: 29%; right: 0; top: 6%; border-radius: 24px 90px 24px 24px; transform: rotate(9deg); }
.scene-fruit { width: 31%; height: 33%; left: 3%; bottom: 4%; border-radius: 25px 25px 25px 100px; transform: rotate(5deg); }
.scene-cup { width: 34%; height: 34%; right: 3%; bottom: 2%; border-radius: 25px 25px 100px 25px; transform: rotate(-6deg); }
.art-sticker { position: absolute; z-index: 4; right: 19%; bottom: 20%; display: flex; align-items: center; justify-content: center; flex-direction: column; width: 106px; height: 106px; border-radius: 50%; transform: rotate(13deg); color: #fff; background: var(--welcome-coral); text-align: center; font-size: 14px; line-height: 1.35; font-weight: 850; letter-spacing: .03em; box-shadow: 0 11px 22px rgba(156,84,62,.2); }
.art-sticker span { position: absolute; right: 17px; top: 20px; font-size: 15px; }
.art-star { position: absolute; z-index: 4; color: var(--welcome-coral); line-height: 1; }
.art-star-one { left: 24%; top: 3%; font-size: 28px; }
.art-star-two { right: 7%; bottom: 34%; font-size: 38px; }
.hero-scroll { position: absolute; bottom: 28px; left: 0; display: flex; align-items: center; gap: 13px; color: #91a39d; font-size: 10px; font-weight: 750; letter-spacing: .2em; }
.hero-scroll span { height: 1px; width: 35px; background: #91a39d; }
.welcome-steps { padding: 70px max(48px, calc((100vw - 1440px) / 2)); background: #eaf1ec; display: grid; grid-template-columns: .9fr 2.1fr; gap: 56px; }
.steps-heading p { color: var(--welcome-green); font-size: 10px; letter-spacing: .2em; font-weight: 800; }
.steps-heading h2 { margin-top: 15px; font-family: 'Noto Serif SC', 'Songti SC', 'STSong', Georgia, serif; font-size: clamp(28px, 2.6vw, 40px); letter-spacing: -.04em; }
.steps-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 26px; }
.step { border-left: 1px solid #bdd1c6; padding-left: 20px; }
.step > span { color: var(--welcome-coral); font-size: 12px; font-weight: 850; }
.step h3 { margin: 14px 0 7px; font-size: 17px; }
.step p { color: #6a8178; font-size: 13px; line-height: 1.8; }
.steps-more { grid-column: 2; justify-self: start; color: var(--welcome-green); border-bottom: 1px solid currentColor; padding-bottom: 4px; font-size: 12px; font-weight: 750; }
.welcome-footer { max-width: 1440px; min-height: 82px; margin: 0 auto; padding: 0 48px; display: flex; align-items: center; justify-content: space-between; gap: 20px; color: #82968d; font-size: 11px; letter-spacing: .06em; }
@media (max-width: 1024px) {
  .welcome-header, .welcome-hero { width: min(100% - 64px, 900px); }
  .welcome-nav { gap: 22px; margin-right: 12px; }
  .welcome-hero { min-height: auto; grid-template-columns: 1fr; gap: 2px; padding: 66px 0 60px; }
  .hero-copy { padding-bottom: 0; }
  .hero-copy h1 { font-size: clamp(64px, 9vw, 92px); }
  .hero-note { margin-top: 36px; }
  .hero-art { width: min(100%, 740px); height: 560px; min-height: 0; margin: -5px auto 0; }
  .hero-scroll { bottom: 12px; }
  .welcome-steps { grid-template-columns: 1fr; gap: 30px; padding: 56px 32px; }
  .steps-more { grid-column: 1; }
}
@media (max-width: 767px) {
  .welcome-header, .welcome-hero { width: calc(100% - 36px); }
  .welcome-header { min-height: 72px; gap: 10px; }
  .brand-symbol { width: 34px; height: 34px; }
  .brand-symbol svg { width: 24px; height: 24px; }
  .brand-wordmark { font-size: 17px; }
  .brand-wordmark span { font-size: 7px; }
  .welcome-nav, .account-login { display: none; }
  .welcome-account { margin-left: auto; }
  .account-entry { min-height: 38px; padding: 8px 11px 8px 14px; gap: 7px; font-size: 12px; }
  .welcome-hero { padding: 48px 0 58px; }
  .hero-eyebrow { font-size: 9px; gap: 7px; letter-spacing: .08em; }
  .hero-eyebrow > span:first-child { width: 19px; }
  .eyebrow-cn { display: none; }
  .hero-copy h1 { margin: 24px 0 22px; font-size: clamp(52px, 13vw, 74px); line-height: 1.17; }
  .hero-description { font-size: 14px; line-height: 1.85; }
  .desktop-break { display: none; }
  .hero-actions { gap: 22px; margin-top: 28px; }
  .hero-primary { min-height: 51px; min-width: 163px; padding-left: 22px; gap: 22px; font-size: 14px; }
  .hero-secondary { font-size: 12px; }
  .hero-note { margin-top: 30px; font-size: 11px; }
  .hero-art { width: 100%; height: clamp(340px, 91vw, 500px); margin-top: 14px; }
  .art-orbit-one { width: 88%; height: auto; aspect-ratio: 1; }
  .art-orbit-two { width: 62%; height: auto; aspect-ratio: 1; }
  .scene-card { border-width: 3px; }
  .scene-card figcaption { bottom: 7px; left: 7px; padding: 5px 7px; font-size: 9px; }
  .scene-flower { width: 30%; left: 3%; }
  .scene-vegetable { width: 45%; left: 29%; }
  .scene-bread { width: 27%; right: 0; }
  .scene-fruit { width: 33%; left: 2%; }
  .scene-cup { width: 35%; right: 3%; }
  .art-sticker { width: 73px; height: 73px; font-size: 10px; right: 17%; bottom: 20%; }
  .art-sticker span { right: 12px; top: 11px; font-size: 11px; }
  .hero-scroll { bottom: 18px; left: 0; font-size: 9px; }
  .welcome-steps { padding: 46px 18px; gap: 25px; }
  .steps-list { grid-template-columns: 1fr; gap: 22px; }
  .step { padding-left: 16px; }
  .step h3 { margin: 5px 0 3px; font-size: 16px; }
  .welcome-footer { min-height: 72px; padding: 0 18px; flex-wrap: wrap; gap: 4px; align-content: center; font-size: 10px; }
}
@media (prefers-reduced-motion: reduce) {
  .scene-card, .hero-primary, .account-entry { transition: none; }
}
</style>
