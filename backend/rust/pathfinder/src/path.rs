mod grid;
mod octtree;

use std::{marker::PhantomData, path::Path};

pub use grid::*;
pub use octtree::*;

use crate::{math::vector::Vector3, scene::Bounds, utility::GenError};

pub struct PathfindingPath {
    points: Vec<Vector3>,
}

impl PathfindingPath {
    pub fn load(path: &Path) -> GenError<Self> {
        let points: Vec<Vec<f32>> = serde_json::from_reader(std::fs::File::open(path)?)?;
        let points = points
            .into_iter()
            .map(|vec| Vector3::new(vec[0], vec[1], vec[2]))
            .collect();
        Ok(Self { points })
    }
}

pub trait VoxelStrategy {
    fn is_valid(rhs: &Bounds, lhs: &Bounds) -> bool;
}

pub struct AllowInterior {}

impl VoxelStrategy for AllowInterior {
    fn is_valid(rhs: &Bounds, lhs: &Bounds) -> bool {
        rhs.collides_with(lhs)
    }
}

pub struct DisallowInterior {}

impl VoxelStrategy for DisallowInterior {
    fn is_valid(rhs: &Bounds, lhs: &Bounds) -> bool {
        rhs.contains(lhs)
    }
}

pub struct Neg<S: VoxelStrategy> {
    _marker: PhantomData<S>,
}

impl<S: VoxelStrategy> VoxelStrategy for Neg<S> {
    fn is_valid(rhs: &Bounds, lhs: &Bounds) -> bool {
        !S::is_valid(rhs, lhs)
    }
}
