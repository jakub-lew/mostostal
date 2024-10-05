class GridGen {
    static main = () => {
        const INF = Number.MAX_SAFE_INTEGER;
        interface Edge { edgeNr: number, nodesPair: [number, number], distance: number }
        interface GraphNode { nr: number, edges: Edge[], pathLength: number }
        interface Graph { nodes: GraphNode[], edges: Edge[] }
        const graph: Graph = { nodes: [], edges: [] };
        // create neighbors
        const xNumber = 7;
        const yNumber = 5;
        const zNumber = 1;
        const coordsToIdx = (x: number, y: number) => y * xNumber + x;
        const IdxToCoords = (idx: number) => [idx % xNumber, Math.floor(idx / xNumber)];

        for (let z = 0; z < zNumber; z++) {
            for (let y = 0; y < yNumber; y++) {
                for (let x = 0; x < xNumber; x++) {
                    const ndNr = coordsToIdx(x, y);
                    const node: GraphNode = { nr: ndNr, edges: [], pathLength: INF };
                    graph.nodes.push(node);
                    if (x > 0) {
                        {
                            const neighborNd = graph.nodes[coordsToIdx(x - 1, y)];
                            const edge: Edge = { edgeNr: graph.edges.length, nodesPair: [ndNr, neighborNd.nr], distance: 1 };
                            graph.edges.push(edge);
                            node.edges.push(edge);
                            neighborNd.edges.push(edge);
                        }
                    }
                    if (y > 0) {
                        {
                            const neighborNd = graph.nodes[coordsToIdx(x, y - 1)];
                            const edge: Edge = { edgeNr: graph.edges.length, nodesPair: [ndNr, neighborNd.nr], distance: 1 };
                            graph.edges.push(edge);
                            node.edges.push(edge);
                            neighborNd.edges.push(edge);
                        }
                    }
                    if (x > 0 && y > 0) {
                        {
                            const neighborNd = graph.nodes[coordsToIdx(x - 1, y - 1)];
                            const edge: Edge = { edgeNr: graph.edges.length, nodesPair: [ndNr, neighborNd.nr], distance: 1.414 };
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
            const newLine = `expand( {delta : 0.1}, line([[${start[0]},${start[1]}],[${end[0]},${end[1]}]])),`;
            txt += newLine;
            //console.log(newLine);
        }
        for (const node of graph.nodes) {
            console.log(`Node ${node.nr} has pathLength ${node.pathLength}`);
        }
        //for(let i=1 ; i)


    }
}
GridGen.main();