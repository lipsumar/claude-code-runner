<script setup lang="ts">
import CreateButton from '@/components/buttons/CreateButton.vue';
import PageLayout from '@/components/layout/PageLayout.vue';
import TaskForm from '@/components/TaskForm/TaskForm.vue';
</script>

<template>
  <PageLayout title="Tasks">
    <template #actions>
      <CreateButton to="/tasks/new" />
    </template>

    <TaskForm />
  </PageLayout>
</template>
