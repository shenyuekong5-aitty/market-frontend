<script setup>
import { computed, onMounted, ref } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { getPublicProducts } from '@/api/public'
import { getFullUrl } from '@/utils/urlHelper'
import { homePathForRole } from '@/utils/roles'

const userStore = useUserStore()
const entryPath = computed(() => userStore.isLoggedIn ? homePathForRole(userStore.userInfo.role) : '/login')
const products = ref([])
const total = ref(0)
const page = ref(1)
const loading = ref(false)
const error = ref('')
const pageSize = 24

async function loadProducts(nextPage = 1) {
  if (loading.value) return
  loading.value = true
  error.value = ''
  try {
    const response = await getPublicProducts(nextPage, pageSize)
    const data = response.data || {}
    products.value = nextPage === 1 ? (data.items || []) : [...products.value, ...(data.items || [])]
    total.value = data.total || 0
    page.value = nextPage
  } catch (cause) {
    error.value = cause?.message || '商品加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => loadProducts())
</script>

<template>
  <div class="discover-page">
    <header class="public-nav">
      <router-link to="/welcome" class="public-brand">✳ <strong>智慧集市</strong><small>MARKET</small></router-link>
      <nav aria-label="公共页面导航"><router-link to="/discover" aria-current="page">发现好物</router-link><router-link to="/about">平台介绍</router-link></nav>
      <router-link class="nav-cta" :to="entryPath">{{ userStore.isLoggedIn ? '进入集市' : '登录 / 注册' }} ↗</router-link>
    </header>

    <main>
      <section class="catalog-hero"><div><span class="kicker">DISCOVER / 正在集市中</span><span class="browse-badge">浏览免登录</span><h1>看看现在，<em>有什么好物。</em></h1><p>以下是已开放集市中，摊位目前上架的真实商品。这里仅供浏览，购买和预订请登录后进行。</p></div><span class="hero-decoration" aria-hidden="true">✳</span></section>
      <div class="catalog-toolbar"><div><span class="toolbar-mark"></span><strong>在售商品</strong><span v-if="!loading || products.length">{{ total }} 件</span></div><span>价格与库存以进入摊位后的最新信息为准</span></div>

      <div v-if="loading && !products.length" class="catalog-status" role="status">正在加载商品…</div>
      <div v-else-if="error && !products.length" class="catalog-status"><strong>暂时无法加载商品</strong><p>{{ error }}</p><button type="button" @click="loadProducts(1)">重新加载 ↗</button></div>
      <div v-else-if="!products.length" class="catalog-status"><strong>现在还没有上架的商品</strong><p>你可以稍后再来看看，或先了解智慧集市。</p><router-link to="/about">了解智慧集市 ↗</router-link></div>
      <section v-else class="catalog-grid" aria-label="在售商品列表">
        <article v-for="product in products" :key="product.id" class="product-card">
          <div class="product-image">
            <img v-if="product.imageUrl" :src="getFullUrl(product.imageUrl)" :alt="product.name" loading="lazy" @error="$event.target.style.display = 'none'" />
            <span class="image-placeholder" aria-hidden="true">✳</span>
            <span v-if="product.stock <= 0" class="sold-badge">暂时缺货</span>
          </div>
          <div class="product-copy"><span class="market-name">{{ product.marketName }} · {{ product.boothName }}</span><h2>{{ product.name }}</h2><div class="product-bottom"><strong>¥{{ Number(product.price || 0).toFixed(2) }}</strong><span>只读展示</span></div></div>
        </article>
      </section>
      <div v-if="products.length && products.length < total" class="catalog-more"><button type="button" :disabled="loading" @click="loadProducts(page + 1)">{{ loading ? '加载中…' : '加载更多商品' }} <span aria-hidden="true">↓</span></button></div>
      <div v-if="error && products.length" class="more-error" role="status">{{ error }}，请重试。</div>
    </main>
    <footer><span>智慧集市 / SMART MARKET</span><router-link to="/about">认识这个平台 ↗</router-link></footer>
  </div>
</template>

<style scoped>
.discover-page { min-height: 100vh; color: #173d3a; background: #f6f4ed; }
.public-nav, .discover-page main, .discover-page footer { width: min(100% - 80px, 1320px); margin: auto; }
.public-nav { height: 82px; display: flex; align-items: center; gap: 28px; border-bottom: 1px solid #dce3dd; }
.public-brand { display: flex; align-items: center; gap: 8px; font-size: 20px; color: #176b68; }
.public-brand small { align-self: end; margin: 0 0 3px 3px; font-size: 9px; letter-spacing: .18em; }
.public-nav nav { display: flex; gap: 32px; margin-left: auto; font-size: 13px; font-weight: 650; }
.public-nav nav a[aria-current=page] { color: #e99173; }
.nav-cta { color: #fff; background: #173d3a; border-radius: 999px; padding: 13px 20px; font-size: 13px; font-weight: 750; }
.catalog-hero { position: relative; display: flex; justify-content: space-between; align-items: center; min-height: 310px; padding: 54px 0 58px; overflow: hidden; }
.kicker { color: #176b68; font-size: 11px; font-weight: 800; letter-spacing: .18em; }
.browse-badge { display: inline-block; margin-left: 12px; padding: 5px 9px; border-radius: 999px; background: #e4efe7; color: #176b68; font-size: 11px; font-weight: 750; }
.catalog-hero h1 { margin: 20px 0 10px; font-family: 'Noto Serif SC','Songti SC',serif; font-size: clamp(42px, 5vw, 70px); line-height: 1.35; letter-spacing: -.06em; }
.catalog-hero h1 em { color: #e99173; font-style: normal; }
.catalog-hero p { color: #607970; line-height: 1.85; font-size: 14px; }
.hero-decoration { margin: 0 8% 0 20px; color: #e99173; font-size: 130px; line-height: 1; }
.catalog-toolbar { display: flex; justify-content: space-between; gap: 14px; align-items: center; padding: 20px 0; border-top: 1px solid #dce3dd; border-bottom: 1px solid #dce3dd; color: #798d84; font-size: 12px; }
.catalog-toolbar > div { display: flex; align-items: center; gap: 10px; }
.catalog-toolbar strong { color: #173d3a; font-size: 16px; }
.toolbar-mark { width: 7px; height: 7px; border-radius: 50%; background: #e99173; }
.catalog-status { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; color: #61796f; text-align: center; }
.catalog-status strong { color: #173d3a; font-size: 24px; }
.catalog-status p { margin: 10px 0 20px; }
.catalog-status button, .catalog-status a { color: #176b68; font-weight: 750; }
.catalog-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 21px; padding: 30px 0 50px; }
.product-card { min-width: 0; overflow: hidden; border: 1px solid #e1e8e0; border-radius: 20px; background: #fff; box-shadow: 0 8px 25px #173d3a0d; }
.product-image { position: relative; width: 100%; aspect-ratio: 1.06; background: #e7eee8; }
.product-image img { position: relative; z-index: 1; width: 100%; height: 100%; object-fit: cover; }
.image-placeholder { position: absolute; inset: 0; display: grid; place-items: center; color: #bdd1c6; font-size: 65px; }
.sold-badge { position: absolute; z-index: 2; right: 10px; top: 10px; padding: 5px 9px; border-radius: 999px; background: #fff; color: #936645; font-size: 11px; font-weight: 750; }
.product-copy { padding: 17px; }
.market-name { color: #6a897e; font-size: 11px; font-weight: 700; }
.product-copy h2 { min-height: 50px; margin: 8px 0 16px; font-size: 19px; line-height: 1.4; }
.product-bottom { display: flex; justify-content: space-between; align-items: center; gap: 10px; border-top: 1px solid #edf0eb; padding-top: 13px; }
.product-bottom strong { color: #ce7659; font-size: 19px; }
.product-bottom span { color: #9aaca4; font-size: 11px; }
.catalog-more { display: flex; justify-content: center; padding: 5px 0 70px; }
.catalog-more button { padding: 13px 28px; border: 1px solid #176b68; border-radius: 999px; color: #176b68; font-weight: 750; }
.catalog-more button:disabled { opacity: .5; }
.more-error { padding-bottom: 25px; color: #b25d4c; text-align: center; font-size: 13px; }
.discover-page footer { display: flex; justify-content: space-between; padding: 28px 0 35px; border-top: 1px solid #dce3dd; color: #7a9087; font-size: 11px; }
@media (max-width: 1024px) { .catalog-grid { grid-template-columns: repeat(3,minmax(0,1fr)); gap: 14px; } }
@media (max-width: 767px) { .public-nav, .discover-page main, .discover-page footer { width: calc(100% - 36px); } .public-nav { height: 70px; gap: 10px; } .public-brand { font-size: 16px; } .public-brand small, .public-nav nav { display: none; } .nav-cta { margin-left: auto; padding: 10px 13px; font-size: 12px; } .catalog-hero { min-height: 240px; padding: 40px 0; } .catalog-hero h1 { font-size: clamp(38px, 9vw, 48px); } .catalog-hero h1 em { display: block; } .hero-decoration { display: none; } .catalog-toolbar > span { display: none; } .catalog-grid { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 11px; padding-top: 18px; } .product-card { border-radius: 15px; } .product-copy { padding: 11px; } .product-copy h2 { min-height: 45px; font-size: 15px; } .product-bottom strong { font-size: 15px; } .product-bottom span { display: none; } }
</style>
