use std::ops::Mul;

use super::vector::{Vector3, Vector4};

#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct Matrix3 {
    pub i: Vector3,
    pub j: Vector3,
    pub k: Vector3,
}

impl Default for Matrix3 {
    #[inline]
    fn default() -> Self {
        Self {
            i: Vector3::x(),
            j: Vector3::y(),
            k: Vector3::z(),
        }
    }
}

impl Matrix3 {
    #[inline]
    pub fn new(i: Vector3, j: Vector3, k: Vector3) -> Self {
        Self { i, j, k }
    }
}

#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct Matrix4 {
    pub i: Vector4,
    pub j: Vector4,
    pub k: Vector4,
    pub l: Vector4,
}

impl Default for Matrix4 {
    #[inline]
    fn default() -> Self {
        Self {
            i: Vector4::x(),
            j: Vector4::y(),
            k: Vector4::z(),
            l: Vector4::w(),
        }
    }
}

impl Matrix4 {
    #[inline]
    pub fn new(i: Vector4, j: Vector4, k: Vector4, l: Vector4) -> Self {
        Self { i, j, k, l }
    }

    #[inline]
    pub fn as_bytes(&self) -> &[u8] {
        let ptr: *const u8 = (&self.i.x as *const f32).cast();
        unsafe { std::slice::from_raw_parts(ptr, size_of::<Self>()) }
    }

    #[inline]
    pub fn perspective(fov_y_rad: f32, aspect_ratio: f32, z_near: f32, z_far: f32) -> Matrix4 {
        let x_scale = (fov_y_rad * 0.5).tan().recip();
        let y_scale = -x_scale / aspect_ratio;
        let z_scale = 0.5 * (z_near + z_far) / (z_near - z_far) - 0.5;
        let l_z = (z_near * z_far) / (z_near - z_far);
        Matrix4 {
            i: Vector4::new(x_scale, 0.0, 0.0, 0.0),
            j: Vector4::new(0.0, y_scale, 0.0, 0.0),
            k: Vector4::new(0.0, 0.0, z_scale, -1.0),
            l: Vector4::new(0.0, 0.0, l_z, 0.0),
        }
    }

    #[inline]
    pub fn look_at(eye: Vector3, target: Vector3, up: Vector3) -> Matrix4 {
        let f = (eye - target).norm();
        let r = up.cross(f).norm();
        let u = f.cross(r).norm();
        Matrix4 {
            i: Vector4::new(r.x, u.x, f.x, 0.0),
            j: Vector4::new(r.y, u.y, f.y, 0.0),
            k: Vector4::new(r.z, u.z, f.z, 0.0),
            l: Vector4::new(-(eye * r), -(eye * u), -(eye * f), 1.0),
        }
    }

    #[inline]
    pub fn translate(v: Vector3) -> Matrix4 {
        Matrix4::new(
            Vector4::vector(Vector3::x()),
            Vector4::vector(Vector3::y()),
            Vector4::vector(Vector3::z()),
            Vector4::point(v),
        )
    }

    #[inline]
    pub fn rotate_x(rad: f32) -> Matrix4 {
        let cos = rad.cos();
        let sin = rad.sin();
        Matrix3::new(
            Vector3::new(1.0, 0.0, 0.0),
            Vector3::new(0.0, cos, sin),
            Vector3::new(0.0, -sin, cos),
        )
        .into()
    }

    #[inline]
    pub fn rotate_y(rad: f32) -> Matrix4 {
        let cos = rad.cos();
        let sin = rad.sin();
        Matrix3::new(
            Vector3::new(cos, 0.0, -sin),
            Vector3::new(0.0, 1.0, 0.0),
            Vector3::new(sin, 0.0, cos),
        )
        .into()
    }

    #[inline]
    pub fn rotate_z(rad: f32) -> Matrix4 {
        let cos = rad.cos();
        let sin = rad.sin();
        Matrix3::new(
            Vector3::new(cos, sin, 0.0),
            Vector3::new(-sin, cos, 0.0),
            Vector3::new(0.0, 0.0, 1.0),
        )
        .into()
    }
}

impl Mul<Vector4> for Matrix4 {
    type Output = Vector4;
    #[inline]
    fn mul(self, rhs: Vector4) -> Self::Output {
        rhs.x * self.i + rhs.y * self.j + rhs.z * self.k + rhs.w * self.l
    }
}

impl Mul<Matrix4> for Matrix4 {
    type Output = Self;
    #[inline]
    fn mul(self, rhs: Self) -> Self::Output {
        Self {
            i: self * rhs.i,
            j: self * rhs.j,
            k: self * rhs.k,
            l: self * rhs.l,
        }
    }
}

impl From<Matrix3> for Matrix4 {
    fn from(value: Matrix3) -> Self {
        Matrix4 {
            i: Vector4::vector(value.i),
            j: Vector4::vector(value.j),
            k: Vector4::vector(value.k),
            l: Vector4::w(),
        }
    }
}
