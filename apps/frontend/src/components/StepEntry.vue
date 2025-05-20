<script setup lang="ts">
import type { StepEntry } from '@/lib/messagesToStepEntries';
import ReadOrWriteEntry from './stepEntries/ReadOrWriteEntry.vue';

defineProps({
  stepEntry: {
    type: Object as () => StepEntry,
    required: true,
  },
});

const emojiByStatus = {
  pending: '⏳',
  completed: '✅',
  in_progress: '🔄',
};
</script>

<template>
  <div
    v-if="stepEntry.type === 'text'"
    class="bg-sky-200 py-2 px-3 rounded-lg inline-block whitespace-pre-line"
  >
    {{ stepEntry.text }}
  </div>

  <div v-if="stepEntry.type === 'bash'" class="">
    <div class="text-sm">
      {{ stepEntry.description }}
    </div>
    <div class="bg-black text-white p-2 rounded-md">
      <div class="font-mono">
        <span class="text-blue-500">→&nbsp;</span>
        <span class="opacity-50 whitespace-pre-wrap">{{ stepEntry.command }}</span>
      </div>
      <div class="font-mono whitespace-pre-wrap" :class="{ 'text-red-500': stepEntry.isError }">
        {{ stepEntry.output }}
      </div>
    </div>
  </div>

  <ReadOrWriteEntry v-if="stepEntry.type === 'read'" :entry="stepEntry" type="read" />
  <ReadOrWriteEntry v-if="stepEntry.type === 'write'" :entry="stepEntry" type="write" />

  <div v-if="stepEntry.type === 'todoCreate'">
    <ul>
      <li v-for="item in stepEntry.todos" :key="item.id">
        {{ emojiByStatus[item.status] }} {{ item.content }}
      </li>
    </ul>
  </div>

  <div v-if="stepEntry.type === 'todoUpdate'">
    <ul>
      <li v-for="item in stepEntry.todoDiffs" :key="item.id">
        {{ emojiByStatus[item.to] }} {{ item.content }}
      </li>
    </ul>
  </div>
</template>
