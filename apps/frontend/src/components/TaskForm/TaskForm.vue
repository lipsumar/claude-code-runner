<script setup lang="ts">
import type { Task } from 'backend';
import ButtonPrimary from '../buttons/ButtonPrimary.vue';
import FormField from '../form/FormField.vue';
import FormInput from '../form/FormInput.vue';
import StepForm from './StepForm.vue';

defineEmits(['submit']);
const taskModel = defineModel<Task>('task', { required: true });
</script>

<template>
  <form @submit.prevent="$emit('submit')">
    <FormField label="Title">
      <FormInput v-model="taskModel.name" />
    </FormField>
    <FormField label="Task steps">
      <StepForm v-for="(step, i) in taskModel.steps" :number="i + 1" :step="step" class="pt-1" />
    </FormField>
    <ButtonPrimary type="submit" class="mt-4">Save</ButtonPrimary>
  </form>
</template>
