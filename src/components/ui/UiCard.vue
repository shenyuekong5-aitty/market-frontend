<template>
  <section class="ui-card" v-bind="$attrs">
    <header v-if="$slots.header" class="ui-card__header"><slot name="header" /></header>
    <div class="ui-card__body"><slot /></div>
  </section>
</template>
<style scoped>
.ui-card { position: relative; overflow: hidden; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--surface-card); box-shadow: var(--shadow-sm); transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }


.ui-card__header { position: relative; z-index: 2; padding: 22px 24px; border-bottom: 1px solid var(--line); color: var(--ink-strong); font-weight: 600; }
.ui-card__body { padding: 24px; }
@media(max-width:767px) { .ui-card__header, .ui-card__body { padding: 20px 18px; } }
</style>
