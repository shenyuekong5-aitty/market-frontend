<template><div class="ui-date-input"><input type="datetime-local" :value="inputValue" :disabled="disabled" @input="update" /><button v-if="clearable && modelValue" type="button" @click="clear">×</button></div></template>
<script setup>
import { computed } from 'vue'
const props = defineProps({ modelValue: String, disabled: Boolean, clearable: Boolean })
const emit = defineEmits(['update:modelValue', 'change'])
const inputValue = computed(() => props.modelValue ? props.modelValue.replace(' ', 'T').slice(0, 16) : '')
const update = (event) => { const raw = event.target.value; const value = raw ? `${raw.replace('T', ' ')}:00` : ''; emit('update:modelValue', value); emit('change', value) }
const clear = () => { emit('update:modelValue', ''); emit('change', '') }
</script>
<style scoped>.ui-date-input { position: relative; display: flex; width: 100%; min-height: 40px; border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--surface-card); }.ui-date-input:focus-within { border-color: var(--brand-primary); box-shadow: 0 0 0 3px rgba(23,107,104,.12); }.ui-date-input input { width: 100%; padding: 0 12px; border: 0; outline: 0; background: transparent; color: var(--ink-strong); font: inherit; font-size: 13px; }.ui-date-input button { border: 0; background: transparent; color: var(--ink-muted); cursor: pointer; font-size: 18px; }</style>
