<script setup lang="ts">
import ButtonPrimary from '../buttons/ButtonPrimary.vue';
import FormField from '../form/FormField.vue';
import FormInput from '../form/FormInput.vue';
import StepForm from './StepForm.vue';

defineEmits(['submit', 'update']);
//defineProps<{ task: Task }>();
</script>

<template>
  <form @submit.prevent="$emit('submit')">
    <FormField label="Title">
      <FormInput />
    </FormField>
    <FormField label="Task steps">
      <StepForm :number="1" class="pt-1" />
    </FormField>
    <ButtonPrimary type="submit" class="mt-4">Save</ButtonPrimary>
  </form>
</template>
