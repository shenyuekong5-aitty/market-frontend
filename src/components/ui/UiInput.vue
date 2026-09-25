<template>
  <div class="ui-field" :class="{ 'is-disabled': disabled, 'is-textarea': type === 'textarea' }" v-bind="attrs">
    <textarea v-if="type === 'textarea'" :value="modelValue" :placeholder="placeholder" :disabled="disabled" :readonly="readonly" :maxlength="maxlength" :rows="rows" @input="update" @blur="emit('blur', $event)" />
    <input v-else :value="modelValue" :type="currentType" :placeholder="placeholder" :disabled="disabled" :readonly="readonly" :maxlength="maxlength" :autocomplete="autocomplete" @input="update" @change="emit('change', $event)" @blur="emit('blur', $event)" @focus="emit('focus', $event)" />
    <button v-if="showPassword && type !== 'textarea'" class="ui-field__action" type="button" @click="passwordVisible = !passwordVisible">{{ passwordVisible ? '隐藏' : '显示' }}</button>
    <button v-if="clearable && modelValue && !disabled" class="ui-field__clear" type="button" @click="clear">×</button>
  </div>
</template>

<script setup>
import { computed, ref, useAttrs } from 'vue'
defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const props = defineProps({ modelValue: { type: [String, Number], default: '' }, type: { type: String, default: 'text' }, placeholder: String, disabled: Boolean, readonly: Boolean, maxlength: [String, Number], rows: { type: [String, Number], default: 4 }, autocomplete: String, showPassword: Boolean, clearable: Boolean })
const emit = defineEmits(['update:modelValue', 'input', 'change', 'blur', 'focus', 'clear'])
const passwordVisible = ref(false)
const currentType = computed(() => props.type === 'password' && !passwordVisible.value ? 'password' : 'text')
const update = (event) => { const value = event.target.value; emit('update:modelValue', value); emit('input', value) }
const clear = () => { emit('update:modelValue', ''); emit('clear') }
</script>

<style scoped>
.ui-field { position: relative; display: flex; align-items: center; width: 100%; min-height: 40px; border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--surface-card); transition: border-color .2s ease, box-shadow .2s ease; }.ui-field:focus-within { border-color: var(--brand-primary); box-shadow: 0 0 0 3px rgba(23,107,104,.12); }.ui-field.is-disabled { opacity: .6; background: var(--surface-subtle); }.ui-field input,.ui-field textarea { width: 100%; min-width: 0; border: 0; outline: 0; resize: vertical; padding: 10px 13px; background: transparent; color: var(--ink-strong); font: inherit; font-size: 14px; }.ui-field textarea { min-height: 90px; line-height: 1.6; }.ui-field input::placeholder,.ui-field textarea::placeholder { color: var(--ink-muted); }.ui-field__action,.ui-field__clear { flex: 0 0 auto; margin-right: 9px; border: 0; background: transparent; color: var(--brand-primary); font-size: 12px; cursor: pointer; }.ui-field__clear { width: 22px; margin-right: 4px; color: var(--ink-muted); font-size: 18px; }
</style>
