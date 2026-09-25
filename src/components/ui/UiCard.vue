<template>
  <section class="ui-card" v-bind="$attrs">
    <header v-if="$slots.header" class="ui-card__header"><slot name="header" /></header>
    <div class="ui-card__body"><slot /></div>
  </section>
</template>
<style scoped>
.ui-card { position: relative; overflow: hidden; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--surface-card); box-shadow: var(--shadow-sm); transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
.ui-card::before { content: ''; position: absolute; inset: 0 0 auto; z-index: 1; height: 3px; background: linear-gradient(90deg, var(--brand-primary), var(--brand-secondary)); }
.ui-card:hover { border-color: #c9dfe0; box-shadow: var(--shadow-md); transform: translateY(-2px); }
.ui-card__header { position: relative; z-index: 2; padding: 18px 22px; border-bottom: 1px solid var(--line); color: var(--ink-strong); font-weight: 700; }
.ui-card__body { padding: 22px; }
</style>
