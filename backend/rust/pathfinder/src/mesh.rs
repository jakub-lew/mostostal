mod vertex;

pub use vertex::*;

use crate::math::vector::Vector3;

pub struct Mesh {
    pub(crate) vertices: Vec<Vertex>,
    pub(crate) indices: Vec<u32>,
}

pub fn triangle() -> Mesh {
    let vertices = vec![
        Vertex {
            pos: Vector3::new(0.0, 0.5, 0.0),
            color: Vector3::new(1.0, 0.0, 0.0),
        },
        Vertex {
            pos: Vector3::new(-0.5, -0.5, 0.0),
            color: Vector3::new(0.0, 1.0, 0.0),
        },
        Vertex {
            pos: Vector3::new(0.5, -0.5, 0.0),
            color: Vector3::new(0.0, 0.0, 1.0),
        },
    ];

    let indices = vec![0, 1, 2];

    Mesh { vertices, indices }
}
