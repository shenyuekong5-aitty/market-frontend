<template>
  <label class="ui-radio" :class="{ 'is-checked': checked }">
    <input type="radio" :value="label" :checked="checked" @change="select" />
    <span class="ui-radio__dot" aria-hidden="true" />
    <span class="ui-radio__label"><slot /></span>
  </label>
</template>

<script setup>
import { computed, inject } from 'vue'

const props = defineProps({ label: { type: [String, Number, Boolean], default: '' } })
const group = inject('ui-radio-group', null)
const checked = computed(() => group ? group.value.value === props.label : false)
const select = () => group?.update(props.label)
</script>

<style scoped>
.ui-radio { display: inline-flex; align-items: center; gap: 7px; color: var(--ink); font-size: 14px; cursor: pointer; }
.ui-radio input { position: absolute; opacity: 0; pointer-events: none; }
.ui-radio__dot { width: 16px; height: 16px; border: 1px solid #b9cfd0; border-radius: 50%; background: var(--surface-card); box-shadow: inset 0 0 0 3px var(--surface-card); transition: .18s ease; }
.ui-radio:hover .ui-radio__dot { border-color: var(--brand-primary); }
.ui-radio.is-checked .ui-radio__dot { border-color: var(--brand-primary); background: var(--brand-primary); }
</style>
