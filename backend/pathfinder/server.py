# Copyright 2024 Tomasz Lepszy.


import logging
from fastapi import FastAPI, Request, HTTPException
from pathfinder import Octree, search, path_to_points

GRID = "data.json"

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("server")

app = FastAPI()

grid = None
octree = None
start = None
goal = None


@app.post("/grid")
async def set_grid(request: Request):
    """
    Set the grid and initialize the Octree.
    """
    global grid, octree
    logger.info("Received POST request at /grid")

    try:
        grid = await request.json()
        logger.info("JSON data received: %s", grid)

        octree = Octree(grid)
        logger.info("Octree initialized successfully.")

    except Exception as e:
        logger.error("Error reading JSON data: %s", e)
        raise HTTPException(
            status_code=400, detail="Invalid JSON data received.")

    return {"status": "success", "received": grid}


@app.get("/")
def read_root():
    """
    Endpoint to return a path from start to goal using the octree.
    """
    global start, goal

    logger.info("Received GET request at root endpoint")

    if octree is None:
        logger.warning("Octree is not initialized.")
        raise HTTPException(
            status_code=500, detail="Octree is not initialized.")
    if start is None or goal is None:
        logger.warning("Start or goal is not set.")
        raise HTTPException(
            status_code=400, detail="Start or goal is not set.")

    path = search(octree, start, goal)
    logger.info("Search completed, path found: %s", path)

    points = path_to_points(octree, path)
    logger.info("Converted path to points: %s", points)

    return points


@app.post("/nodes")
async def nodes(request: Request):
    """
    Dummy endpoint to receive node data and echo it back.
    """
    logger.info("Received POST request at /nodes")

    try:
        json_data = await request.json()
        logger.info("JSON data received: %s", json_data)

    except Exception as e:
        logger.error("Error reading JSON data: %s", e)
        raise HTTPException(
            status_code=400, detail="Invalid JSON data received.")

    return json_data


@app.post("/start")
async def set_start(request: Request):
    """
    Set the start node for the pathfinding.
    """
    global start
    logger.info("Received POST request at /start")

    try:
        json_data = await request.json()
        logger.info("JSON data received: %s", json_data)

        start = json_data.get("start")
        if start is None:
            raise ValueError("Start node is missing.")
        logger.info("Start node set to: %s", start)

    except Exception as e:
        logger.error("Error reading JSON data: %s", e)
        raise HTTPException(
            status_code=400, detail="Invalid JSON data received.")

    return start


@app.post("/goal")
async def set_goal(request: Request):
    """
    Set the goal node for the pathfinding.
    """
    global goal
    logger.info("Received POST request at /goal")

    try:
        json_data = await request.json()
        logger.info("JSON data received: %s", json_data)

        goal = json_data.get("goal")
        if goal is None:
            raise ValueError("Goal node is missing.")
        logger.info("Goal node set to: %s", goal)

    except Exception as e:
        logger.error("Error reading JSON data: %s", e)
        raise HTTPException(
            status_code=400, detail="Invalid JSON data received.")

    return goal


@app.post("/initialize")
async def initialize(request: Request):
    """
    Set the grid, start, and goal nodes in a single request.
    """
    global grid, octree, start, goal
    logger.info("Received POST request at /initialize")

    try:
        json_data = await request.json()
        logger.info("JSON data received: %s", json_data)

        # Set grid
        grid = json_data.get("grid")
        if grid is None:
            raise ValueError("Grid data is missing.")
        logger.info("Grid set successfully.")

        # Initialize Octree
        octree = Octree(grid)
        logger.info("Octree initialized successfully.")

        # Set start node
        start = json_data.get("start")
        if start is None:
            raise ValueError("Start node is missing.")
        logger.info("Start node set to: %s", start)

        # Set goal node
        goal = json_data.get("goal")
        if goal is None:
            raise ValueError("Goal node is missing.")
        logger.info("Goal node set to: %s", goal)

    except Exception as e:
        logger.error("Error processing request data: %s", e)
        raise HTTPException(
            status_code=400, detail="Invalid data received.")

    return {"status": "success", "grid": grid, "start": start, "goal": goal}
