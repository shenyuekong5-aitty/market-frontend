<template>
  <button
    class="ui-switch"
    :class="{ 'is-checked': checked, 'is-disabled': disabled }"
    type="button"
    role="switch"
    :aria-checked="checked"
    :disabled="disabled"
    @click="toggle"
  >
    <span class="ui-switch__thumb" />
    <span v-if="checked && activeText" class="ui-switch__text">{{ activeText }}</span>
    <span v-else-if="!checked && inactiveText" class="ui-switch__text">{{ inactiveText }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: false },
  activeValue: { type: [String, Number, Boolean], default: true },
  inactiveValue: { type: [String, Number, Boolean], default: false },
  activeText: String,
  inactiveText: String,
  disabled: Boolean
})
const emit = defineEmits(['update:modelValue', 'change'])
const checked = computed(() => props.modelValue === props.activeValue)
const toggle = () => {
  const value = checked.value ? props.inactiveValue : props.activeValue
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style scoped>
.ui-switch { position: relative; display: inline-flex; align-items: center; width: 42px; height: 24px; padding: 3px; border: 0; border-radius: 999px; background: #c4d4d5; cursor: pointer; transition: .2s ease; }
.ui-switch__thumb { width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 2px 5px rgba(24,49,59,.18); transition: transform .2s ease; }
.ui-switch.is-checked { background: var(--brand-primary); }
.ui-switch.is-checked .ui-switch__thumb { transform: translateX(18px); }
.ui-switch.is-disabled { opacity: .55; cursor: not-allowed; }
.ui-switch__text { position: absolute; font-size: 10px; color: #fff; }
</style>
