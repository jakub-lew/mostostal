import { GridGen } from './gridGen.js';
import { Graph, GraphNode, } from './interfaces.js';

export class aStarClass {
    static main = (graph: Graph, startNode: number, endNode: number) => {
        const IdxToCoords = (idx: number): [number, number] => {
            return [idx % graph.xNumber, Math.floor(idx / graph.xNumber)];
        }
        const CoordsToIdx = (x: number, y: number): number => {
            return y * graph.xNumber + x;
        }
        const INF = Number.MAX_SAFE_INTEGER;

        for (const node of graph.nodes) {
            node.pathLength = INF;
            node.parentNd = -1;
        }
        //define start vertex
        graph.nodes[startNode].pathLength = 0;

        const nodesToVisit: Set<GraphNode> = new Set();

        nodesToVisit.add(graph.nodes[0]);
        while (nodesToVisit.size > 0) {
            //set to array
            const nodesToVisitArray = Array.from(nodesToVisit);
            nodesToVisitArray.sort((a, b) => {
                const ga = a.pathLength;
                const gb = b.pathLength;
                const ha = Math.pow(IdxToCoords(a.nr)[0] - IdxToCoords(endNode)[0], 2) + Math.pow(IdxToCoords(a.nr)[1] - IdxToCoords(endNode)[1], 2);
                const hb = Math.pow(IdxToCoords(b.nr)[0] - IdxToCoords(endNode)[0], 2) + Math.pow(IdxToCoords(b.nr)[1] - IdxToCoords(endNode)[1], 2);
                return ga - gb + ha - hb;
            });
            const node = nodesToVisitArray[0];
            nodesToVisit.delete(node);
            for (const edge of node.edges) {
                const neighborIdx = node.nr == edge.nodesPair[0] ? edge.nodesPair[1] : edge.nodesPair[0];
                // console.log(`Checking idx ${neighborIdx}}`);
                const neighborNode = graph.nodes[neighborIdx];
                const newPath = node.pathLength + edge.distance;
                if (neighborNode.pathLength == INF) {


                }
                if (newPath < neighborNode.pathLength) {
                    nodesToVisit.add(neighborNode);
                    //console.log(`Adding ${neighborIdx}`)
                    neighborNode.pathLength = newPath;
                    neighborNode.parentNd = node.nr;
                }
            }

        }

        // for (const node of graph.nodes) {
        //     console.log(`Node ${node.nr} has pathLength ${node.pathLength}`);
        // }


        console.log(graph.nodes[endNode].pathLength);
        let path = [];
        const endNd = graph.nodes[endNode] ;
        let currentNd = endNd;
        while(currentNd.nr != startNode){
            path.push([currentNd.x, currentNd.y, currentNd.z]);
            currentNd = graph.nodes[currentNd.parentNd];
        }
        path = path.reverse();
        return path;

    }
    static test() {
        const graph = GridGen.DuplexToGraph();
        return aStarClass.main(graph, 0, 2190);
    }

}
console.log(aStarClass.test());