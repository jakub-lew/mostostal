use crate::utility::GenError;
use serde_json;
use std::path::Path;

#[derive(Debug, Clone, serde::Deserialize)]
pub(super) struct JsonScene {
    pub roomBBox: JsonBBox,
    pub obstacleBBoxes: Vec<JsonBBox>,
}

// {
//     "x": -0.5,
//     "y": -0.0399999991059,
//     "z": -0.288675134595,
//     "xDist": 5.5,
//     "yDist": 0.0799999982118,
//     "zDist": 3.3601785625550002,
//     "type": "IfcMember",
//     "penetrable": false
//   },
#[derive(Debug, Clone, serde::Deserialize)]
pub(super) struct JsonBBox {
    pub x: f32,
    pub y: f32,
    pub z: f32,
    pub xDist: f32,
    pub yDist: f32,
    pub zDist: f32,
    pub r#type: Option<String>,
    pub penetrable: Option<bool>,
}

impl JsonScene {
    pub(super) fn load(path: &Path) -> GenError<Self> {
        let scene: JsonScene = serde_json::from_reader(std::fs::File::open(path)?)?;
        Ok(scene)
    }
}
