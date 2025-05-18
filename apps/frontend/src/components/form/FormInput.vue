<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: string;
    modelValue?: string;
    maxlength?: number;
  }>(),
  { type: 'text' },
);
defineEmits(['update:modelValue', 'paste']);
</script>
<template>
  <input
    :type="type"
    :value="modelValue"
    :maxlength="maxlength"
    @paste="$emit('paste', $event)"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    class="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-300 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
  />
</template>
