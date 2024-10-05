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
        const graph = this.main();
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
        return [
            {
                startPoint: [0, 0, 0],
                endPoint: [1, 1, 1],
            },
            {
                startPoint: [0, 2, 0],
                endPoint: [1, 1, 1],
            },
            {
                startPoint: [0, 0, 0],
                endPoint: [91, 91, 91],
            }
        ];
    }
}
GridGen.main = () => {
    const INF = Number.MAX_SAFE_INTEGER;
    const graph = { nodes: [], edges: [] };
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
    for (let z = 0; z < zNumber; z++) {
        for (let y = 0; y < yNumber; y++) {
            for (let x = 0; x < xNumber; x++) {
                const ndNr = coordsToIdx(x, y, z);
                const node = { nr: ndNr, edges: [], pathLength: INF };
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
                }
                if (z > 0) {
                    {
                        const neighborNd = graph.nodes[coordsToIdx(x, y, z - 1)];
                        const edge = { edgeNr: graph.edges.length, nodesPair: [ndNr, neighborNd.nr], distance: span };
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
    let txt = "";
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
};
GridGen.main();
//# sourceMappingURL=gridGen.js.map