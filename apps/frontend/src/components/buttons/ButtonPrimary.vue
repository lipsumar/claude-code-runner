<script setup lang="ts">
import { useAttrs } from 'vue';
import {
  RouterLink,
  type RouteLocationAsPathGeneric,
  type RouteLocationAsRelativeGeneric,
} from 'vue-router';

const props = withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset';
    tag?: 'button' | 'a';
    to?: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric;
    size?: 'small' | 'normal';
  }>(),
  {
    type: 'button',
    tag: 'button',
    size: 'normal',
  },
);
defineEmits(['click']);

const classes = {
  'text-xs': props.size === 'small',
  'px-4': props.size === 'normal',
  'px-2': props.size === 'small',
  'py-2': props.size === 'normal',
  'py-1': props.size === 'small',
};
</script>
<template>
  <button
    v-if="tag === 'button'"
    :type="type"
    class="bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 rounded-md text-white text-sm font-semibold cursor-pointer"
    :class="[$attrs.class, classes]"
    @click="$emit('click')"
  >
    <slot></slot>
  </button>
  <RouterLink
    v-if="tag === 'a' && to"
    :to="to"
    class="bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 rounded-md text-white text-sm font-semibold cursor-pointer"
    :class="[$attrs.class, classes]"
  >
    <slot></slot>
  </RouterLink>
</template>
