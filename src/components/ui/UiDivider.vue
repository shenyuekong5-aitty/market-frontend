<template><div class="ui-divider" role="separator"><span v-if="$slots.default"><slot /></span></div></template>
<style scoped>.ui-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; color: var(--ink-muted); font-size: 12px; }.ui-divider::before,.ui-divider::after { content: ''; height: 1px; flex: 1; background: var(--line); }</style>
