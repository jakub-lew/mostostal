<script setup lang="ts">
import {ContextMenu, Viewer, XKTLoaderPlugin, Mesh, buildCylinderGeometry, buildSphereGeometry, PhongMaterial, ReadableGeometry, math, transformToNode} from "@xeokit/xeokit-sdk";

import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { allowedModels } from '@/utils/config';
import { storeToRefs } from 'pinia'
import { useMainStore, type Vector3d } from '@/stores/main';


const mainStore = useMainStore()
const {startPoint, endPoint, pipeRouting} = storeToRefs(mainStore)
const {deconstruction} = mainStore

const route = useRoute()
const router = useRouter()
const fileName = route.params['name'] as string
let viewer: Viewer | null



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

  const scene = viewer.scene;
const canvas = scene.canvas.canvas;

const copyCanvasPos = (event, vec2) => {
    vec2[0] = event.clientX;
    vec2[1] = event.clientY;
    transformToNode(canvas.ownerDocument.documentElement, canvas, vec2);
    return vec2;
};

const mousePointSelector = function(viewer, ray2WorldPos) {
    return function(onCancel, onChange, onCommit) {
        const moveTolerance = 20;

        const pickWorldPos = canvasPos => {
            const origin = math.vec3();
            const direction = math.vec3();
            math.canvasPosToWorldRay(canvas, scene.camera.viewMatrix, scene.camera.projMatrix, scene.camera.projection, canvasPos, origin, direction);
            return ray2WorldPos(origin, direction);
        };

        let buttonDown = false;
        const resetAction = function() {
            buttonDown = false;
        };

        const cleanup = function() {
            resetAction();
            canvas.removeEventListener("mousedown", onMouseDown);
            canvas.removeEventListener("mousemove", onMouseMove);
            viewer.cameraControl.off(onCameraControlRayMove);
            canvas.removeEventListener("mouseup", onMouseUp);
        };

        const startCanvasPos = math.vec2();
        const onMouseDown = function(event) {
            if (event.which === 1)
            {
                copyCanvasPos(event, startCanvasPos);
                buttonDown = true;
            }
        };
        canvas.addEventListener("mousedown", onMouseDown);

        const onMouseMove = function(event) {
            const canvasPos = copyCanvasPos(event, math.vec2());
            if (buttonDown && math.distVec2(startCanvasPos, canvasPos) > moveTolerance)
            {
                resetAction();
                onCancel();
            }
        };
        canvas.addEventListener("mousemove", onMouseMove);

        const onCameraControlRayMove = viewer.cameraControl.on(
            "rayMove",
            event => {
                const canvasPos = event.canvasPos;
                onChange(canvasPos, pickWorldPos(canvasPos));
            });

        const onMouseUp = function(event) {
            if ((event.which === 1) && buttonDown)
            {
                cleanup();
                const canvasPos = copyCanvasPos(event, math.vec2());
                onCommit(canvasPos, pickWorldPos(canvasPos));
            }
        };
        canvas.addEventListener("mouseup", onMouseUp);

        return cleanup;
    };
};

const selectPoint = function(onMovePoint, onSelectPoint) {
    let currentSelectorCleanup = mousePointSelector(
        viewer,
        (origin, direction) => scene.pick({ origin: origin, direction: direction, pickSurface: true }))(
        (...args) => console.log("onCancel pos0", args),
        (canvasPos, pickResult) => onMovePoint(pickResult && pickResult.worldPos.slice(0), false),
        (canvasPos, pickResult) => {
            const P1 = pickResult && pickResult.worldPos.slice(0);
            if (P1) {

                const d1 = pickResult.worldNormal.slice(0);

                const closestPoint = ray => {
                    const P2 = ray.origin;
                    const d2 = ray.direction;

                    const w = math.subVec3(P1, P2, math.vec3());

                    const a = math.dotVec3(d1, d1);
                    const b = math.dotVec3(d1, d2);
                    const c = math.dotVec3(d2, d2);
                    const d = math.dotVec3(d1, w);
                    const e = math.dotVec3(d2, w);

                    const denom = c * a - b * b;
                    if (denom !== 0) { // denom === 0 will happen when the line and the ray are parallel (cos = 1)
                        const t0 = (b * e - c * d) / (c * a - b * b);

                        const s = (b * t0 + e) / c;
                        const t = (s < 0) ? (-math.dotVec3(w, d1) / math.dotVec3(d1, d1)) : t0;
                        const ret = math.vec3();
                        math.mulVec3Scalar(d1, t, ret);
                        math.addVec3(P1, ret, ret);
                        return ret;
                    }
                    return false;
                };

                currentSelectorCleanup = mousePointSelector(viewer, (origin, direction) => ({ origin, direction }))(
                    (...args) => console.log("onCancel pos1", args),
                    (canvasPos, ray) => onMovePoint(closestPoint(ray), true),
                    (canvasPos, ray) => onSelectPoint(closestPoint(ray)));
            } else {
                onSelectPoint(null);
            }
        });

    return { cancel: () => currentSelectorCleanup() };
};


