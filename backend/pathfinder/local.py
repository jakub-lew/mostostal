# Copyright 2024 Tomasz Lepszy.

import json
from pathfinder import Octree, search, path_to_points


path = 'building.json'
dump = 'max.json'
start = 817
goal = 1558


with open(path, 'r') as file:
    grid = json.load(file)
    octree = Octree(grid)
    path = search(octree, start, goal)
    points = path_to_points(octree, path)
    print(points)

with open(dump, 'w') as json_file:
    json.dump(points, json_file, indent=4)
