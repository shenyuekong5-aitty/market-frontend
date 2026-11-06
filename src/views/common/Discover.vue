<script setup>
import PublicFooter from '@/components/PublicFooter.vue'
import CollectionToolbar from '@/components/CollectionToolbar.vue'
import { useCollectionSearch } from '@/composables/useCollectionSearch'
import PublicHeader from '@/components/PublicHeader.vue'
import { computed, onMounted, ref } from 'vue'
import { getPublicProducts } from '@/api/public'
import { getFullUrl } from '@/utils/urlHelper'

const products = ref([])
const total = ref(0)
const page = ref(1)
const loading = ref(false)
const error = ref('')
const pageSize = 24

const sortOrder = ref('default')
const { searchQuery, filteredRows } = useCollectionSearch(products, ['name', 'marketName', 'boothName'])
const visibleProducts = computed(() => {
  const rows = [...filteredRows.value]
  if (sortOrder.value === 'price-asc') rows.sort((a,b) => Number(a.price) - Number(b.price))
  if (sortOrder.value === 'price-desc') rows.sort((a,b) => Number(b.price) - Number(a.price))
  return rows
})

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
    <PublicHeader />

    <main>
      <section class="catalog-hero"><div><span class="kicker">THE MARKET EDIT / 好物橱窗</span><span class="browse-badge">浏览免登录</span><h1>好物，<em>正在这里。</em></h1><p>来自身边集市的在售商品。发现喜欢的好物，登录后即可购买或预订。</p></div></section>
      <div class="catalog-toolbar"><div><span class="toolbar-mark"></span><strong>在售商品</strong><span v-if="!loading || products.length">{{ total }} 件</span></div><span>价格与库存以进入摊位后的最新信息为准</span></div>

      <CollectionToolbar v-model="searchQuery" :count="visibleProducts.length" unit="件已加载商品" placeholder="搜索已加载的商品、集市或摊位…"><label class="catalog-sort">排序<select v-model="sortOrder" aria-label="商品排序"><option value="default">默认顺序</option><option value="price-asc">价格从低到高</option><option value="price-desc">价格从高到低</option></select></label></CollectionToolbar>
      <div v-if="loading && !products.length" class="catalog-status" role="status">正在加载商品…</div>
      <div v-else-if="error && !products.length" class="catalog-status"><strong>暂时无法加载商品</strong><p>{{ error }}</p><button type="button" @click="loadProducts(1)">重新加载 ↗</button></div>
      <div v-else-if="!products.length" class="catalog-status"><strong>现在还没有上架的商品</strong><p>你可以稍后再来看看，或先了解智慧集市。</p><router-link to="/about">了解智慧集市 ↗</router-link></div>
      <div v-else-if="!visibleProducts.length" class="catalog-status"><strong>没有找到匹配的好物</strong><p>试试其他关键词，或清空搜索再看看。</p><button type="button" @click="searchQuery = ''">查看全部已加载商品</button></div>
      <section v-else class="catalog-grid" aria-label="在售商品列表">
        <article v-for="product in visibleProducts" :key="product.id" class="product-card">
          <div class="product-image">
            <img v-if="product.imageUrl" :src="getFullUrl(product.imageUrl)" :alt="product.name" loading="lazy" @error="$event.target.style.display = 'none'" />
            <span class="image-placeholder" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.5"/><path d="m4 17 6-6 4 4 3-3 3 3"/></svg></span>
            <span v-if="product.stock <= 0" class="sold-badge">暂时缺货</span>
          </div>
          <div class="product-copy"><span class="market-name">{{ product.marketName }} · {{ product.boothName }}</span><h2>{{ product.name }}</h2><div class="product-bottom"><strong>¥{{ Number(product.price || 0).toFixed(2) }}</strong></div></div>
        </article>
      </section>
      <div v-if="products.length && products.length < total" class="catalog-more"><button type="button" :disabled="loading" @click="loadProducts(page + 1)">{{ loading ? '加载中…' : '加载更多商品' }} <span aria-hidden="true">↓</span></button></div>
      <div v-if="error && products.length" class="more-error" role="status">{{ error }}，请重试。</div>
    </main>
    <PublicFooter />
  </div>
</template>

