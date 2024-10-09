// import obstacles from './../../frontend/server/models/Duplex_boxes.json' assert { type: "json" };
import obstacles from './../../frontend/server/models/Building_boxes.json' assert { type: "json" };
export class GridGen {
    static test() {
        // create neighbors
        const xNumber = 5;
        const yNumber = 5;
        const zNumber = 5;
        const span = 10;
        const coordsToIdx = (x, y, z) => x + y * xNumber + z * xNumber * yNumber;
        const IdxToCoords = (idx) => {
            const x = idx % xNumber;
            const y = Math.floor(idx / xNumber) % yNumber;
            const z = Math.floor(idx / (xNumber * yNumber));
            return [x, y, z];
        };
        const graph = this.generateGrid([5, 5, 5], span, xNumber, yNumber, zNumber, 5, 5, 5);
        const lines = [];
        for (const edge of graph.edges) {
            const start = IdxToCoords(edge.nodesPair[0]);
            const end = IdxToCoords(edge.nodesPair[1]);
            lines.push({
                startPoint: start,
                endPoint: end,
            });
        }
        ;
        return lines;
    }
    static exportToJSON(graph) {
        const nodes = graph.nodes.map((node) => {
            return {
                nr: node.nr,
                pathLength: node.pathLength,
                edges: node.edges.map((edge) => {
                    return {
                        edgeNr: edge.edgeNr,
                        nodesPair: edge.nodesPair,
                        distance: edge.distance,
                    };
                })
            };
        });
        const edges = graph.edges.map((edge) => {
            return {
                edgeNr: edge.edgeNr,
                nodesPair: edge.nodesPair,
                distance: edge.distance,
            };
        });
        const nodesExport = graph.nodes.map((node) => {
            const coords = this.idxToCoords(graph.xNumber, graph.yNumber, node.nr);
            return {
                nodeNr: node.nr,
                x: node.x,
                y: node.y,
                z: node.z,
            };
        });
        const edgesExport = graph.edges.map((edge) => {
            return {
                edgeNr: edge.edgeNr,
                node1: edge.nodesPair[0],
                node2: edge.nodesPair[1],
            };
        });
        const graphToExport = {
            span: graph.span,
            grid: { nodes: nodesExport, edges: edgesExport },
        };
        return JSON.stringify(graphToExport);
    }
    static ifLineIntersectsBBox(start, end, bbox) {
        const [minX, minY, minZ] = [bbox.x, bbox.y, bbox.z];
        const [maxX, maxY, maxZ] = [bbox.x + bbox.xDist, bbox.y + bbox.yDist, bbox.z + bbox.zDist];
        const [startX, startY, startZ] = start;
        const [endX, endY, endZ] = end;
        const t1 = (minX - startX) / (endX - startX);
        const t2 = (maxX - startX) / (endX - startX);
        const t3 = (minY - startY) / (endY - startY);
        const t4 = (maxY - startY) / (endY - startY);
        const t5 = (minZ - startZ) / (endZ - startZ);
        const t6 = (maxZ - startZ) / (endZ - startZ);
        const tMin = Math.max(Math.min(t1, t2), Math.min(t3, t4), Math.min(t5, t6));
        const tMax = Math.min(Math.max(t1, t2), Math.max(t3, t4), Math.max(t5, t6));
        if (tMax < 0 || tMin > tMax) {
            return false;
        }
        return true;
    }
    static createGrid(room, obstacles, span) {
        const xNumber = Math.floor(room.xDist / span);
        const yNumber = Math.floor(room.yDist / span);
        const zNumber = Math.floor(room.zDist / span);
        const graph = this.generateGrid([room.x, room.y, room.z], span, xNumber, yNumber, zNumber, room.xDist, room.yDist, room.zDist);
        const edgesToDel = [];
        console.log(`Checking for edges that intersect obstacles`);
        for (const edge of graph.edges) {
            const start = [graph.nodes[edge.nodesPair[0]].x, graph.nodes[edge.nodesPair[0]].y, graph.nodes[edge.nodesPair[0]].z];
            const end = [graph.nodes[edge.nodesPair[1]].x, graph.nodes[edge.nodesPair[1]].y, graph.nodes[edge.nodesPair[1]].z];
            for (const obstacle of obstacles) {
                if (this.ifLineIntersectsBBox(start, end, obstacle)) {
                    edgesToDel.push(edge);
                }
                // if (start[0] >= obstacle.x && start[0] <= obstacle.x + obstacle.xDist &&
                //     start[1] >= obstacle.y && start[1] <= obstacle.y + obstacle.yDist &&
                //     start[2] >= obstacle.z && start[2] <= obstacle.z + obstacle.zDist) {
                //     edgesToDel.push(edge);
                // }
                // else if (end[0] >= obstacle.x && end[0] <= obstacle.x + obstacle.xDist &&
                //     end[1] >= obstacle.y && end[1] <= obstacle.y + obstacle.yDist &&
                //     end[2] >= obstacle.z && end[2] <= obstacle.z + obstacle.zDist) {
                //     edgesToDel.push(edge);
                // }
            }
        }
        console.log(`Affected edges found. Removing  ${edgesToDel.length} edges from the grid`);
        while (edgesToDel.length > 0) {
            const edge = edgesToDel.pop();
            edge === null || edge === void 0 ? void 0 : edge.nodesPair.forEach((nodeNr) => {
                const node = graph.nodes[nodeNr];
                node.edges = node.edges.filter((e) => e != edge);
            });
            graph.edges = graph.edges.filter((e) => e != edge);
        }
        console.log(`removed edges`);
        return graph;
    }
    static exampleGraphWithHoles() {
        return GridGen.createGrid({ x: 0, y: 0, z: 0, xDist: 5, yDist: 4, zDist: 3 }, [{ x: 1, y: 1, z: 1, xDist: 1, yDist: 1, zDist: 1 }], 1);
    }
    static graphEdgesToLines(graph) {
        const xNumber = graph.xNumber;
        const yNumber = graph.yNumber;
        const zNumber = graph.zNumber;
        const IdxToCoords = (idx) => {
            return [graph.nodes[idx].x, graph.nodes[idx].y, graph.nodes[idx].z];
        };
        const lines = [];
        for (const edge of graph.edges) {
            const start = IdxToCoords(edge.nodesPair[0]);
            const end = IdxToCoords(edge.nodesPair[1]);
            lines.push({
                startPoint: start,
                endPoint: end,
            });
        }
        ;
        return lines;
    }
    static BBoxesToLines(min, max) {
        const squares = [
            [
                [min[0], min[1], min[2]],
                [min[0], max[1], min[2]],
                [max[0], max[1], min[2]],
                [max[0], min[1], min[2]],
            ],
            [
                [min[0], min[1], max[2]],
                [min[0], max[1], max[2]],
                [max[0], max[1], max[2]],
                [max[0], min[1], max[2]],
            ],
        ];
        return [
            { startPoint: squares[0][0], endPoint: squares[0][1] },
            { startPoint: squares[0][1], endPoint: squares[0][2] },
            { startPoint: squares[0][2], endPoint: squares[0][3] },
            { startPoint: squares[0][3], endPoint: squares[0][0] },
            { startPoint: squares[1][0], endPoint: squares[1][1] },
            { startPoint: squares[1][1], endPoint: squares[1][2] },
            { startPoint: squares[1][2], endPoint: squares[1][3] },
            { startPoint: squares[1][3], endPoint: squares[1][0] },
            { startPoint: squares[0][0], endPoint: squares[1][0] },
            { startPoint: squares[0][1], endPoint: squares[1][1] },
            { startPoint: squares[0][2], endPoint: squares[1][2] },
            { startPoint: squares[0][3], endPoint: squares[1][3] },
        ];
    }
    static DuplexToGraph() {
        return GridGen.createGrid(obstacles.roomBBox, obstacles.obstacleBBoxes, 1);
    }
    static DuplexToLines() {
        const graph = this.DuplexToGraph();
        const lines = GridGen.graphEdgesToLines(graph);
        return lines;
    }
    static DuplexToNodes() {
        const graph = this.DuplexToGraph();
        const nodes = graph.nodes.map((node) => {
            return {
                nr: node.nr,
                x: node.x,
                y: node.y,
                z: node.z,
            };
        });
        return nodes;
    }
    static BuildingToGraph() {
        return GridGen.createGrid(obstacles.roomBBox, obstacles.obstacleBBoxes, 1.7);
    }
    static BuildingToLines() {
        const graph = this.BuildingToGraph();
        const lines = GridGen.graphEdgesToLines(graph);
        return lines;
    }
}
GridGen.coordsToIdx = (x, y, z, xNumber, yNumber) => (x, y, z) => x + y * xNumber + z * xNumber * yNumber;
//following works only before scaling and translating:
GridGen.idxToCoords = (xNumber, yNumber, idx) => {
    const x = idx % xNumber;
    const y = Math.floor(idx / xNumber) % yNumber;
    const z = Math.floor(idx / (xNumber * yNumber));
    return [x, y, z];
};
GridGen.nodeClosestToCoords = (graph, coords) => {
    let closestNode = graph.nodes[0];
    let minDist = Number.MAX_SAFE_INTEGER;
    for (const node of graph.nodes) {
        const dist = Math.sqrt(Math.pow(node.x - coords[0], 2) +
            Math.pow(node.y - coords[1], 2) +
            Math.pow(node.z - coords[2], 2));
        if (dist < minDist) {
            minDist = dist;
            closestNode = node;
        }
    }
    return closestNode;
};
GridGen.generateGrid = (origin, span, xNumber, yNumber, zNumber, realX, realY, realZ) => {
    const INF = Number.MAX_SAFE_INTEGER;
    console.log(`Generating grid with origin ${origin}, span ${span}, xNumber ${xNumber}, yNumber ${yNumber}, zNumber ${zNumber}, realX ${realX}, realY ${realY}, realZ ${realZ}`);
    const graph = { nodes: [], edges: [], span: span, xNumber: xNumber, yNumber: yNumber, zNumber: zNumber };
    // create neighbors
    const coordsToIdx = (x, y, z) => x + y * xNumber + z * xNumber * yNumber;
    const IdxToCoords = (idx) => {
        const x = idx % xNumber;
        const y = Math.floor(idx / xNumber) % yNumber;
        const z = Math.floor(idx / (xNumber * yNumber));
        return [x, y, z];
    };
    for (let z = 0; z < zNumber; z++) {
        for (let y = 0; y < yNumber; y++) {
            for (let x = 0; x < xNumber; x++) {
                const ndNr = coordsToIdx(x, y, z);
                const node = { nr: ndNr, edges: [], pathLength: INF, parentNd: -1, x: x, y: y, z: z };
                graph.nodes.push(node);
                if (x > 0) {
                    {
                        const neighborNd = graph.nodes[coordsToIdx(x - 1, y, z)];
                        const edge = { edgeNr: graph.edges.length, nodesPair: [ndNr, neighborNd.nr], distance: span };
                        graph.edges.push(edge);
                        node.edges.push(edge);
                        neighborNd.edges.push(edge);
                    }
                }
                if (y > 0) {
                    {
                        const neighborNd = graph.nodes[coordsToIdx(x, y - 1, z)];
                        const edge = { edgeNr: graph.edges.length, nodesPair: [ndNr, neighborNd.nr], distance: span };
                        graph.edges.push(edge);
                        node.edges.push(edge);
                        neighborNd.edges.push(edge);
                    }
                    if (x < xNumber - 1) {
                        const neighborNd = graph.nodes[coordsToIdx(x + 1, y - 1, z)];
                        const edge = { edgeNr: graph.edges.length, nodesPair: [ndNr, neighborNd.nr], distance: span * Math.sqrt(2) };
                        graph.edges.push(edge);
                        node.edges.push(edge);
                        neighborNd.edges.push(edge);
                    }
                }
                if (z > 0) {
                    {
                        const neighborNd = graph.nodes[coordsToIdx(x, y, z - 1)];
                        const edge = { edgeNr: graph.edges.length, nodesPair: [ndNr, neighborNd.nr], distance: span };
                        graph.edges.push(edge);
                        node.edges.push(edge);
                        neighborNd.edges.push(edge);
                    }
                    if (x < xNumber - 1) {
                        const neighborNd = graph.nodes[coordsToIdx(x + 1, y, z - 1)];
                        const edge = { edgeNr: graph.edges.length, nodesPair: [ndNr, neighborNd.nr], distance: span * Math.sqrt(2) };
                        graph.edges.push(edge);
                        node.edges.push(edge);
                        neighborNd.edges.push(edge);
                    }
                    if (y < yNumber - 1) {
                        const neighborNd = graph.nodes[coordsToIdx(x, y + 1, z - 1)];
                        const edge = { edgeNr: graph.edges.length, nodesPair: [ndNr, neighborNd.nr], distance: span * Math.sqrt(2) };
                        graph.edges.push(edge);
                        node.edges.push(edge);
                        neighborNd.edges.push(edge);
                    }
                }
                if (x > 0 && y > 0) {
                    {
                        const neighborNd = graph.nodes[coordsToIdx(x - 1, y - 1, z)];
                        const edge = { edgeNr: graph.edges.length, nodesPair: [ndNr, neighborNd.nr], distance: span * Math.sqrt(2) };
                        graph.edges.push(edge);
                        node.edges.push(edge);
                        neighborNd.edges.push(edge);
                    }
                }
                if (x > 0 && z > 0) {
                    {
                        const neighborNd = graph.nodes[coordsToIdx(x - 1, y, z - 1)];
                        const edge = { edgeNr: graph.edges.length, nodesPair: [ndNr, neighborNd.nr], distance: span * Math.sqrt(2) };
                        graph.edges.push(edge);
                        node.edges.push(edge);
                        neighborNd.edges.push(edge);
                    }
                }
                if (y > 0 && z > 0) {
                    {
                        const neighborNd = graph.nodes[coordsToIdx(x, y - 1, z - 1)];
                        const edge = { edgeNr: graph.edges.length, nodesPair: [ndNr, neighborNd.nr], distance: span * Math.sqrt(2) };
                        graph.edges.push(edge);
                        node.edges.push(edge);
                        neighborNd.edges.push(edge);
                    }
                }
            }
        }
    }
    for (const node of graph.nodes) {
        node.x = node.x * span;
        node.y = node.y * span;
        node.z = node.z * span;
    }
    //translate all nodes
    for (const node of graph.nodes) {
        node.x = node.x + origin[0];
        node.y = node.y + origin[1];
        node.z = node.z + origin[2];
    }
    const xDiff = realX - xNumber * span;
    const yDiff = realY - yNumber * span;
    const zDiff = realZ - zNumber * span;
    for (const node of graph.nodes) {
        node.x = node.x + xDiff / 2;
        node.y = node.y + yDiff / 2;
        node.z = node.z + zDiff / 2;
    }
    // for (const node of graph.nodes) {
    //     node.x = node.x ;//+ origin[0];
    //     node.y = node.z ;//+ origin[1];
    //     node.z = -node.y ;//+ origin[2];
    // }
    // const oldY = graph.yNumber;
    // graph.yNumber = graph.zNumber;
    // graph.zNumber = oldY;
    console.log(`Generated grid with ${graph.nodes.length} nodes and ${graph.edges.length} edges`);
    return graph;
};
//console.log(GridGen.DuplexToLines());
// const obj = GridGen.DuplexToNodes();
//const obj = GridGen.BuildingToLines();
const graph = GridGen.BuildingToGraph();
const json = GridGen.exportToJSON(graph);
const a = true;
//console.log(GridGen.exportToJSON(GridGen.generateGrid([5, 5, 5], 10, 2, 2, 2)))
//# sourceMappingURL=gridGen.js.map