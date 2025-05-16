<script setup lang="ts">
import type { StepEntry as StepEntryType } from '@/lib/messagesToStepEntries';
import StepEntry from './StepEntry.vue';

defineProps({
  stepEntries: {
    type: Object as () => StepEntryType[],
    required: true,
  },
});
</script>

<template>
  <div v-for="(stepEntry, i) in stepEntries" :key="i" class="mb-4">
    <StepEntry :stepEntry="stepEntry" />
  </div>
</template>
