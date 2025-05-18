<script setup lang="ts">
import { ref } from 'vue';

import ChevronRightMicro from '../icons/ChevronRightMicro.vue';
import ChevronDownMicro from '../icons/ChevronDownMicro.vue';
import type { Task } from 'backend';

defineProps({
  number: {
    type: Number,
    required: true,
  },
});
const stepModel = defineModel<Task['steps'][0]>('step', { required: true });
const instructionsOpen = ref(true);
const checksOpen = ref(true);
</script>
<template>
  <div class="flex">
    <div class="flex-none pr-3 pt-2">
      <div
        class="w-6 h-6 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center"
      >
        {{ number }}
      </div>
    </div>
    <div class="flex-1">
      <div class="border border-gray-300 rounded-lg shadow bg-white">
        <div class="p-2 pb-0">
          <div class="text-sm text-gray-500 pb-2 flex items-center">
            <ChevronRightMicro v-if="instructionsOpen" />
            <ChevronDownMicro v-else />
            Instructions
          </div>
          <textarea
            v-show="instructionsOpen"
            class="w-full h-32 pl-1 outline-none resize-y"
            placeholder="What should be done?"
            v-model="stepModel.instructions"
          ></textarea>
        </div>
        <div class="border-t border-gray-300"></div>
        <div class="p-2 pb-0">
          <div class="text-sm text-gray-500 pb-2 flex items-center">
            <ChevronRightMicro v-if="checksOpen" />
            <ChevronDownMicro v-else />
            Checks
          </div>
          <textarea
            v-show="checksOpen"
            class="w-full h-32 pl-1 outline-none resize-y"
            placeholder="What should be checked?"
            v-model="stepModel.checks"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>
