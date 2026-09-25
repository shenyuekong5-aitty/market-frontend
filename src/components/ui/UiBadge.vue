<template><span class="ui-badge"><slot /><b v-if="value !== undefined && value !== null">{{ displayValue }}</b></span></template>
<script setup>
import { computed } from 'vue'
const props = defineProps({ value: [String, Number], max: { type: Number, default: 99 } })
const displayValue = computed(() => Number(props.value) > props.max ? `${props.max}+` : props.value)
</script>
<style scoped>
.ui-badge { position: relative; display: inline-flex; align-items: center; }.ui-badge b { position: absolute; top: -9px; right: -11px; min-width: 18px; height: 18px; padding: 0 5px; border: 2px solid var(--surface-card); border-radius: 999px; background: var(--brand-secondary); color: #fff; font-size: 10px; line-height: 14px; text-align: center; }
</style>
