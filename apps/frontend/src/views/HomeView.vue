<script setup lang="ts">
import { trpc } from '@/trpc'

trpc.foo.bar.query().then((data) => {
  console.log('data', data)
})
</script>

<template>
  <main>Home view</main>
</template>
