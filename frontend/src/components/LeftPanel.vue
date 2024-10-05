<template>
  <div class="flex flex-col space-y-2">
    <h1>{{ response }}</h1>
    <button class="p-2" @click="testServer">TestServer</button>
    <button class="p-2 bg-red-100" @click="sendPointsToBackend">TestBackend</button>

    <div> start point {{ startPoint }}</div>
    <div> end point {{ endPoint }}</div>
    <div> pipeRouting {{ pipeRouting }}</div>
    <div class="flex space-x-2">
      <div id="startPoint">
        <div class="max-w-sm mx-auto p-4 bg-white shadow-md rounded-lg">
          <h2 class="text-xl font-bold mb-4">Define a Starting Point</h2>
          <div class="mb-4">
            <label for="x" class="block text-gray-700">X:</label>
            <input type="number" id="x" v-model="startPoint[0]"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div class="mb-4">
            <label for="y" class="block text-gray-700">Y:</label>
            <input type="number" id="y" v-model="startPoint[1]"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div class="mb-4">
            <label for="z" class="block text-gray-700">Z:</label>
            <input type="number" id="z" v-model="startPoint[2]"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
        </div>
      </div>

      <div id="endPoint">
        <div class="max-w-sm mx-auto p-4 bg-white shadow-md rounded-lg">
          <h2 class="text-xl font-bold mb-4">Define a End Point</h2>
          <div class="mb-4">
            <label for="x" class="block text-gray-700">X:</label>
            <input type="number" id="x" v-model="endPoint[0]"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div class="mb-4">
            <label for="y" class="block text-gray-700">Y:</label>
            <input type="number" id="y" v-model="endPoint[1]"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div class="mb-4">
            <label for="z" class="block text-gray-700">Z:</label>
            <input type="number" id="z" v-model="endPoint[2]"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, unref } from 'vue'
import ky from 'ky';
import { useCounterStore } from '@/stores/counter';
import { useMainStore } from '@/stores/main';
import { storeToRefs } from 'pinia';

const store = useCounterStore()
const { increment } = store
const response = ref({} as unknown)

const mainStore = useMainStore()
const { deconstruction } = mainStore
const { startPoint, endPoint, pipeRouting } = storeToRefs(mainStore)




async function sendPointsToBackend() {
  deconstruction(unref(startPoint), unref(endPoint))
}

async function testServer() {
  const json = await ky.get('http://localhost:5100/pipes').json();
  response.value = json
}






</script>
