<script setup lang="ts">
defineProps<{
  label: string;
  extraClass?: string;
}>();
</script>
<template>
  <div class="mb-4 flex-grow" :class="extraClass">
    <label class="font-bold text-sm">{{ label }}</label>
    <slot></slot>
  </div>
</template>
