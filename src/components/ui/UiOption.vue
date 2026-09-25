<template><option :value="value"><slot>{{ label }}</slot></option></template>
<script setup>defineProps({ value: [String, Number], label: String })</script>
