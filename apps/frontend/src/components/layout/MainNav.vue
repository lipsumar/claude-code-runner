<script setup lang="ts">
import { RouterLink } from 'vue-router';
import BrandLogo from './BrandLogo.vue';

const navigation = [
  { to: '/', name: 'Home' },
  { to: '/tasks', name: 'Tasks' },
];
</script>
<template>
  <nav class="bg-gray-800">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <BrandLogo class="h-8 w-8 -mt-2" />
          </div>
          <div class="md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <RouterLink
                v-for="item in navigation"
                :to="item.to"
                :key="item.name"
                class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                active-class="bg-gray-900 text-white hover:bg-gray-900"
                >{{ item.name }}</RouterLink
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
