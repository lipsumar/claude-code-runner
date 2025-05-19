<script setup lang="ts">
import PageLayout from '@/components/layout/PageLayout.vue';
import StepEntries from '@/components/StepEntries.vue';
import { messageToStepEntries, type StepEntry } from '@/lib/messagesToStepEntries';
import { trpc } from '@/trpc';
import type { WrappedMessage } from 'backend';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const runId = route.params.id as string;

type TaskRun = Awaited<ReturnType<typeof trpc.runs.byId.query>>;
const taskRun = ref<TaskRun | null>(null);
const stepEntries = ref<StepEntry[]>([]);

function refreshTask() {
  trpc.runs.byId.query({ id: runId }).then((data) => {
    taskRun.value = data;
    stepEntries.value = messageToStepEntries(data.messages as WrappedMessage[]);
  });
}
refreshTask();
</script>

<template>
  <PageLayout title="Run">
    <div v-if="taskRun" class="w-4xl mx-auto">
      <StepEntries :stepEntries="stepEntries" />
    </div>
  </PageLayout>
</template>
