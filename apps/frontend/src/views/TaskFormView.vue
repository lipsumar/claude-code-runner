<script setup lang="ts">
import PageLayout from '@/components/layout/PageLayout.vue';
import TaskForm from '@/components/TaskForm/TaskForm.vue';
import router from '@/router';
import { trpc } from '@/trpc';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const taskId = route.params.id as string;
const task = ref({
  name: '',
  steps: [
    {
      instructions: '',
      checks: '',
    },
  ],
});

if (taskId) {
  trpc.tasks.byId.query({ id: taskId }).then((taskData) => {
    if (!taskData) {
      router.push({ name: 'taskList' });
    } else {
      task.value.name = taskData.name;
      task.value.steps = taskData.steps;
    }
  });
}

async function saveTask() {
  if (taskId) {
    await trpc.tasks.update.mutate({
      id: taskId,
      ...task.value,
    });
  } else {
    await trpc.tasks.create.mutate(task.value);
  }

  router.push({ name: 'taskList' });
}
</script>

<template>
  <PageLayout
    :titles="[{ text: 'Tasks', to: '/tasks' }, { text: taskId ? task.name : 'New task' }]"
  >
    <TaskForm :task="task" @submit="saveTask" />
  </PageLayout>
</template>
