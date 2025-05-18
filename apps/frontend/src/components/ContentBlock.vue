<script setup lang="ts">
import type { ContentBlock } from 'backend';

defineProps({
  contentBlock: {
    type: Object as () => ContentBlock,
    required: true,
  },
});

type TodoWriteInput = {
  todos: {
    id: string;
    content: string;
    status: string;
    priority: string;
  }[];
};

type BashInput = {
  command: string;
  description: string;
};
</script>

<template>
  <div v-if="contentBlock.type === 'text'" class="bg-sky-100 p-2 rounded-lg">
    {{ contentBlock.text }}
  </div>
  <div v-if="contentBlock.type === 'tool_use'">
    <div v-if="contentBlock.name === 'TodoWrite'">
      TodoWrite
      <ul>
        <li v-for="item in (contentBlock.input as TodoWriteInput).todos" :key="item.id">
          [{{ item.status }}] {{ item.content }}
        </li>
      </ul>
    </div>
    <div v-else-if="contentBlock.name === 'Bash'">
      <div class="bg-black text-white p-2 rounded-md">
        <div class="text-sm pb-2">
          {{ (contentBlock.input as BashInput).description }}
        </div>
        <div class="font-mono">
          {{ (contentBlock.input as BashInput).command }}
        </div>
      </div>
    </div>
    <div v-else>Tool use: {{ contentBlock.name }} - not implemented</div>
  </div>
</template>
