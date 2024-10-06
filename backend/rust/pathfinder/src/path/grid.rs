use std::cell;

use crate::{
    math::{matrix::Matrix4, vector::Vector3},
    scene::{Bounds, Scene},
};

use super::VoxelStrategy;

pub struct Grid {
    num_rows: usize,
    num_cols: usize,
    num_layers: usize,
    cells: Vec<bool>,
    cell_size: f32,
    bounds: Bounds,
}

impl Grid {
    pub fn build<S: VoxelStrategy>(scene: &Scene, cell_size: f32) -> Self {
        let bounds = scene.bounds;
        let num_rows = ((bounds.dimensions().x + cell_size) / cell_size) as usize;
        let num_cols = ((bounds.dimensions().y + cell_size) / cell_size) as usize;
        let num_layers = ((bounds.dimensions().z + cell_size) / cell_size) as usize;
        let mut cells = vec![true; num_rows * num_cols * num_layers];
        for i in 0..(num_rows * num_cols * num_layers) {
            if cells[i] {
                let cell_bounds = cell_bounds_from_index(i, num_cols, num_rows, cell_size, bounds);
                for obstacle in scene.get_obstacles().iter() {
                    if S::is_valid(&obstacle.bounds, &cell_bounds) {
                        cells[i] = false;
                        break;
                    }
                }
            }
        }
        Self {
            num_rows,
            num_cols,
            num_layers,
            cells,
            cell_size,
            bounds,
        }
    }

    pub fn get_bounds_instances(&self) -> Vec<Matrix4> {
        let mut instances: Vec<_> = self
            .cells
            .iter()
            .enumerate()
            .filter_map(|(i, &free)| {
                if free {
                    Some((&self.cell_bounds(i)).into())
                } else {
                    None
                }
            })
            .collect();
        instances.push((&self.bounds).into());
        instances
    }

    fn cell_bounds(&self, i: usize) -> Bounds {
        cell_bounds_from_index(i, self.num_cols, self.num_rows, self.cell_size, self.bounds)
    }
}

fn get_cell_bounds(row: usize, col: usize, layer: usize, cell_size: f32, bounds: Bounds) -> Bounds {
    let min = bounds.min
        + Vector3::new(
            col as f32 * cell_size,
            row as f32 * cell_size,
            layer as f32 * cell_size,
        );
    let max = min + Vector3::new(cell_size, cell_size, cell_size);
    Bounds::new(min, max)
}

fn cell_bounds_from_index(
    i: usize,
    num_cols: usize,
    num_rows: usize,
    cell_size: f32,
    bounds: Bounds,
) -> Bounds {
    let (layer, row, col) = cell_xyz(i, num_cols, num_rows);
    let cell_bounds = get_cell_bounds(row, col, layer, cell_size, bounds);
    cell_bounds
}

fn cell_xyz(i: usize, num_cols: usize, num_rows: usize) -> (usize, usize, usize) {
    let layer = i / (num_cols * num_rows);
    let i = i % (num_cols * num_rows);
    let row = i % num_cols;
    let col = i / num_cols;
    (layer, row, col)
}
