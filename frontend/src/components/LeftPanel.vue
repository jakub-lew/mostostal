<template>
  <div class="flex flex-col space-y-2">
    <h1>{{ response }}</h1>
    <button class="p-2" @click="testServer">TestServer</button>
    <button class="p-2 bg-red-100" @click="sendPointsToBackend">TestBackend</button>

    <div> start point {{ startPoint }}</div>
    <div> end point {{ endPoint }}</div>
    <div> pipeRouting {{ pipeRouting }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ky from 'ky';
import { useCounterStore } from '@/stores/counter';
import { useMainStore} from '@/stores/main';
import { storeToRefs } from 'pinia';

const store = useCounterStore()
const { increment } = store
const response = ref({} as unknown)

const mainStore = useMainStore()
const { deconstruction } = mainStore
const { startPoint, endPoint, pipeRouting } = storeToRefs(mainStore)




async function sendPointsToBackend() {
  deconstruction(startPoint.value, endPoint.value)
}

async function testServer() {
  const json = await ky.get('http://localhost:5100/pipes').json();
  response.value = json
}






</script>
