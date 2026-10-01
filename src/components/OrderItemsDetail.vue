<script setup>
import { computed } from 'vue'
import { getFullUrl } from '@/utils/urlHelper'

const props = defineProps({
  items: { type: Array, default: () => [] },
  total: { type: [Number, String], default: null },
})

const amount = computed(() => props.total == null
  ? props.items.reduce((sum, item) => sum + Number(item.productPrice || 0) * Number(item.quantity || 0), 0)
  : Number(props.total))
const money = value => `¥${Number(value || 0).toFixed(2)}`
</script>

<template>
  <div class="order-items-detail">
    <p v-if="!items.length" class="empty-detail">暂无商品明细</p>
    <div v-else class="items-list">
      <article v-for="(item, index) in items" :key="item.id || `${item.productName}-${index}`" class="item-row">
        <div class="item-photo">
          <img v-if="item.productImageUrl" :src="getFullUrl(item.productImageUrl)" :alt="item.productName" @error="$event.target.style.display = 'none'" />
          <span aria-hidden="true">✳</span>
        </div>
        <div class="item-info">
          <h3>{{ item.productName || '商品' }}</h3>
          <p>单价 {{ money(item.productPrice) }} <span aria-hidden="true">·</span> 数量 {{ item.quantity || 0 }}</p>
        </div>
        <strong class="item-subtotal">{{ money(Number(item.productPrice || 0) * Number(item.quantity || 0)) }}</strong>
      </article>
    </div>
    <div v-if="items.length" class="detail-summary"><span>商品合计</span><strong>{{ money(amount) }}</strong></div>
  </div>
</template>

<style scoped>
.order-items-detail { color: #173d3a; }
.items-list { display: grid; gap: 10px; }
.item-row { display: flex; align-items: center; gap: 14px; min-width: 0; padding: 12px; border: 1px solid #e3ebe7; border-radius: 16px; background: #fcfdfb; }
.item-photo { position: relative; width: 62px; height: 62px; flex: none; overflow: hidden; border-radius: 12px; background: #e8f0ec; }
.item-photo img { position: relative; z-index: 1; width: 100%; height: 100%; object-fit: cover; }
.item-photo span { position: absolute; inset: 0; display: grid; place-items: center; color: #a6c4b6; font-size: 25px; }
.item-info { min-width: 0; flex: 1; }
.item-info h3 { margin: 0 0 7px; overflow-wrap: anywhere; font-size: 15px; line-height: 1.4; }
.item-info p { margin: 0; color: #748c82; font-size: 12px; }
.item-info p span { margin: 0 3px; }
.item-subtotal { flex: none; color: #176b68; font-size: 15px; white-space: nowrap; }
.detail-summary { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 20px; padding: 18px 2px 2px; border-top: 1px solid #e3ebe7; font-size: 14px; }
.detail-summary strong { color: #176b68; font-size: 22px; }
.empty-detail { margin: 0; padding: 26px; border-radius: 14px; background: #f5f8f5; color: #748c82; text-align: center; }
@media (max-width: 767px) { .items-list { gap: 8px; } .item-row { flex-wrap: wrap; gap: 10px; padding: 10px; } .item-photo { width: 54px; height: 54px; } .item-info h3 { font-size: 14px; } .item-subtotal { margin-left: 64px; } .detail-summary { margin-top: 14px; } }
</style>
