<template>
  <div ref="root" class="ui-dropdown">
    <button class="ui-dropdown__trigger" type="button" @click="toggle">
      <slot name="trigger" />
    </button>
    <Transition name="ui-dropdown">
      <div v-if="open" class="ui-dropdown__panel" @click="close">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const root = ref(null)
const open = ref(false)
const toggle = () => { open.value = !open.value }
const close = () => { open.value = false }
const handleOutsideClick = (event) => {
  if (!root.value?.contains(event.target)) close()
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>

<style scoped>
.ui-dropdown { position: relative; display: inline-flex; }
.ui-dropdown__trigger { display: inline-flex; align-items: center; border: 0; padding: 0; background: transparent; color: inherit; font: inherit; cursor: pointer; }
.ui-dropdown__panel { position: absolute; top: calc(100% + 10px); right: 0; z-index: 1200; min-width: 156px; padding: 7px; border: 1px solid var(--line); border-radius: 14px; background: var(--surface-card); box-shadow: 0 18px 42px rgba(24,49,59,.16); }
.ui-dropdown__panel :slotted(button) { display: flex; width: 100%; align-items: center; border: 0; border-radius: 9px; padding: 10px 12px; background: transparent; color: var(--ink); font: inherit; font-size: 13px; text-align: left; cursor: pointer; }
.ui-dropdown__panel :slotted(button:hover) { background: var(--brand-primary-soft); color: var(--brand-primary); }
.ui-dropdown-enter-active, .ui-dropdown-leave-active { transition: opacity .16s ease, transform .16s ease; }
.ui-dropdown-enter-from, .ui-dropdown-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
