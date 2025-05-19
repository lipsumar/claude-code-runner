<script setup lang="ts">
import ButtonPrimary from '@/components/buttons/ButtonPrimary.vue';
import FormField from '@/components/form/FormField.vue';
import FormInput from '@/components/form/FormInput.vue';
import PageLayout from '@/components/layout/PageLayout.vue';
import router from '@/router';
import { trpc } from '@/trpc';
import { useRoute } from 'vue-router';

const route = useRoute();
const taskId = route.params.id as string;

function runTask() {
  trpc.runs.create.mutate({ taskId }).then((data) => {
    console.log(data);
    router.push({
      name: 'runView',
      params: { id: data.id },
    });
  });
}
</script>
<template>
  <PageLayout title="Run task">
    <form @submit.prevent="runTask">
      <FormField label="Repository">
        <FormInput />
      </FormField>

      <ButtonPrimary type="submit" class="mt-4">Run</ButtonPrimary>
    </form>
  </PageLayout>
</template>
