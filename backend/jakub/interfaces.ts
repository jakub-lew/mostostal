export interface Edge { edgeNr: number, nodesPair: [number, number], distance: number }
export interface GraphNode { nr: number, edges: Edge[], pathLength: number, parentNd : number }
export interface Graph { nodes: GraphNode[], edges: Edge[], span: number, xNumber: number, yNumber: number, zNumber: number }
export interface BBox { x : number, y: number, z: number, xDist : number, yDist: number, zDist: number }