# Copyright 2024 Tomasz Lepszy.


import heapq
import math
import logging


logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("pathfinder")


DISTANCE = 0.5
DIRECTIONS = [[1, 0, 0], [-1, 0, 0],
              [0, 1, 0], [0, -1, 0],
              [0, 0, 1], [0, 0, -1]]
SMALLEST_STEP = 0.5
MAXIMAL_DISTANCE = 50
COST_LIMIT = 50


class Node:
    """
    Data structure of the node of the search tree.
    Node
    """
    def __init__(self, x, y, z, octant):
        self.x = x
        self.y = y
        self.z = z

        self.octant = octant

    def __eq__(self, other):
        return isinstance(other, Node) \
            and self.x == other.x \
            and self.y == other.y \
            and self.z == other.z

    def __hash__(self):
        return hash((self.x, self.y, self.z))

    def __repr__(self):
        return str(self.octant)


def calculate_penalty(octree, node_a, node_b):
    """
    Here deviation from from expected height should be penalized.
    CalculateGCost
    """
    return 0


def extend_node(octree, current_node, step, direction_vector):
    logging.debug(f'Extending node {current_node} with step '
                  + f'{step} in direction {direction_vector}')
    node = octree[current_node]
    x = node.x + direction_vector[0] * step
    y = node.y + direction_vector[1] * step
    z = node.z + direction_vector[2] * step
    extended_node = octree.get_octant(x, y, z)
    logging.debug(f'Extended node to octant: {extended_node} '
                  + f'at coordinates ({x}, {y}, {z})')
    return extended_node


def search_neighbors(octree, current,
                     velocity_limit=COST_LIMIT,
                     epsilon=0.1,
                     maximal_allowed_step=MAXIMAL_DISTANCE,
                     smallest_step=SMALLEST_STEP,
                     allowed_directions=DIRECTIONS):
    logging.debug(f'Searching neighbors for node {current}')
    neighbors = []

    for direction in allowed_directions:
        valid = current
        step = octree.graph["span"] or 1

        while step <= maximal_allowed_step:
            trial = extend_node(octree, current, step, direction)
            if trial is None:
                break
            if calculate_penalty(octree, current, valid) \
               < calculate_penalty(octree, current, trial):
                valid = trial
            else:
                valid = trial
                break
            step += smallest_step
        logging.debug(f'Found neighbor: {valid} in direction '
                      + f'{direction} with step {step}')
        neighbors.append(valid)
    return neighbors


def calculate_distance(octree, node_a, node_b):
    """
    Calculates Euclidean distance between nodes centers.
    """
    a = octree[node_a]
    b = octree[node_b]
    distance = math.sqrt((b.x - a.x) ** 2
                         + (b.y - a.y) ** 2
                         + (b.z - a.z) ** 2)
    logging.debug('Calculated distance between '
                  + f'{node_a} and {node_b}: {distance}')
    return distance


class Octree:
    """
    Helps exploring model
    This is a naive implementation.
    """
    def __init__(self, graph):
        self.graph = graph
        self.nodes = {}
        self.edges = {}

        self.parse_graph(graph)

    def __getitem__(self, key):
        return self.nodes[key]

    def parse_graph(self, graph):
        for n in graph["grid"]["nodes"]:
            self.nodes[n["nodeNr"]] = Node(n["x"], n["y"], n["z"], n["nodeNr"])

        for e in graph["grid"]["edges"]:
            if e["node1"] not in self.edges:
                self.edges[e["node1"]] = [e["node2"]]
            else:
                self.edges[e["node1"]].append(e["node2"])

            if e["node2"] not in self.edges:
                self.edges[e["node2"]] = [e["node1"]]
            else:
                self.edges[e["node2"]].append(e["node1"])

    def get_octant(self, x, y, z):
        span = self.graph["span"] if "span" in self.graph else 1
        for node in self.nodes.values():
            if (node.x - 0.5 * span) <= x < (node.x + 0.5 * span) \
                    and (node.y - 0.5 * span) <= y < (node.y + 0.5 * span) \
                    and (node.z - 0.5 * span) <= z < (node.z + 0.5 * span):
                return node.octant
        return None


def search(octree, start, goal):
    open_queue = []
    heapq.heappush(open_queue, (0, start))

    total_distances = {start: 0}
    distances = {start: calculate_distance(octree, start, goal)}
    track = {start: None}

    logging.debug(f'Starting search from {start} to {goal}')
    while open_queue:
        _, current = heapq.heappop(open_queue)
        logging.debug(f'Current node: {current}')

        if current == goal:
            logging.debug(f'Goal reached: {goal}')
            return reconstruct_path(track, current)

        for neighbor in search_neighbors(octree, current):
            tentative_cost = total_distances[current] \
                + calculate_distance(octree, current, neighbor)
            logging.debug(f'Neighbor: {neighbor},'
                          + f' Tentative cost: {tentative_cost}')

            if neighbor not in total_distances \
                    or tentative_cost < total_distances[neighbor]:
                total_distances[neighbor] = tentative_cost
                total_cost = tentative_cost \
                    + calculate_distance(octree, neighbor, goal) \
                    + calculate_penalty(octree, current, neighbor)
                distances[neighbor] = total_cost
                heapq.heappush(open_queue, (total_cost, neighbor))
                track[neighbor] = current
                logging.debug(f'Updated path: {neighbor}'
                              + f' with total cost: {total_cost}')
    return None


def reconstruct_path(track, current):
    path = []
    while current is not None:
        path.append(current)
        current = track[current]
    path.reverse()
    return path


def path_to_points(octree, path):
    if path:
        nodes = []
        for node in path:
            nodes.append(octree[node])
        return [[n.x, n.y, n.z] for n in nodes]