const getPath = function(points, callWithSegments) {
    // mock

    const route = deconstruction(points[0], points[1])
    callWithSegments(route);
};

const buildPipe = function(segments) {
    // straight cylinders without elbows
    const elements = segments.map(
        function(segment) {
            const p0 = segment[0];
            const p1 = segment[1];
            const rad = 0.1;
            const pipe = new Mesh(
                scene,
                {
                    geometry: new ReadableGeometry(
                        scene,
                        buildCylinderGeometry({
                            center: [0,0,0],
                            radiusTop: rad,
                            radiusBottom: rad,
                            heightSegments: 60,
                            widthSegments: 60
                        })),
                    material: new PhongMaterial(scene, { diffuse: [0,0,1] }),
                    pickable: false
                });

            const mat = math.identityMat4();

            math.scaleMat4v([ 1, math.distVec3(p0, p1), 1], mat);

            const dir = math.vec3();
            math.subVec3(p0, p1, dir);
            math.normalizeVec3(dir);
            const r = math.vec4();
            math.vec3PairToQuaternion([ 0, 1, 0 ], dir, r);
            math.mulMat4(math.quaternionToRotationMat4(r, math.identityMat4()), mat, mat);

            const t = math.vec3();
            math.addVec3(p0, p1, t);
            math.mulVec3Scalar(t, 0.5, t);

            math.translateMat4v(t, mat);

            pipe.matrix = mat;

            return pipe;
        });
    return { destroy: () => elements.forEach(e => e.destroy()) };
};

const sphere = function(color) {
    return new Mesh(
        scene,
        {
            geometry: new ReadableGeometry(
                scene,
                buildSphereGeometry({
                    center: [0,0,0],
                    radius: .1,
                    heightSegments: 60,
                    widthSegments: 60
                })),
            material: new PhongMaterial(scene, { diffuse: color }),
            pickable: false
        });
};

const startPipeInteraction = function() {

    const greenSphere = sphere([0, 1, 0]);
    const redSphere   = sphere([1, 0, 0]);
    redSphere.visible = false;

    let currentInteraction = null;
    let segmentMeshes = [ ];
    let currentPipeSegment = null;

(function startPipe() {
    currentInteraction = selectPoint(
        p0 => {
            greenSphere.visible = !!p0;
            if (p0) {
                greenSphere.position = p0;
            }
        },
        p0 => {
            if (! p0) {
                startPipe();
            } else {
                (function startSegment(p0) {
                    greenSphere.visible = true;
                    greenSphere.position = p0;

                    currentInteraction = selectPoint(
                        (p1, isExtruded) => {
                            redSphere.visible = !!p1;
                            if (p1) {
                                redSphere.position = p1;

                                if (isExtruded) {
                                    getPath(
                                        [ p0, p1 ],
                                        function(segments) {
                                            if (currentPipeSegment)
                                                currentPipeSegment.destroy();
                                            currentPipeSegment = buildPipe(segments);
                                        });
                                }
                            }
                        },
                        p1 => {
                            // here is fixed point
                            if (p1) {
                                getPath(
                                    [ p0, p1 ],
                                    function(segments) {
                                        if (currentPipeSegment)
                                            currentPipeSegment.destroy();
                                        segmentMeshes.push(buildPipe(segments));
                                        startSegment(p1);
                                    });
                            } else {
                                startSegment(p0);
                            }
                        });
                })(p0);
            }
        });
})();
    return {
        finish: () => {
            currentInteraction.cancel();
            greenSphere.destroy();
            redSphere.destroy();
        },
        cancel: () => {
            currentInteraction.cancel();
            greenSphere.destroy();
            redSphere.destroy();
            segmentMeshes.forEach(m => m.destroy());
            if (currentPipeSegment)
                currentPipeSegment.destroy();
        }
    };
};


let pipeInteraction = null;

window.document.addEventListener("keyup", e => {
    if (e.key === "Enter") {
        if (pipeInteraction) {
            pipeInteraction.finish();
            pipeInteraction = null;
        } else {
            pipeInteraction = startPipeInteraction();
        }
    }
});

window.document.addEventListener("keyup", e => {
    if ((e.key === "Escape") && pipeInteraction) {
        pipeInteraction.cancel();
        pipeInteraction = null;
    }
});


window.viewer = viewer;

window.sceneModel = sceneModel;

const ctxMenu = new ContextMenu({
    enabled: true,
    items: [
        [
            {
                title: "X-Ray",
                doAction: () => { sceneModel.xrayed = !sceneModel.xrayed; }
            }
        ]
    ]
});

viewer.scene.canvas.canvas.addEventListener('contextmenu', (event) => {
    const canvasPos = copyCanvasPos(event, math.vec2());
    ctxMenu.context = { };
    ctxMenu.show(event.pageX, event.pageY);
    event.preventDefault();
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
