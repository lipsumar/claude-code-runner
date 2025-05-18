<script setup lang="ts">
import CreateButton from '@/components/buttons/CreateButton.vue';
import PageLayout from '@/components/layout/PageLayout.vue';
</script>

<template>
  <PageLayout title="Tasks">
    <template #actions>
      <CreateButton to="/tasks/new" />
    </template>
  </PageLayout>
</template>
