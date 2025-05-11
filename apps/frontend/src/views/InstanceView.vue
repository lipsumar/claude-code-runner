<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const instanceId = route.params.id as string

type Instance = Awaited<ReturnType<typeof trpc.instances.get.query>>
const instance = ref<Instance | null>(null)

function refreshInstance() {
  trpc.instances.get.query({ id: instanceId }).then((data) => {
    instance.value = data
  })
}
refreshInstance()
</script>

<template>
  <div v-if="instance">
    <h1>Instance {{ instance.id }}</h1>
    <p>Status: {{ instance.status }}</p>
  </div>
</template>
