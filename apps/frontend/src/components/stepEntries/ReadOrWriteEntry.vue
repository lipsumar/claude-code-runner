<script setup lang="ts">
import type { ReadStepEntry, WriteStepEntry } from '@/lib/messagesToStepEntries';
import { ArrowDownCircleIcon } from '@heroicons/vue/20/solid';
import { ref } from 'vue';

const props = defineProps<{
  entry: ReadStepEntry | WriteStepEntry;
  type: 'read' | 'write';
}>();

const isOpen = ref(false);
const needsCollapse = props.entry.content.split('\n').length > 19;
</script>
<template>
  <div>
    <span class="font-bold">{{ type === 'read' ? 'Read' : 'Write' }}:</span> 📄
    <span class="font-mono">{{ entry.filePath }}</span>
    <div
      class="bg-neutral-700 text-white text-sm font-mono py-2 shadow rounded-md whitespace-pre-wrap relative"
      :class="{
        'max-h-96 overflow-hidden': !isOpen,
        'overflow-auto': isOpen,
        'pl-3': type === 'write',
      }"
    >
      {{ entry.content }}
      <div
        v-if="needsCollapse && !isOpen"
        class="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-neutral-700 flex items-end justify-center cursor-pointer group"
        @click="isOpen = true"
      >
        <ArrowDownCircleIcon class="h-6 w-6 text-white mb-4 opacity-70 group-hover:opacity-100" />
      </div>
    </div>
  </div>
</template>
