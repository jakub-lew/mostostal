<script setup lang="ts">

const availableModels = [
  { name: "BUILDING" },
  { name: "Duplex" }
]
</script>

<template>
  <div class="flex flex-col justify-center h-screen">

    <div class="flex justify-center items-center">
      Choose your model
    </div>
    <div class="flex space-x-2 items-center justify-center">
      <div v-for="model, index in availableModels" :key="index" class="w-1/3">
        {{ model.name }}
        <router-link :to="{ name: 'model', params: { name: model.name } }">
          <img :src="`/${model.name}.png`">
        </router-link>
      </div>
    </div>
  </div>
</template>