<style scoped>
.discover-page { min-height: 100vh; color: var(--ink-strong); background: #fcfdf9; }
.discover-page main { width: min(100% - 96px, 1200px); margin: auto; }
.catalog-hero { padding: 52px 32px 38px; margin: 30px 0; border: 1px solid #e3e9d9; border-radius: 14px; background: #f0f4e9; }
.kicker { color: var(--brand-primary); font-size: 11px; letter-spacing: .1em; }
.browse-badge { margin-left: 16px; padding: 4px 8px; border-radius: 4px; color: var(--brand-primary); background: var(--brand-primary-soft); font-size: 11px; }
.catalog-hero h1 { margin: 22px 0 16px; font-size: clamp(30px, 3.5vw, 46px); line-height: 1.5; font-weight: 600; letter-spacing: -.03em; }
.catalog-hero h1 em { font-style: normal; color: var(--brand-primary); }
.catalog-hero p { color: var(--ink-muted); font-size: 14px; line-height: 1.9; max-width: 640px; }
.catalog-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 0 24px; border-bottom: 1px solid var(--line); margin-bottom: 24px; color: var(--ink-muted); font-size: 12px; }
.catalog-toolbar > div { display: flex; align-items: center; gap: 12px; }
.catalog-toolbar strong { font-size: 16px; color: var(--ink-strong); font-weight: 600; }
.toolbar-mark { width: 3px; height: 15px; background: var(--brand-primary); }
.catalog-status { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 340px; padding: 36px 0; color: var(--ink-muted); text-align: center; font-size: 14px; }
.catalog-status strong { color: var(--ink-strong); font-size: 21px; font-weight: 500; }
.catalog-status p { line-height: 1.8; margin: 12px 0 24px; }
.catalog-status button, .catalog-status a { border: 1px solid var(--line); border-radius: 6px; padding: 10px 20px; color: var(--brand-primary); }
.catalog-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 32px 24px; padding: 2px 0 48px; }
.product-card { min-width: 0; border: 1px solid var(--line); border-radius: 12px; background: #fff; overflow: hidden; transition: border-color .2s; }.product-card:hover { border-color: #a7bd9b; }
.product-image { position: relative; overflow: hidden; aspect-ratio: 1; border-radius: 0; background: var(--surface-subtle); }
.product-image img { position: relative; z-index: 1; width: 100%; height: 100%; object-fit: cover; transition: transform .25s ease; }
.product-card:hover img { transform: scale(1.035); }
.image-placeholder svg { width: 36px; height: 36px; }
.catalog-sort { display: flex; align-items: center; gap: 10px; font-size: 11px; color: var(--ink-muted); }.catalog-sort select { color: var(--ink); padding: 8px; border-radius: 6px; border: 1px solid var(--line); background: #fff; font-size: 11px; }
.image-placeholder { position: absolute; inset: 0; display: grid; place-items: center; color: #b7c7bd; font-size: 42px; }
.sold-badge { position: absolute; z-index: 2; top: 12px; right: 12px; padding: 5px 9px; background: #fff; color: var(--ink-muted); border-radius: 4px; font-size: 11px; }
.product-copy { padding: 18px 18px 20px; }
.market-name { color: var(--ink-muted); font-size: 11px; overflow-wrap: anywhere; }
.product-copy h2 { margin: 8px 0 12px; font-size: 16px; font-weight: 500; line-height: 1.6; overflow-wrap: anywhere; }
.product-bottom strong { color: var(--ink-strong); font-size: 18px; font-weight: 600; }
.catalog-more { text-align: center; padding: 0 0 48px; }
.catalog-more button { padding: 12px 26px; border: 1px solid var(--line); border-radius: 6px; color: var(--brand-primary); font-size: 13px; }
.catalog-more button:disabled { opacity: .5; cursor: wait; }
.more-error { text-align: center; color: var(--danger); padding-bottom: 24px; font-size: 13px; }
@media (max-width: 1024px) { .catalog-grid { grid-template-columns: repeat(3,minmax(0,1fr)); } }
@media (max-width: 767px) { .discover-page main { width: calc(100% - 40px); } .catalog-hero { padding: 28px 20px; margin: 24px 0; } .catalog-hero h1 { font-size: 30px; } .catalog-hero h1 em { display: block; } .catalog-toolbar > span { display: none; } .catalog-grid { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 24px 14px; } .product-copy { padding: 13px; }.product-copy h2 { font-size: 14px; } .product-bottom strong { font-size: 16px; } .catalog-status { min-height: 300px; } }
@media (prefers-reduced-motion: reduce) { .product-card img { transition: none; } }
</style>
