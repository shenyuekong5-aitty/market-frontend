<template>
  <div class="ui-radio-group" role="radiogroup">
    <slot />
  </div>
</template>

<script setup>
import { computed, provide } from 'vue'

const props = defineProps({ modelValue: { type: [String, Number, Boolean], default: '' } })
const emit = defineEmits(['update:modelValue', 'change'])
const group = {
  value: computed(() => props.modelValue),
  update(value) {
    emit('update:modelValue', value)
    emit('change', value)
  }
}
provide('ui-radio-group', group)
</script>

<style scoped>
.ui-radio-group { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 18px; }
</style>
