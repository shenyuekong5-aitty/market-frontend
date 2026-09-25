<template><select class="ui-select" :value="modelValue" v-bind="attrs" @change="onChange"><option v-if="placeholder" value="" disabled>{{ placeholder }}</option><slot /></select></template>
<script setup>
import { useAttrs } from 'vue'
defineOptions({ inheritAttrs: false })
const attrs = useAttrs(); const props = defineProps({ modelValue: [String, Number], placeholder: String }); const emit = defineEmits(['update:modelValue', 'change'])
const onChange = (event) => { emit('update:modelValue', event.target.value); emit('change', event) }
</script>
<style scoped>.ui-select { width: 100%; min-height: 40px; padding: 0 34px 0 13px; border: 1px solid var(--line); border-radius: var(--radius-sm); outline: 0; appearance: none; background: var(--surface-card) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='m1 1 5 5 5-5' fill='none' stroke='%2378909a' stroke-width='1.6'/%3E%3C/svg%3E") no-repeat right 13px center; color: var(--ink-strong); font: inherit; font-size: 14px; }.ui-select:focus { border-color: var(--brand-primary); box-shadow: 0 0 0 3px rgba(23,107,104,.12); }</style>
