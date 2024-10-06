<script setup lang="ts">
import { XKTLoaderPlugin, WebIFCLoaderPlugin } from '@xeokit/xeokit-sdk';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {buildLineGeometry, buildSphereGeometry, Viewer, Mesh, ReadableGeometry, PhongMaterial} from '@xeokit/xeokit-sdk';
import { GridGen} from '../../../backend/jakub/gridGen';
import { aStarClass } from '../../../backend/jakub/aStar';
import * as data from '../../../backend/jakub/exampleForTomek.json';
//import * as obstacles from '../../../backend/dawid/bboxes-global-coordinates.json';
import * as obstacles from '../../../frontend/server/models/BUILDING_boxes.json';
// import * as obstacles from '../../../frontend/server/models/Duplex_boxes.json';
import { checkLine } from '@/utils/check-line';
import { Result } from 'postcss';
import ColorPicker from 'primevue/colorpicker';

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
//lines = GridGen.test();
// lines = [];
// const linesJson = data;
// linesJson.grid.edges.forEach((edge) => {
//   const coords1 = linesJson.grid.nodes[edge.node1];
//   const coords2 = linesJson.grid.nodes[edge.node2];
//    lines.push({
//        startPoint: [coords1.x, coords1.y, coords1.z],
//        endPoint: [coords2.x, coords2.y, coords2.z]
//    });
//   });
//lines = GridGen.graphEdgesToLines(GridGen.exampleGraphWithHoles());

    const room = obstacles.roomBBox;
    const span = 30;

     for(const obstacle of obstacles.obstacleBBoxes){
        const min = [obstacle.x, obstacle.y, obstacle.z];
        const max = [obstacle.x + obstacle.xDist, obstacle.y + obstacle.yDist, obstacle.z + obstacle.zDist];
        //startPoint and endPoints are diagonal of box. Create 6 lines to create box
        const bboxLines = GridGen.BBoxesToLines(min, max);
        for(const line of bboxLines){
            lines.push(line);
        }

     }
     lines = lines.map((line) => {
        return {
            startPoint: [line.startPoint[0], line.startPoint[2], -line.startPoint[1]],
            endPoint: [line.endPoint[0], line.endPoint[2], -line.endPoint[1]]
        }
     });

     let graphLines = GridGen.BuildingToLines();
     graphLines = graphLines.map((line) => {
        return {
            startPoint: [line.startPoint[0], line.startPoint[2], -line.startPoint[1]],
            endPoint: [line.endPoint[0], line.endPoint[2], -line.endPoint[1]]
        }
     });
     lines = lines.filter((line) => {
        return checkLine(line.startPoint as [number, number, number], line.endPoint as [number, number, number] , 0.03);
     });
     graphLines = graphLines.filter((line) => {
        return checkLine(line.startPoint as [number, number, number], line.endPoint as [number, number, number] , 0.03);
     });

    // const path = aStarClass.test();
    // let pathLines = [];
    // //ITERATE over idx
    // for (let i = 0; i < path.length - 2; i++) {
    //     const line = {
    //         startPoint: path[i],
    //         endPoint: path[i + 1]
    //     };
    //     pathLines.push(line);
    // }
    // pathLines = pathLines.map((line) => {
    //     return {
    //         startPoint: [line.startPoint[0], line.startPoint[2], -line.startPoint[1]],
    //         endPoint: [line.endPoint[0], line.endPoint[2], -line.endPoint[1]]
    //     }
    //  });
    //  console.log(pathLines);
    for (const line of [graphLines].flat()) {
    new Mesh(viewer.scene, {
        geometry: new ReadableGeometry(viewer.scene, buildLineGeometry({
            startPoint: line.startPoint,
            endPoint: line.endPoint,
        })),
        material: new PhongMaterial(viewer.scene, {
            emissive: [0, 1,],
            opacity: 1        })
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
        src: `http://127.0.0.1:5200/BUILDING.xkt`,
        edges: true,
    });
    sceneModel.xrayed = true;

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
