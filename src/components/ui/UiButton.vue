<template>
  <button class="ui-button" :class="[`is-${type}`, `is-${size}`, { 'is-plain': plain, 'is-circle': circle, 'is-round': round, 'is-text': text, 'is-link': link, 'is-loading': loading }]" :type="nativeType" :disabled="disabled || loading" v-bind="$attrs">
    <span v-if="loading" class="ui-button__spinner" aria-hidden="true" />
    <component :is="icon" v-else-if="icon" class="ui-button__icon" />
    <span v-if="$slots.default" class="ui-button__label"><slot /></span>
  </button>
</template>
<script setup>
defineProps({
  type: { type: String, default: 'default' },
  size: { type: String, default: 'default' },
  plain: Boolean,
  circle: Boolean,
  round: Boolean,
  text: Boolean,
  link: Boolean,
  loading: Boolean,
  disabled: Boolean,
  icon: [Object, Function],
  nativeType: { type: String, default: 'button' }
})
</script>
<style scoped>
.ui-button { min-height: 38px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 0 16px; border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--surface-card); color: var(--ink-strong); font: inherit; font-size: 14px; font-weight: 650; cursor: pointer; transition: transform .18s ease, box-shadow .18s ease, background .18s ease, color .18s ease; }
.ui-button:hover:not(:disabled) { transform: translateY(-1px); border-color: var(--brand-primary); color: var(--brand-primary); }
.ui-button:disabled { cursor: not-allowed; opacity: .55; }
.ui-button.is-small { min-height: 32px; padding: 0 12px; font-size: 12px; }.ui-button.is-large { min-height: 44px; padding: 0 20px; }
.ui-button.is-primary { border-color: var(--brand-primary); background: var(--brand-primary); color: #fff; box-shadow: 0 6px 14px rgba(23,107,104,.18); }.ui-button.is-primary:hover:not(:disabled) { background: var(--brand-primary-hover); color: #fff; box-shadow: 0 9px 20px rgba(23,107,104,.25); }
.ui-button.is-success { border-color: var(--success); background: var(--success); color: #fff; }.ui-button.is-warning { border-color: var(--warning); background: var(--warning); color: #fff; }.ui-button.is-danger { border-color: var(--danger); background: var(--danger); color: #fff; }.ui-button.is-info { background: var(--surface-subtle); color: var(--ink); }
.ui-button.is-plain { background: transparent; box-shadow: none; }.ui-button.is-text, .ui-button.is-link { min-height: 28px; padding: 0 6px; border-color: transparent; background: transparent; box-shadow: none; color: var(--brand-primary); }.ui-button.is-circle { width: 38px; padding: 0; border-radius: 50%; }.ui-button.is-round { border-radius: 999px; }
.ui-button__icon { width: 16px; height: 16px; }.ui-button__spinner { width: 14px; height: 14px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: ui-spin .7s linear infinite; } @keyframes ui-spin { to { transform: rotate(360deg); } }
</style>
