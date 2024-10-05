interface Edge { edgeNr: number, nodesPair: [number, number], distance: number }
interface GraphNode { nr: number, edges: Edge[], pathLength: number }
interface Graph { nodes: GraphNode[], edges: Edge[], span: number, xNumber: number, yNumber: number, zNumber: number }
export class GridGen {
    static coordsToIdx = (x: number, y: number, z: number, xNumber: number, yNumber: number) => (x: number, y: number, z: number) => x + y * xNumber + z * xNumber * yNumber;
    static idxToCoords = (xNumber: number, yNumber: number) => (idx: number) => {
        const x = idx % xNumber;
        const y = Math.floor(idx / xNumber) % yNumber;
        const z = Math.floor(idx / (xNumber * yNumber));
        return [x, y, z];
    }
    static generateGrid = (origin: [number, number, number], span: number, xNumber: number, yNumber: number, zNumber: number) => {
        const INF = Number.MAX_SAFE_INTEGER;

        const graph: Graph = { nodes: [], edges: [], span: span, xNumber: xNumber, yNumber: yNumber, zNumber: zNumber };
        // create neighbors
        const coordsToIdx = (x: number, y: number, z: number) => x + y * xNumber + z * xNumber * yNumber;
        const IdxToCoords = (idx: number) => {
            const x = idx % xNumber;
            const y = Math.floor(idx / xNumber) % yNumber;
            const z = Math.floor(idx / (xNumber * yNumber));
            return [x, y, z];
        }

        for (let z = 0; z < zNumber; z++) {
            for (let y = 0; y < yNumber; y++) {
                for (let x = 0; x < xNumber; x++) {
                    const ndNr = coordsToIdx(x, y, z);
                    const node: GraphNode = { nr: ndNr, edges: [], pathLength: INF };
                    graph.nodes.push(node);
                    if (x > 0) {
                        {
                            const neighborNd = graph.nodes[coordsToIdx(x - 1, y, z)];
                            const edge: Edge = { edgeNr: graph.edges.length, nodesPair: [ndNr, neighborNd.nr], distance: span };
                            graph.edges.push(edge);
                            node.edges.push(edge);
                            neighborNd.edges.push(edge);
                        }
                    }
                    if (y > 0) {
                        {
                            const neighborNd = graph.nodes[coordsToIdx(x, y - 1, z)];
                            const edge: Edge = { edgeNr: graph.edges.length, nodesPair: [ndNr, neighborNd.nr], distance: span };
                            graph.edges.push(edge);
                            node.edges.push(edge);
                            neighborNd.edges.push(edge);
                        }
                        if (x < xNumber - 1) {
                            const neighborNd = graph.nodes[coordsToIdx(x + 1, y - 1, z)];
                            const edge: Edge = { edgeNr: graph.edges.length, nodesPair: [ndNr, neighborNd.nr], distance: span * Math.sqrt(2) };
                            graph.edges.push(edge);
                            node.edges.push(edge);
                            neighborNd.edges.push(edge);
                        }
                    }
                    if (z > 0) {
                        {
                            const neighborNd = graph.nodes[coordsToIdx(x, y, z - 1)];
                            const edge: Edge = { edgeNr: graph.edges.length, nodesPair: [ndNr, neighborNd.nr], distance: span };
                            graph.edges.push(edge);
                            node.edges.push(edge);
                            neighborNd.edges.push(edge);
                        }
                        if (x < xNumber - 1) {
                            const neighborNd = graph.nodes[coordsToIdx(x + 1, y, z - 1)];
                            const edge: Edge = { edgeNr: graph.edges.length, nodesPair: [ndNr, neighborNd.nr], distance: span * Math.sqrt(2) };
                            graph.edges.push(edge);
                            node.edges.push(edge);
                            neighborNd.edges.push(edge);
                        }
                        if (y < yNumber - 1) {
                            const neighborNd = graph.nodes[coordsToIdx(x, y + 1, z - 1)];
                            const edge: Edge = { edgeNr: graph.edges.length, nodesPair: [ndNr, neighborNd.nr], distance: span * Math.sqrt(2) };
                            graph.edges.push(edge);
                            node.edges.push(edge);
                            neighborNd.edges.push(edge);
                        }
                    }
                    if (x > 0 && y > 0) {
                        {
                            const neighborNd = graph.nodes[coordsToIdx(x - 1, y - 1, z)];
                            const edge: Edge = { edgeNr: graph.edges.length, nodesPair: [ndNr, neighborNd.nr], distance: span * Math.sqrt(2) };
                            graph.edges.push(edge);
                            node.edges.push(edge);
                            neighborNd.edges.push(edge);
                        }
                    }
                    if (x > 0 && z > 0) {
                        {
                            const neighborNd = graph.nodes[coordsToIdx(x - 1, y, z - 1)];
                            const edge: Edge = { edgeNr: graph.edges.length, nodesPair: [ndNr, neighborNd.nr], distance: span * Math.sqrt(2) };
                            graph.edges.push(edge);
                            node.edges.push(edge);
                            neighborNd.edges.push(edge);
                        }
                    }
                    if (y > 0 && z > 0) {
                        {
                            const neighborNd = graph.nodes[coordsToIdx(x, y - 1, z - 1)];
                            const edge: Edge = { edgeNr: graph.edges.length, nodesPair: [ndNr, neighborNd.nr], distance: span * Math.sqrt(2) };
                            graph.edges.push(edge);
                            node.edges.push(edge);
                            neighborNd.edges.push(edge);
                        }
                    }

                }
            }
        }


        let txt = ""
        for (const edge of graph.edges) {
            const start = IdxToCoords(edge.nodesPair[0]);
            const end = IdxToCoords(edge.nodesPair[1]);
            const newLine = `expand( {delta : 0.1}, line([[${start[0]},${start[1]}, ${start[2]}],[${end[0]},${end[1]},${end[2]}]])),`;
            //txt += newLine;
            // console.log(newLine);
        }
        for (const node of graph.nodes) {
            // console.log(`Node ${node.nr} has pathLength ${node.pathLength}`);
        }
        //for(let i=1 ; i)
        return graph;

    }
    static test() {
        // create neighbors
        const xNumber = 5;
        const yNumber = 5;
        const zNumber = 5;
        const span = 10
        const coordsToIdx = (x: number, y: number, z: number) => x + y * xNumber + z * xNumber * yNumber;
        const IdxToCoords = (idx: number) => {
            const x = idx % xNumber;
            const y = Math.floor(idx / xNumber) % yNumber;
            const z = Math.floor(idx / (xNumber * yNumber));
            return [x, y, z];
        }
        const graph = this.generateGrid([5, 5, 5], span, xNumber, yNumber, zNumber);
        const lines = [];
        for (const edge of graph.edges) {
            const start = IdxToCoords(edge.nodesPair[0]);
            const end = IdxToCoords(edge.nodesPair[1]);
            lines.push({
                startPoint: start,
                endPoint: end,
            });

        };
        return lines;
    }
    static exportToJSON(graph: Graph) {
        const nodes = graph.nodes.map((node) => {
            return {
                nr: node.nr,
                pathLength: node.pathLength,
                edges: node.edges.map((edge) => {
                    return {
                        edgeNr: edge.edgeNr,
                        nodesPair: edge.nodesPair,
                        distance: edge.distance,
                    }
                })
            }
        });
        const edges = graph.edges.map((edge) => {
            return {
                edgeNr: edge.edgeNr,
                nodesPair: edge.nodesPair,
                distance: edge.distance,
            }
        });
        const nodesExport = graph.nodes.map((node) => {
            const coords = this.idxToCoords(graph.xNumber, graph.yNumber)(node.nr);
            return {
                nodeNr: node.nr,
                x: coords[0],
                y: coords[1],
                z: coords[2],
            }
        });


        const edgesExport = graph.edges.map((edge) => {
            return {
                edgeNr: edge.edgeNr,
                node1: edge.nodesPair[0],
                node2: edge.nodesPair[1],
            }
        });

        const graphToExport = {
            span: graph.span,
            grid: { nodes: nodesExport, edges: edgesExport },
        };
        return JSON.stringify(graphToExport);
    }
}
console.log(GridGen.exportToJSON(GridGen.generateGrid([5, 5, 5], 10, 2, 2, 2)));

