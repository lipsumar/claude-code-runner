<script setup lang="ts">
import ButtonPrimary from '../buttons/ButtonPrimary.vue';

defineProps<{
  title: string;
  description: string;
  action?: string;
}>();
</script>
<template>
  <div class="flex items-center justify-center mt-12">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ title }}</h1>
      <p class="text-gray-600 mb-4">{{ description }}</p>
      <ButtonPrimary v-if="action" @click="() => $emit('action')" class="mt-6">{{
        action
      }}</ButtonPrimary>
    </div>
  </div>
</template>
