use std::path::Path;

use json::{JsonBBox, JsonScene};

use crate::{
    math::{matrix::Matrix4, vector::Vector3},
    utility::GenError,
};

mod json;

pub struct Scene {
    pub room: BBox,
    pub obstacles: Vec<BBox>,
    pub bounds: Bounds,
}

#[derive(Debug, Clone, Copy)]
pub struct Bounds {
    pub min: Vector3,
    pub max: Vector3,
}

impl Bounds {
    pub fn new(min: Vector3, max: Vector3) -> Self {
        Self { min, max }
    }

    pub fn empty() -> Self {
        Self {
            min: Vector3::zero(),
            max: Vector3::zero(),
        }
    }

    pub fn join(&self, other: &Bounds) -> Bounds {
        let min = Vector3::new(
            self.min.x.min(other.min.x),
            self.min.y.min(other.min.y),
            self.min.z.min(other.min.z),
        );
        let max = Vector3::new(
            self.max.x.max(other.max.x),
            self.max.y.max(other.max.y),
            self.max.z.max(other.max.z),
        );
        Bounds::new(min, max)
    }

    pub fn contains(&self, other: &Bounds) -> bool {
        self.min.x < other.max.x
            && self.max.x > other.min.x
            && self.min.y < other.max.y
            && self.max.y > other.min.y
            && self.min.z < other.max.z
            && self.max.z > other.min.z
    }

    pub fn planes(&self) -> Vec<Bounds> {
        let mut planes = Vec::new();
        let dimensions = self.dimensions();

        // Bottom and top planes
        planes.push(Bounds::new(
            self.min,
            Vector3::new(self.max.x, self.max.y, self.min.z),
        ));
        planes.push(Bounds::new(
            Vector3::new(self.min.x, self.min.y, self.max.z),
            self.max,
        ));

        // Front and back planes
        planes.push(Bounds::new(
            self.min,
            Vector3::new(self.max.x, self.min.y, self.max.z),
        ));
        planes.push(Bounds::new(
            Vector3::new(self.min.x, self.max.y, self.min.z),
            self.max,
        ));

        // Left and right planes
        planes.push(Bounds::new(
            self.min,
            Vector3::new(self.min.x, self.max.y, self.max.z),
        ));
        planes.push(Bounds::new(
            Vector3::new(self.max.x, self.min.y, self.min.z),
            self.max,
        ));

        planes
    }

    pub fn collides_with(&self, other: &Bounds) -> bool {
        for plane in self.planes() {
            if plane.contains(other) {
                return true;
            }
        }
        false
    }

    pub fn contains_point(&self, point: &Vector3) -> bool {
        self.min.x <= point.x
            && point.x <= self.max.x
            && self.min.y <= point.y
            && point.y <= self.max.y
            && self.min.z <= point.z
            && point.z <= self.max.z
    }

    pub fn midpoint(&self) -> Vector3 {
        (self.min + self.max) / 2.0
    }

    pub fn dimensions(&self) -> Vector3 {
        self.max - self.min
    }

    pub fn to_power_of_two(&self) -> Bounds {
        fn next_power_of_two(x: f32) -> f32 {
            2.0_f32.powi((x - 1.0).log2().ceil() as i32)
        }

        let dimensions = self.dimensions();
        let new_dimensions = Vector3::new(
            next_power_of_two(dimensions.x),
            next_power_of_two(dimensions.y),
            next_power_of_two(dimensions.z),
        );

        let mid_point = self.midpoint();
        let half_new_dimensions = new_dimensions / 2.0;

        Bounds::new(
            mid_point - half_new_dimensions,
            mid_point + half_new_dimensions,
        )
    }
}

impl From<&Bounds> for Matrix4 {
    fn from(bounds: &Bounds) -> Self {
        let mid_point = bounds.midpoint();
        let dimensions = bounds.dimensions();
        Matrix4::translate(mid_point) * Matrix4::scale(dimensions)
    }
}

impl<T: Iterator<Item = Bounds>> From<T> for Bounds {
    fn from(value: T) -> Self {
        let mut bounds = Bounds::empty();
        for other in value {
            bounds = bounds.join(&other);
        }
        bounds
    }
}

#[derive(Debug, Clone)]
pub struct BBox {
    pub bounds: Bounds,
    pub class: Option<String>,
    pub penetrable: Option<bool>,
}

impl From<JsonBBox> for BBox {
    fn from(value: JsonBBox) -> Self {
        Self {
            bounds: Bounds::new(
                Vector3::new(value.x, value.y, value.z),
                Vector3::new(
                    value.x + value.xDist,
                    value.y + value.yDist,
                    value.z + value.zDist,
                ),
            ),
            class: value.r#type,
            penetrable: value.penetrable,
        }
    }
}

impl From<JsonScene> for Scene {
    fn from(value: JsonScene) -> Self {
        let obstacles: Vec<BBox> = value
            .obstacleBBoxes
            .into_iter()
            .map(|bbox| bbox.into())
            .collect();
        let bounds: Bounds = obstacles.iter().map(|o| o.bounds).into();
        Self {
            room: value.roomBBox.into(),
            obstacles,
            bounds,
        }
    }
}

impl Scene {
    pub fn load(path: &Path) -> GenError<Self> {
        let scene = JsonScene::load(path)?.into();
        Ok(scene)
    }

    pub fn get_bounds_instances(&self) -> Vec<Matrix4> {
        let boxes = self
            .obstacles
            .iter()
            .map(|bbox| (&bbox.bounds).into())
            .collect();
        boxes
    }

    pub fn get_obstacles(&self) -> Vec<BBox> {
        let obstacles: Vec<_> = self
            .obstacles
            .iter()
            .filter_map(|obstacle| {
                if let Some(penetrable) = obstacle.penetrable {
                    if !penetrable {
                        return Some(obstacle);
                    }
                }
                if let Some(ifc_class) = &obstacle.class {
                    let string = ifc_class.as_str();
                    match string {
                        "IfcColumn" => Some(obstacle),
                        "IfcSlab" => Some(obstacle),
                        "IfcMember" => None,
                        "IfcSanitaryTerminal" => Some(obstacle),
                        "IfcRoof" => Some(obstacle),
                        "IfcWall" => Some(obstacle),
                        "IfcBeam" => Some(obstacle),
                        "IfcSpace" => None,
                        "IfcCovering" => Some(obstacle),
                        "IfcBuildingElementProxy" => Some(obstacle),
                        "IfcDoor" => None,
                        "IfcWindow" => None,
                        "IfcFurniture" => None,
                        "IfcGrid" => None,
                        "IfcOpeningElement" => None,
                        "IfcStairFlight" => Some(obstacle),
                        "IfcFurnishingElement" => Some(obstacle),
                        "IfcFooting" => Some(obstacle),
                        "IfcWallStandardCase" => Some(obstacle),
                        "IfcRailing" => Some(obstacle),
                        _ => None,
                    }
                } else {
                    None
                }
            })
            .cloned()
            .collect();
        obstacles
    }
}
