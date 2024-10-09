use crate::{
    math::{matrix::Matrix4, vector::Vector3},
    scene::{BBox, Bounds, Scene},
};

use super::VoxelStrategy;

struct Node {
    depth: u32,
    bounds: Bounds,
    child: Vec<Node>,
}

pub struct Octtree {
    root: Node,
}

impl Node {
    fn new(bounds: Bounds, depth: u32) -> Self {
        Self {
            depth,
            bounds,
            child: vec![],
        }
    }

    fn insert<S: VoxelStrategy>(&mut self, bbox: &BBox, min_depth: u32, max_depth: u32) {
        if self.depth < min_depth
            || (self.depth < max_depth && S::is_valid(&self.bounds, &bbox.bounds))
        {
            if self.child.is_empty() {
                for bounds in self.octants() {
                    self.child.push(Node::new(bounds, self.depth + 1));
                }
            }
            for child in &mut self.child {
                child.insert::<S>(bbox, min_depth, max_depth);
            }
        }
    }

    fn octants(&self) -> impl Iterator<Item = Bounds> {
        let min = self.bounds.min;
        let max = self.bounds.max;
        let mid = self.bounds.midpoint();
        vec![
            Bounds::new(min, mid),
            Bounds::new(
                Vector3::new(mid.x, min.y, min.z),
                Vector3::new(max.x, mid.y, mid.z),
            ),
            Bounds::new(
                Vector3::new(min.x, mid.y, min.z),
                Vector3::new(mid.x, max.y, mid.z),
            ),
            Bounds::new(
                Vector3::new(mid.x, mid.y, min.z),
                Vector3::new(max.x, max.y, mid.z),
            ),
            Bounds::new(
                Vector3::new(min.x, min.y, mid.z),
                Vector3::new(mid.x, mid.y, max.z),
            ),
            Bounds::new(
                Vector3::new(mid.x, min.y, mid.z),
                Vector3::new(max.x, mid.y, max.z),
            ),
            Bounds::new(
                Vector3::new(min.x, mid.y, mid.z),
                Vector3::new(mid.x, max.y, max.z),
            ),
            Bounds::new(mid, max),
        ]
        .into_iter()
    }

    fn num_bounds(&self) -> usize {
        1 + self
            .child
            .iter()
            .fold(0, |acc, node| acc + node.num_bounds())
    }

    fn collect_bounds(&self, vec: &mut Vec<Bounds>) {
        vec.push(self.bounds);
        for child in self.child.iter() {
            child.collect_bounds(vec);
        }
    }

    fn get_bounds(&self) -> Vec<Bounds> {
        let mut bounds = Vec::with_capacity(self.num_bounds());
        self.collect_bounds(&mut bounds);
        bounds
    }
}

impl Octtree {
    pub fn build<S: VoxelStrategy>(scene: &Scene, min_depth: u32, max_depth: u32) -> Self {
        let bounds = scene.bounds.to_power_of_two();
        let mut root = Node::new(bounds, 0);
        for bbox in scene.get_obstacles().iter() {
            root.insert::<S>(bbox, min_depth, max_depth);
        }
        Self { root }
    }

    pub fn get_bounds_instances(&self) -> Vec<Matrix4> {
        let boxes = self
            .root
            .get_bounds()
            .into_iter()
            .map(|bounds| (&bounds).into())
            .collect();
        boxes
    }
}
