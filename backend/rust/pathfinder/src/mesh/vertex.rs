use crate::math::vector::Vector3;

#[repr(C)]
#[derive(Debug, Clone, Copy, Default)]
pub struct Vertex {
    pub pos: Vector3,
    pub color: Vector3,
}
