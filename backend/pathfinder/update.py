# Copyright 2024 Tomasz Lepszy.


import json
import requests


base_url = "http://127.0.0.1:8000"
grid_url = f"{base_url}/grid"
start_url = f"{base_url}/start"
goal_url = f"{base_url}/goal"
initialize_url = f"{base_url}/initialize"


file_path = 'data.json'
start_node = 0
goal_node = 7


with open(file_path, 'r') as file:
    grid = json.load(file)


payload = {"grid": grid,
           "start": start_node,
           "goal": goal_node}

response = requests.post(initialize_url, json=payload)
if response.status_code == 200:
    print("Successfully initialized the server with "
          "grid, start, and goal nodes.")
    print("Response:", response.json())
else:
    print(f"Failed to initialize server. Status code: {response.status_code}")
    print("Response:", response.text)


# response = requests.post(grid_url, json=grid)
# if response.status_code == 200:
#     print("Successfully sent the grid data to the server.")
#     print("Response:", response.json())
# else:
#     print(f"Failed to send grid data. Status code: {response.status_code}")
#     print("Response:", response.text)


# start_response = requests.post(start_url, json={"start": start_node})
# if start_response.status_code == 200:
#     print(f"Successfully updated the start node to {start_node}.")
#     print("Start Response:", start_response.json())
# else:
#     print("Failed to update start node. Status code:"
#           + f"{start_response.status_code}")
#     print("Response:", start_response.text)


# goal_response = requests.post(goal_url, json={"goal": goal_node})
# if goal_response.status_code == 200:
#     print(f"Successfully updated the goal node to {goal_node}.")
#     print("Goal Response:", goal_response.json())
# else:
#     print("Failed to update goal node. Status code:"
#           + f"{goal_response.status_code}")
#     print("Response:", goal_response.text)
