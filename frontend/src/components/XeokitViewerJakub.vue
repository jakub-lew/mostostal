<script setup lang="ts">
import { XKTLoaderPlugin, WebIFCLoaderPlugin } from '@xeokit/xeokit-sdk';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {buildLineGeometry, buildSphereGeometry, Viewer, Mesh, ReadableGeometry, PhongMaterial} from '@xeokit/xeokit-sdk';
import { GridGen} from '../../../backend/jakub/gridGen';


const route = useRoute()
const fileName = route.params['name']

onMounted(() => {
    const viewer = new Viewer({
        canvasId: "xeokit_canvas",
        transparent: true,
        dtxEnabled: true
    });




    viewer.camera.eye = [0, 0, 8];
    viewer.camera.look = [0, 0, 0];
    viewer.camera.up = [0, 1, 0];

    //------------------------------------------------------------------------------------------------------------------
    // Create a mesh with simple 2d line shape
    //------------------------------------------------------------------------------------------------------------------
let lines = [
    {
        startPoint: [-5,-2,0],
        endPoint: [-5,2,0],
    },
    {
        startPoint: [-5,2,0],
        endPoint: [5,2,0],
    },
    {
        startPoint: [5,2,0],
        endPoint: [5,-2,0],
    }
];
lines = GridGen.test();
 for (const line of lines) {
    new Mesh(viewer.scene, {
        geometry: new ReadableGeometry(viewer.scene, buildLineGeometry({
            startPoint: line.startPoint,
            endPoint: line.endPoint,
        })),
        material: new PhongMaterial(viewer.scene, {
            emissive: [0, 1,]
        })
    });}
    new Mesh(viewer.scene, {
        geometry: new ReadableGeometry(viewer.scene, buildSphereGeometry({
            radius: 0.5,
            heightSegments: 60,
            widthSegments: 60
        })),
        material: new PhongMaterial(viewer.scene, {
            ambient: [0.9, 0.3, 0.9],
            shininess: 30,

        })
    });

    const xktLoader = new XKTLoaderPlugin(viewer);

    const sceneModel = xktLoader.load({
        id: "myModel",
        src: `http://127.0.0.1:5200/${fileName}.xkt`,
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
