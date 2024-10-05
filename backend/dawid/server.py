import os
import ifcopenshell
import ifcopenshell.util.shape
import ifcopenshell.geom
import numpy as np
import json
from fastapi import FastAPI, Request
import sys


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
    "IfcStairFlight": False,
    "IfcFurnishingElement": False,
    "IfcFooting": False,
    "IfcWallStandardCase": False,
    "IfcRailing": False,
}


def get_bboxes(ifc_path):
    model = ifcopenshell.open(ifc_path)
    bboxes = []
    types = []
    settings = ifcopenshell.geom.settings()
    settings.set("building-local-placement", True)
    settings.set("use-world-coords", True)
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
        if typ not in PENETRATION:
            penetrable = False
        else:
            penetrable = PENETRATION[typ]
        obstacleBBoxes.append(
            {
                "x": el[0],
                "y": el[1],
                "z": el[2],
                "xDist": el[3] - el[0],
                "yDist": el[4] - el[1],
                "zDist": el[5] - el[2],
                "type": typ,
                "penetrable": penetrable,
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
    name = os.path.splitext(os.path.basename(ifc_path))[0]
    with open(f"../../frontend/server/models/{name}_boxes.json", "w") as f:
        json.dump(result, f, indent=2)
    return result


app = FastAPI()


@app.get("/get_bbox/")
@app.post("/get_bbox/{filename}")
def get_bbox(filename: str):
    file_path = f"../../frontend/server/models/{filename}"
    return get_bboxes(file_path)


def main():
    if len(sys.argv) > 1:
        fp = sys.argv[1]
        a = get_bboxes("../../frontend/server/models/Duplex.ifc")
        name = os.path.splitext(os.path.basename(fp))[0]
        print(f"backend/dawid/bboxes-{name}.json")


if __name__ == "__main__":
    main()
