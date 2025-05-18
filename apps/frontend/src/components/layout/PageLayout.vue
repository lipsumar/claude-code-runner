<script setup lang="ts">
const props = defineProps<{
  title?: string;
  titles?: { text: string; to?: string }[];
}>();
const titleClasses = 'text-3xl font-bold tracking-tight';
</script>
<template>
  <header class="bg-white shadow text-gray-900">
    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex items-center">
      <h1 v-if="title" :class="`${titleClasses} mr-6`">{{ props.title }}</h1>
      <div v-if="titles" class="flex items-center">
        <template v-for="(title, i) in titles" :key="title.text">
          <h1 :class="titleClasses" v-if="!title.to">{{ title.text }}</h1>
          <h1 :class="titleClasses" v-else>
            <RouterLink :to="title.to" class="hover:underline">{{ title.text }}</RouterLink>
          </h1>
          <div class="text-3xl text-amber-200 font-bold mx-4" v-if="i != titles.length - 1">/</div>
        </template>
      </div>
      <div class="relative">
        <slot name="actions"></slot>
      </div>
    </div>
  </header>
  <main class="flex-grow">
    <div class="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8 min-h-full">
      <slot></slot>
    </div>
  </main>
</template>
