import duplex from "@/../server/models/Duplex_boxes.json"
import builidng from "@/../server/models/BUILDING_boxes.json"


export interface Bbox {
  roomBBox:       BBox;
  obstacleBBoxes: BBox[];
}

export interface BBox {
  x:           number;
  y:           number;
  z:           number;
  xDist:       number;
  yDist:       number;
  zDist:       number;
  type?:       Type;
  penetrable?: boolean;
}

export enum Type {
  IfcBeam = "IfcBeam",
  IfcCovering = "IfcCovering",
  IfcDoor = "IfcDoor",
  IfcFooting = "IfcFooting",
  IfcFurnishingElement = "IfcFurnishingElement",
  IfcMember = "IfcMember",
  IfcOpeningElement = "IfcOpeningElement",
  IfcRailing = "IfcRailing",
  IfcSlab = "IfcSlab",
  IfcSpace = "IfcSpace",
  IfcStairFlight = "IfcStairFlight",
  IfcWall = "IfcWall",
  IfcWallStandardCase = "IfcWallStandardCase",
  IfcWindow = "IfcWindow",
}




export const bboxes = {
  "Duplex": duplex as Bbox,
  "BUILDING": builidng as Bbox
}
