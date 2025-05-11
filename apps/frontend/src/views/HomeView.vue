<script setup lang="ts">
import { trpc } from '@/trpc';
import { ref } from 'vue';
import ButtonPrimary from '@/components/ButtonPrimary.vue';

type Instances = Awaited<ReturnType<typeof trpc.instances.list.query>>;
const instances = ref<Instances>([]);

function refreshInstances() {
  trpc.instances.list.query().then((data) => {
    instances.value = data;
  });
}
refreshInstances();

function createInstance() {
  trpc.instances.create.mutate().then(() => {
    refreshInstances();
  });
}

function removeInstance(id: string) {
  trpc.instances.remove.mutate({ id }).then(() => {
    refreshInstances();
  });
}
</script>

<template>
  <h1>Instances</h1>
  <ul>
    <li v-for="instance in instances" :key="instance.id">
      <router-link :to="{ name: 'instance', params: { id: instance.id } }">
        {{ instance.id }}
      </router-link>
      - {{ instance.status }}
      <button @click="() => removeInstance(instance.id)">Remove</button>
    </li>
  </ul>
  <ButtonPrimary @click="() => createInstance()">Create Instance</ButtonPrimary>
</template>
