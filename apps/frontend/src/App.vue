<script setup lang="ts">
import { RouterView } from 'vue-router';
import MainNav from './components/layout/MainNav.vue';
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <MainNav />
    <RouterView />
  </div>
</template>
