import { computed, onMounted, onUnmounted, ref } from 'vue'

// 与页面样式统一：手机 ≤767px，平板 768–1024px，桌面 ≥1025px。
const MOBILE_QUERY = '(max-width: 767px)'
const TABLET_QUERY = '(min-width: 768px) and (max-width: 1024px)'

function currentDevice() {
  if (typeof window === 'undefined') return 'desktop'
  if (window.matchMedia(MOBILE_QUERY).matches) return 'mobile'
  if (window.matchMedia(TABLET_QUERY).matches) return 'tablet'
  return 'desktop'
}

export function useDevice() {
  const device = ref(currentDevice())
  const isMobile = computed(() => device.value === 'mobile')
  const isTablet = computed(() => device.value === 'tablet')
  const isDesktop = computed(() => device.value === 'desktop')

  let queries = []
  const sync = () => { device.value = currentDevice() }

  onMounted(() => {
    queries = [window.matchMedia(MOBILE_QUERY), window.matchMedia(TABLET_QUERY)]
    queries.forEach(query => query.addEventListener('change', sync))
    sync()
  })
  onUnmounted(() => {
    queries.forEach(query => query.removeEventListener('change', sync))
  })

  return { device, isMobile, isTablet, isDesktop }
}
