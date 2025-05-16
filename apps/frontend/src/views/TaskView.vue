<script setup lang="ts">
import StepEntries from '@/components/StepEntries.vue';
import TaskMessages from '@/components/TaskMessages.vue';
import { messageToStepEntries, type StepEntry } from '@/lib/messagesToStepEntries';
import { trpc } from '@/trpc';
import type { TaskMessages as TaskMessagesType } from 'backend';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const instanceId = route.params.id as string;

type Task = Awaited<ReturnType<typeof trpc.tasks.get.query>>;
const task = ref<Task | null>(null);
const stepEntries = ref<StepEntry[]>([]);

function refreshTask() {
  trpc.tasks.get.query({ id: instanceId }).then((data) => {
    task.value = data;
    stepEntries.value = messageToStepEntries(data.messages as TaskMessagesType);
  });
}
refreshTask();
</script>

<template>
  <div v-if="task" class="w-4xl mx-auto">
    <StepEntries :stepEntries="stepEntries" />
  </div>
</template>
