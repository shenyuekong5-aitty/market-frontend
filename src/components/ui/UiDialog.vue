<template>
  <Teleport to="body">
    <Transition name="ui-dialog">
      <div v-if="modelValue" class="ui-dialog-layer" @click.self="handleBackdrop">
        <section ref="dialogRef" tabindex="-1" :aria-labelledby="titleId" @keydown.tab="trapFocus" v-bind="$attrs" class="ui-dialog" :class="{ 'is-centered': center }" :style="{ width: normalizedWidth }" role="dialog" aria-modal="true">
          <header class="ui-dialog__header">
            <h2 :id="titleId">{{ title }}</h2>
            <button class="ui-dialog__close" type="button" aria-label="关闭" @click="close">×</button>
          </header>
          <div class="ui-dialog__body"><slot /></div>
          <footer v-if="$slots.footer" class="ui-dialog__footer"><slot name="footer" /></footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, useId, watch } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: '' },
  width: { type: [String, Number], default: '520px' },
  center: Boolean,
  closeOnClickModal: { type: Boolean, default: true }
})
const emit = defineEmits(['update:modelValue', 'close'])
const dialogRef = ref(null)
const titleId = useId()
let previousFocus
const focusable = () => [...(dialogRef.value?.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]') || [])].filter(node => node.getClientRects().length)
const trapFocus = event => {
  const nodes = focusable()
  if (!nodes.length) { event.preventDefault(); dialogRef.value?.focus(); return }
  if (event.shiftKey && (document.activeElement === nodes[0] || document.activeElement === dialogRef.value)) { event.preventDefault(); nodes.at(-1).focus() }
  else if (!event.shiftKey && (document.activeElement === nodes.at(-1) || document.activeElement === dialogRef.value)) { event.preventDefault(); nodes[0].focus() }
}
watch(() => props.modelValue, async open => {
  if (open) {
    previousFocus = document.activeElement
    await nextTick()
    // Focus the dialog without opening the mobile keyboard.
    dialogRef.value?.focus()
  } else if (previousFocus?.isConnected) previousFocus.focus()
})
const normalizedWidth = computed(() => typeof props.width === 'number' ? `${props.width}px` : props.width)
const close = () => { emit('update:modelValue', false); emit('close') }
const handleBackdrop = () => { if (props.closeOnClickModal) close() }
const handleEscape = (event) => { if (event.key === 'Escape' && props.modelValue) close() }
onMounted(() => window.addEventListener('keydown', handleEscape))
onUnmounted(() => window.removeEventListener('keydown', handleEscape))
</script>

<style scoped>
.ui-dialog-layer { position: fixed; inset: 0; z-index: 2000; display: grid; place-items: center; padding: 20px; background: rgba(24,49,59,.42); backdrop-filter: blur(2px); }
.ui-dialog { max-width: 100%; max-height: calc(100dvh - 40px); display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--surface-card); box-shadow: 0 24px 80px #15251f28; outline: none; }
.ui-dialog__header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 20px 24px; border-bottom: 1px solid var(--line); background: #fff; }.ui-dialog__header h2 { margin: 0; color: var(--ink-strong); font-size: 17px; font-weight: 600; }.ui-dialog__close { width: 30px; height: 30px; border: 0; border-radius: 50%; background: transparent; color: var(--ink-muted); font-size: 24px; line-height: 1; cursor: pointer; }.ui-dialog__close:hover { background: var(--brand-primary-soft); color: var(--brand-primary); }
.ui-dialog__body { overflow: auto; padding: 24px; }.ui-dialog__footer { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 24px 20px; border-top: 1px solid var(--line); background: #fafbf7; }
.ui-dialog-enter-active,.ui-dialog-leave-active { transition: opacity .2s ease; }.ui-dialog-enter-from,.ui-dialog-leave-to { opacity: 0; }.ui-dialog-enter-active .ui-dialog,.ui-dialog-leave-active .ui-dialog { transition: transform .2s ease; }.ui-dialog-enter-from .ui-dialog,.ui-dialog-leave-to .ui-dialog { transform: translateY(12px) scale(.98); }
@media (min-width: 768px) and (max-width: 1024px) { .ui-dialog { max-width: min(92vw, 680px); } }
@media (max-width: 767px) { .ui-dialog-layer { padding: 12px; }.ui-dialog { width: 100% !important; max-height: calc(100dvh - 24px); border-radius: 14px; }.ui-dialog__header { padding: 16px 18px; }.ui-dialog__body { padding: 18px; }.ui-dialog__footer { padding: 12px 18px 16px; } }
</style>
