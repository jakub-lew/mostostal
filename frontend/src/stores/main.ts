import { ref, computed, type Ref } from 'vue'
import { defineStore } from 'pinia'

export type Vector3d = [number, number, number]
export type Line3d = [Vector3d, Vector3d]


export const useMainStore = defineStore('main', () => {
  const startPoint: Ref<Vector3d> = ref([0,0,0])
  const endPoint: Ref<Vector3d> = ref([1,2,3])
  const pipeRouting: Ref<Line3d[]> = ref([])


  function deconstruction( startPoint: Vector3d, endPoint: Vector3d ) {
    const x = endPoint[0] - startPoint[0]
    const y = endPoint[1] - startPoint[1]

    const point1: Vector3d = [startPoint[0], startPoint[1], startPoint[2]]
    const point2: Vector3d = [startPoint[0] + x, startPoint[1], startPoint[2]]
    const point3: Vector3d = [startPoint[0]+ x, startPoint[1] + y, startPoint[2]]
    const point4: Vector3d = [endPoint[0], endPoint[1], endPoint[2]]

    const line1: Line3d = [point1, point2]
    const line2: Line3d = [point2, point3]
    const line3: Line3d = [point3, point4]

    pipeRouting.value = [line1, line2, line3]
  }

  return { startPoint, endPoint, pipeRouting, deconstruction }
})
