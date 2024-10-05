<script setup lang="ts">
import { Viewer, XKTLoaderPlugin } from '@xeokit/xeokit-sdk';
import {buildLineGeometry, buildSphereGeometry, Mesh, ReadableGeometry, PhongMaterial} from '@xeokit/xeokit-sdk';

import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { allowedModels } from '@/utils/config';
import { storeToRefs } from 'pinia'
import { useMainStore, type Vector3d } from '@/stores/main';


const mainStore = useMainStore()
const {startPoint, endPoint, pipeRouting} = storeToRefs(mainStore)

const route = useRoute()
const router = useRouter()
const fileName = route.params['name'] as string
let viewer: Viewer | null

function drawLine(startPoint: Vector3d, endPoint: Vector3d) {
  if (!viewer) {
    console.warn("Viewer not initialized")
    return
  }
  new Mesh(viewer.scene, {
        geometry: new ReadableGeometry(viewer.scene, buildLineGeometry({
            startPoint: startPoint,
            endPoint: endPoint,
        })),
        material: new PhongMaterial(viewer.scene, {
            emissive: [0, 1,]
        })
    })
}



if (!allowedModels.includes(fileName)) {
  console.warn("File name not supported")
  router.push({ name: "home" })
}

onMounted(() => {
  viewer = new Viewer({
    canvasId: "xeokit_canvas",
    transparent: true,
    dtxEnabled: true
  });

  viewer.camera.eye = [-3.933, 2.855, 27.018];
  viewer.camera.look = [4.400, 3.724, 8.899];
  viewer.camera.up = [-0.018, 0.999, 0.039];

  const xktLoader = new XKTLoaderPlugin(viewer);

  const sceneModel = xktLoader.load({
    id: "myModel",
    src: `http://127.0.0.1:5200/${fileName}.xkt`,
    edges: true,
  });

});


</script>

<template>
  <button @click="drawLine(startPoint, endPoint)">
    Draw Line
  </button>
  <canvas id="xeokit_canvas"></canvas>
</template>

<style scoped>
#xeokit_canvas {
  height: 100%;
  width: 100%;
  background: lightblue;
  background-image: linear-gradient(lightblue, white);
}
</style>
