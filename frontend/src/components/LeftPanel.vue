<template>
  <div>
    <h1>{{ response }}</h1>
    <button @click="testServer">TestServer</button>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import ky from 'ky';

const response = ref({} as unknown)

async function testServer() {
  const json = await ky.get('http://localhost:5100/pipes').json();
  response.value = json
}

</script>
