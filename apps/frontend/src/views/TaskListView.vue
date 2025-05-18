<script setup lang="ts">
import CreateButton from '@/components/buttons/CreateButton.vue';
import PageLayout from '@/components/layout/PageLayout.vue';
import { trpc } from '@/trpc';
import { PencilIcon, TrashIcon } from '@heroicons/vue/20/solid';
import { ref } from 'vue';

type TaskList = Awaited<ReturnType<typeof trpc.tasks.list.query>>;
const tasks = ref<null | TaskList>(null);

function refreshTasks() {
  trpc.tasks.list.query().then((data) => {
    tasks.value = data;
  });
}
refreshTasks();
</script>

<template>
  <PageLayout title="Tasks">
    <template #actions>
      <CreateButton to="/tasks/new" />
    </template>

    <table v-if="tasks" class="table-auto w-full">
      <tbody>
        <tr v-for="task in tasks" class="group">
          <td class="p-2 border-b border-gray-300 group-hover:bg-neutral-50">{{ task.name }}</td>
          <td class="p-2 border-b border-gray-300 group-hover:bg-neutral-50">
            {{ task.steps[0].instructions.slice(0, 150) }}
          </td>
          <td class="p-2 border-b border-gray-300 group-hover:bg-neutral-50">
            {{ task.createdAt }}
          </td>
          <td class="p-2 border-b border-gray-300 group-hover:bg-neutral-50 text-right pt-4">
            <RouterLink :to="{ name: 'taskEdit', params: { id: task.id } }" class="inline-block">
              <PencilIcon class="h-5 w-5 text-gray-500 hover:text-gray-700" />
            </RouterLink>
            <span class="inline-block">
              <TrashIcon
                class="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer ml-2"
                @click="trpc.tasks.delete.mutate({ id: task.id }).then(refreshTasks)"
              />
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </PageLayout>
</template>
