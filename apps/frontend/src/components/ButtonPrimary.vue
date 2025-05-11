<script setup lang="ts">
import { RouterLink } from 'vue-router'

withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    tag?: 'button' | 'a'
    to?: string
  }>(),
  {
    type: 'button',
    tag: 'button',
  },
)
defineEmits(['click'])
</script>
<template>
  <button
    v-if="tag === 'button'"
    :type="type"
    class="bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 rounded-md px-4 py-2 text-white text-sm font-semibold"
    @click="$emit('click')"
  >
    <slot></slot>
  </button>
  <RouterLink
    v-if="tag === 'a' && to"
    :to="to"
    class="bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 rounded-md px-4 py-2 text-white text-sm font-semibold"
  >
    <slot></slot>
  </RouterLink>
</template>
