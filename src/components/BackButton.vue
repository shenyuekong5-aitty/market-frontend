<template>
  <div v-if="visible" class="back-bar" role="button" tabindex="0" @click="goBack" @keydown.enter="goBack" @keydown.space.prevent="goBack">
    <span class="back-arrow">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </span>
    <span class="back-label">{{ label }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDevice } from '@/composables/useDevice'

const router = useRouter()
const route = useRoute()

const props = defineProps({
  label: { type: String, default: '返回' },
  mobileNames: {
    type: Array,
    default: () => ['MarketList', 'Cart', 'Follows', 'SharedMessages', 'MarketDetail', 'BoothDetail'],
  },
})

const { isDesktop } = useDevice()

// 逻辑：只要页面不是首页，并且在移动端/平板端指定的页面列表中，就显示返回按钮
const visible = computed(() => {
  if (route.path === '/') return false
  if (isDesktop.value) return false
  return props.mobileNames.includes(route.name)
})

function goBack() {
  router.back()
}

</script>

<style scoped>
.back-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--surface-page); /* 与主页背景融合 */
  border-bottom: 1px solid var(--line);
}

.back-arrow {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--ink-strong);
  background: var(--surface-card);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--line);
  transition: background 0.2s ease, transform 0.2s ease;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.back-arrow:active {
  background: var(--line);
  transform: scale(0.92);
}

/* 桌面悬停效果 */
@media (hover: hover) {
  .back-arrow:hover {
    background: var(--brand-primary-soft);
  }
}

.back-arrow svg {
  display: block;
  width: 20px;
  height: 20px;
}

.back-label {
  font-size: 0.9rem;
  color: var(--ink-muted);
  font-weight: 400;
  letter-spacing: 0.02em;
}

/* ============================================================
   移动端响应式调整 (< 768px)
   ============================================================ */
@media (max-width: 767px) {
  .back-bar {
    padding: 8px 12px;
    gap: 8px;
  }
  .back-arrow {
    width: 32px;
    height: 32px;
  }
  .back-arrow svg {
    width: 18px;
    height: 18px;
  }
  .back-label {
    font-size: 0.85rem;
  }
}

/* ============================================================
   平板端响应式调整 (768px - 1024px)
   ============================================================ */
@media (min-width: 768px) and (max-width: 1024px) {
  .back-bar {
    padding: 16px 32px;
    gap: 14px;
  }
  .back-arrow {
    width: 44px;
    height: 44px;
  }
  .back-arrow svg {
    width: 22px;
    height: 22px;
  }
  .back-label {
    font-size: 1rem;
  }
}

/* ============================================================
   桌面端 (>= 1025px) 隐藏返回栏
   ============================================================ */
@media (min-width: 1025px) {
  .back-bar {
    display: none;
  }
}
</style>
