<template><img class="ui-image" :src="src" :alt="alt" :style="{ objectFit: fit }" v-bind="$attrs" /></template>
<script setup>defineProps({ src: String, alt: { type: String, default: '' }, fit: { type: String, default: 'cover' } })</script>
<style scoped>.ui-image { display: block; max-width: 100%; }</style>
