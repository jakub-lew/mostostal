<script setup lang="ts">
import { Viewer, XKTLoaderPlugin } from '@xeokit/xeokit-sdk';
import { onMounted } from 'vue';

onMounted(() => {
    const viewer = new Viewer({
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
        src: "https://xeokit.github.io/xeokit-bim-viewer/app/data/projects/HolterTower/models/ifcCXConverterPipeline1//model_1.xkt",
        edges: true,
    });
});


</script>

<template>
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
