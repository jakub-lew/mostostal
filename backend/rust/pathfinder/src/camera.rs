use std::f32::consts::{FRAC_PI_2, PI};

use crate::math::{matrix::Matrix4, vector::Vector3};

pub struct Camera {
    proj: Matrix4,
    position: Vector3,
    pub forward: Vector3,
    pub right: Vector3,
    euler: Vector3,
}

const UP: Vector3 = Vector3::z();

impl Camera {
    pub fn new(proj: Matrix4) -> Self {
        Camera {
            proj,
            position: Vector3::zero(),
            forward: Vector3::x(),
            right: -Vector3::y(),
            euler: Vector3::zero(),
        }
    }

    pub fn set_position(&mut self, position: Vector3) {
        self.position = position;
    }

    pub fn set_forward(&mut self, forward: Vector3) {
        self.euler = forward.norm().to_euler();
        self.forward = Vector3::from_euler(self.euler.x, self.euler.y, self.euler.z);
    }

    pub fn update_rotation(&mut self, mouse_delta: (f64, f64)) {
        let (delta_x, delta_y) = mouse_delta;
        let delta_yaw = (delta_x / 400.0) as f32;
        let delta_pitch = (delta_y / 300.0) as f32;
        self.euler.y = (self.euler.y + delta_pitch).clamp(-FRAC_PI_2 + 1e-4, FRAC_PI_2 - 1e-4);
        self.euler.x = ((self.euler.x - delta_yaw) / (2.0 * PI)).fract() * (2.0 * PI);
        self.forward = Vector3::from_euler(self.euler.x, self.euler.y, self.euler.z);
        self.right = self.forward.cross(UP).norm();
    }

    pub fn update_position(&mut self, offset: Vector3) {
        self.position = self.position + offset;
    }

    pub fn get_camera_matrix(&self) -> Matrix4 {
        self.proj * Matrix4::look_at(self.position, self.position + self.forward, UP)
    }
}
