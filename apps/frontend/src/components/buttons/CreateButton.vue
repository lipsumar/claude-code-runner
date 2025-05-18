<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { PlusCircleIcon } from '@heroicons/vue/20/solid';
defineProps<{
  to?: string;
}>();
defineEmits(['click']);
const btnClass =
  'bg-amber-50 hover:bg-amber-100 rounded-full text-sm text-amber-600 h-6 px-1 pr-[6px] flex items-center mt-1';
</script>
<template>
  <RouterLink v-if="to" :to="to" :class="btnClass">
    <PlusCircleIcon class="w-4 mr-1" /> Create
  </RouterLink>
  <button v-else @click="$emit('click')" :class="btnClass">
    <PlusCircleIcon class="w-4 mr-1" /> Create
  </button>
</template>
