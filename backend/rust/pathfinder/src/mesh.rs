mod vertex;

pub use vertex::*;

use crate::{math::vector::Vector3, path::PathfindingPath};

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

pub fn cube_wire() -> Mesh {
    let vertices = vec![
        Vertex {
            pos: Vector3::new(-0.5, -0.5, -0.5),
            color: Vector3::new(1.0, 0.0, 0.0),
        },
        Vertex {
            pos: Vector3::new(0.5, -0.5, -0.5),
            color: Vector3::new(1.0, 0.0, 0.0),
        },
        Vertex {
            pos: Vector3::new(0.5, 0.5, -0.5),
            color: Vector3::new(1.0, 0.0, 0.0),
        },
        Vertex {
            pos: Vector3::new(-0.5, 0.5, -0.5),
            color: Vector3::new(1.0, 0.0, 0.0),
        },
        Vertex {
            pos: Vector3::new(-0.5, -0.5, 0.5),
            color: Vector3::new(1.0, 0.0, 0.0),
        },
        Vertex {
            pos: Vector3::new(0.5, -0.5, 0.5),
            color: Vector3::new(1.0, 0.0, 0.0),
        },
        Vertex {
            pos: Vector3::new(0.5, 0.5, 0.5),
            color: Vector3::new(1.0, 0.0, 0.0),
        },
        Vertex {
            pos: Vector3::new(-0.5, 0.5, 0.5),
            color: Vector3::new(1.0, 0.0, 0.0),
        },
    ];

    let indices = vec![
        0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7,
    ];

    Mesh { vertices, indices }
}

pub fn cube_solid() -> Mesh {
    let vertices = vec![
        Vertex {
            pos: Vector3::new(-0.5, -0.5, -0.5),
            color: Vector3::new(1.0, 0.0, 0.0),
        },
        Vertex {
            pos: Vector3::new(0.5, -0.5, -0.5),
            color: Vector3::new(0.0, 1.0, 0.0),
        },
        Vertex {
            pos: Vector3::new(0.5, 0.5, -0.5),
            color: Vector3::new(0.0, 0.0, 1.0),
        },
        Vertex {
            pos: Vector3::new(-0.5, 0.5, -0.5),
            color: Vector3::new(1.0, 1.0, 0.0),
        },
        Vertex {
            pos: Vector3::new(-0.5, -0.5, 0.5),
            color: Vector3::new(1.0, 0.0, 1.0),
        },
        Vertex {
            pos: Vector3::new(0.5, -0.5, 0.5),
            color: Vector3::new(0.0, 1.0, 1.0),
        },
        Vertex {
            pos: Vector3::new(0.5, 0.5, 0.5),
            color: Vector3::new(1.0, 1.0, 1.0),
        },
        Vertex {
            pos: Vector3::new(-0.5, 0.5, 0.5),
            color: Vector3::new(0.0, 0.0, 0.0),
        },
    ];

    let indices = vec![
        0, 1, 2, 2, 3, 0, // back face
        4, 5, 6, 6, 7, 4, // front face
        0, 1, 5, 5, 4, 0, // bottom face
        2, 3, 7, 7, 6, 2, // top face
        0, 3, 7, 7, 4, 0, // left face
        1, 2, 6, 6, 5, 1, // right face
    ];

    Mesh { vertices, indices }
}

impl From<PathfindingPath> for Mesh {
    fn from(value: PathfindingPath) -> Self {
        let mut vertices = Vec::new();
        let mut indices = Vec::new();

        for i in 0..value.points.len() - 1 {
            let start = &value.points[i];
            let end = &value.points[i + 1];

            let start_vertex = Vertex {
                pos: Vector3::new(start.x, start.y, start.z),
                color: Vector3::new(1.0, 1.0, 1.0),
            };
            let end_vertex = Vertex {
                pos: Vector3::new(end.x, end.y, end.z),
                color: Vector3::new(1.0, 1.0, 1.0),
            };

            vertices.push(start_vertex);
            vertices.push(end_vertex);

            let start_index = (i * 2) as u32;
            let end_index = start_index + 1;

            indices.push(start_index);
            indices.push(end_index);
        }

        Mesh { vertices, indices }
    }
}
