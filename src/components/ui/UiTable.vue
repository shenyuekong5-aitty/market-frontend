<template>
  <div class="ui-table-shell" :class="$attrs.class">
    <el-table v-bind="$attrs" class="ui-table-core">
      <slot />
    </el-table>
  </div>
</template>
<script setup>
defineOptions({ inheritAttrs: false })
</script>
<style scoped>
.ui-table-shell { width: 100%; overflow-x: auto; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--surface-card); }.ui-table-core { min-width: 640px; border: 0 !important; border-radius: var(--radius-md); }.ui-table-shell :deep(.el-table__inner-wrapper::before) { display: none; }
</style>
