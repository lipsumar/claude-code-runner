<script setup lang="ts">
import type { trpc } from '@/trpc';

import type { ContentBlock as ContentBlockType, Message } from 'backend';
import ContentBlock from './ContentBlock.vue';

type Task = Awaited<ReturnType<typeof trpc.tasks.get.query>>;

defineProps({
  task: {
    type: Object as () => Task,
    required: true,
  },
});

function isString(value: unknown): value is string {
  return typeof value === 'string';
}
</script>

<template>
  <div v-for="message in task.messages">
    <div v-if="message.role === 'system'">not implemented: system message</div>
    <div v-else-if="'type' in message && message.type === 'message'">
      <div v-for="(contentBlock, i) in (message as Message).content" class="mb-4">
        <ContentBlock :contentBlock="contentBlock" :key="i" />
      </div>
    </div>
    <div v-else>
      <div v-if="!isString(message.content)">
        <div v-for="(contentBlock, i) in message.content" class="mb-4">
          <ContentBlock :contentBlock="contentBlock as unknown as ContentBlockType" :key="i" />
        </div>
      </div>
    </div>
  </div>
</template>
