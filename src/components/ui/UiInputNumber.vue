<template><div class="ui-number"><button type="button" :disabled="disabled || atMin" @click="change(-1)">−</button><input :value="modelValue" type="number" :min="min" :max="max" :step="step" :disabled="disabled" @input="setValue($event.target.value)" /><button type="button" :disabled="disabled || atMax" @click="change(1)">＋</button></div></template>
<script setup>
import { computed } from 'vue'
const props = defineProps({ modelValue: { type: Number, default: 0 }, min: { type: Number, default: -Infinity }, max: { type: Number, default: Infinity }, step: { type: Number, default: 1 }, disabled: Boolean })
const emit = defineEmits(['update:modelValue', 'change'])
const atMin = computed(() => props.modelValue <= props.min); const atMax = computed(() => props.modelValue >= props.max)
const setValue = (raw) => { const value = Math.min(props.max, Math.max(props.min, Number(raw))); emit('update:modelValue', value); emit('change', value) }
const change = (direction) => setValue(Number(props.modelValue) + direction * props.step)
</script>
<style scoped>.ui-number { display: inline-flex; min-height: 40px; overflow: hidden; border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--surface-card); }.ui-number button { width: 34px; border: 0; background: var(--brand-primary-soft); color: var(--brand-primary); cursor: pointer; }.ui-number button:disabled { cursor: not-allowed; opacity: .45; }.ui-number input { width: 58px; border: 0; outline: 0; background: transparent; color: var(--ink-strong); text-align: center; font: inherit; }</style>
