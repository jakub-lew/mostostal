import os
import ifcopenshell
import ifcopenshell.util.shape
import ifcopenshell.geom
import numpy as np
import json
from fastapi import FastAPI
import requests

PENETRATION = {
    "IfcColumn": False,
    "IfcSlab": False,
    "IfcMember": False,
    "IfcSanitaryTerminal": False,
    "IfcRoof": False,
    "IfcWall": False,
    "IfcBeam": False,
    "IfcSpace": True,
    "IfcCovering": False,
    "IfcBuildingElementProxy": False,
    "IfcDoor": True,
    "IfcWindow": True,
    "IfcFurniture": True,
    "IfcGrid": True,
    "IfcOpeningElement": True,
}


def get_bboxes(ifc_path):
    model = ifcopenshell.open(ifc_path)
    bboxes = []
    types = []
    settings = ifcopenshell.geom.settings()
    iterator = ifcopenshell.geom.iterator(
        settings, model, include=model.by_type("IfcProduct"), exclude=None
    )
    for el in iterator:
        verts = el.geometry.verts
        verts = np.reshape(np.array(verts), shape=(int(len(verts) / 3), 3))
        bbox = ifcopenshell.util.shape.get_bbox(verts)
        bboxes.append(np.concatenate(bbox))
        types.append(el.type)
    bboxes = np.array(bboxes)
    obstacleBBoxes = []
    for el, typ in zip(bboxes, types):
        obstacleBBoxes.append(
            {
                "x": el[0],
                "y": el[1],
                "z": el[2],
                "xDist": el[3] - el[0],
                "yDist": el[4] - el[1],
                "zDist": el[5] - el[2],
                "type": typ,
                "penetrable": PENETRATION[typ],
            }
        )
    xmin, ymin, zmin, xmax, ymax, zmax = np.transpose(bboxes)
    result = {
        "roomBBox": {
            "x": xmin.min(),
            "y": ymin.min(),
            "z": zmin.min(),
            "xDist": xmax.max() - xmin.min(),
            "yDist": ymax.max() - ymin.min(),
            "zDist": zmax.max() - zmin.min(),
        },
        "obstacleBBoxes": obstacleBBoxes,
    }
    with open("bboxes.json", "w") as f:
        json.dump(result, f, indent=2)
    return result


app = FastAPI()


@app.get("/get_bbox/")
@app.post("/get_bbox/")
def get_bbox(path: str):
    # path = "http://localhost:5200/example.ifc"
    file_stream = requests.get(path)
    filename = path.split("/")[-1]
    if not os.path.exists("models"):
        os.mkdir("models")
    with open(f"models/{filename}", "wb") as f:
        f.write(file_stream.content)
    file_path = f"models/{filename}"
    return get_bboxes(file_path)


# get_bboxes("../../frontend/server/models/example.ifc")
# types = set()
# for el in model.by_type("IfcProduct"):
#     if el.Representation is not None:
#         types.add(el.is_a())
