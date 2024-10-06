use std::ops::{Add, Div, Mul, Neg, Sub};

#[repr(C)]
#[derive(Debug, Clone, Copy, Default)]
pub struct Vector3 {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

impl Vector3 {
    #[inline]
    pub const fn zero() -> Self {
        Vector3 {
            x: 0.0,
            y: 0.0,
            z: 0.0,
        }
    }

    #[inline]
    pub const fn x() -> Self {
        Vector3 {
            x: 1.0,
            y: 0.0,
            z: 0.0,
        }
    }

    #[inline]
    pub const fn y() -> Self {
        Vector3 {
            x: 0.0,
            y: 1.0,
            z: 0.0,
        }
    }

    #[inline]
    pub const fn z() -> Self {
        Vector3 {
            x: 0.0,
            y: 0.0,
            z: 1.0,
        }
    }

    #[inline]
    pub const fn new(x: f32, y: f32, z: f32) -> Self {
        Vector3 { x, y, z }
    }

    #[inline]
    pub const fn cross(self, rhs: Self) -> Self {
        Self {
            x: self.y * rhs.z - self.z * rhs.y,
            y: self.z * rhs.x - self.x * rhs.z,
            z: self.x * rhs.y - self.y * rhs.x,
        }
    }

    #[inline]
    pub fn length(self) -> f32 {
        (self * self).sqrt()
    }

    #[inline]
    pub fn norm(self) -> Self {
        self / self.length()
    }

    #[inline]
    pub fn from_euler(yaw: f32, pitch: f32, _roll: f32) -> Self {
        Self {
            x: pitch.cos() * yaw.cos(),
            y: pitch.cos() * yaw.sin(),
            z: pitch.sin(),
        }
    }

    #[inline]
    pub fn to_euler(self) -> Self {
        let yaw = self.y.atan2(self.x);
        let pitch = self.z.atan2((self.x * self.x + self.y * self.y).sqrt());
        let roll = 0.0; // Roll is not defined for a forward vector
        Self {
            x: yaw,
            y: pitch,
            z: roll,
        }
    }

    #[inline]
    pub fn as_bytes(&self) -> &[u8] {
        let ptr: *const u8 = (&self.x as *const f32).cast();
        unsafe { std::slice::from_raw_parts(ptr, size_of::<Self>()) }
    }
}

impl Add for Vector3 {
    type Output = Self;

    #[inline]
    fn add(self, rhs: Self) -> Self::Output {
        Self {
            x: self.x + rhs.x,
            y: self.y + rhs.y,
            z: self.z + rhs.z,
        }
    }
}

impl Sub for Vector3 {
    type Output = Self;

    #[inline]
    fn sub(self, rhs: Self) -> Self::Output {
        Self {
            x: self.x - rhs.x,
            y: self.y - rhs.y,
            z: self.z - rhs.z,
        }
    }
}

impl Div<f32> for Vector3 {
    type Output = Vector3;

    #[inline]
    fn div(self, rhs: f32) -> Self::Output {
        let recip = rhs.recip();
        Self {
            x: self.x * recip,
            y: self.y * recip,
            z: self.z * recip,
        }
    }
}

impl Neg for Vector3 {
    type Output = Self;

    #[inline]
    fn neg(self) -> Self::Output {
        Self {
            x: -self.x,
            y: -self.y,
            z: -self.z,
        }
    }
}

impl Mul<Vector3> for Vector3 {
    type Output = f32;

    #[inline]
    fn mul(self, rhs: Vector3) -> Self::Output {
        self.x * rhs.x + self.y * rhs.y + self.z * rhs.z
    }
}

impl Mul<Vector3> for f32 {
    type Output = Vector3;

    #[inline]
    fn mul(self, rhs: Vector3) -> Self::Output {
        Vector3 {
            x: self * rhs.x,
            y: self * rhs.y,
            z: self * rhs.z,
        }
    }
}

#[repr(C)]
#[derive(Debug, Clone, Copy, Default)]
pub struct Vector4 {
    pub x: f32,
    pub y: f32,
    pub z: f32,
    pub w: f32,
}

impl Vector4 {
    #[inline]
    pub const fn point(point: Vector3) -> Self {
        Self {
            x: point.x,
            y: point.y,
            z: point.z,
            w: 1.0,
        }
    }

    #[inline]
    pub const fn vector(vector: Vector3) -> Self {
        Self {
            x: vector.x,
            y: vector.y,
            z: vector.z,
            w: 0.0,
        }
    }

    #[inline]
    pub const fn zero() -> Self {
        Vector4 {
            x: 0.0,
            y: 0.0,
            z: 0.0,
            w: 0.0,
        }
    }

    #[inline]
    pub const fn x() -> Self {
        Vector4 {
            x: 1.0,
            y: 0.0,
            z: 0.0,
            w: 0.0,
        }
    }

    #[inline]
    pub const fn y() -> Self {
        Vector4 {
            x: 0.0,
            y: 1.0,
            z: 0.0,
            w: 0.0,
        }
    }

    #[inline]
    pub const fn z() -> Self {
        Vector4 {
            x: 0.0,
            y: 0.0,
            z: 1.0,
            w: 0.0,
        }
    }

    #[inline]
    pub const fn w() -> Self {
        Vector4 {
            x: 0.0,
            y: 0.0,
            z: 0.0,
            w: 1.0,
        }
    }

    #[inline]
    pub const fn new(x: f32, y: f32, z: f32, w: f32) -> Self {
        Vector4 { x, y, z, w }
    }

    #[inline]
    pub fn as_bytes(&self) -> &[u8] {
        let ptr: *const u8 = (&self.x as *const f32).cast();
        unsafe { std::slice::from_raw_parts(ptr, size_of::<Self>()) }
    }
}

impl Mul<Vector4> for Vector4 {
    type Output = f32;

    #[inline]
    fn mul(self, rhs: Vector4) -> Self::Output {
        self.x * rhs.x + self.y * rhs.y + self.z * rhs.z + self.w * rhs.w
    }
}

impl Mul<Vector4> for f32 {
    type Output = Vector4;

    #[inline]
    fn mul(self, rhs: Vector4) -> Self::Output {
        Vector4 {
            x: self * rhs.x,
            y: self * rhs.y,
            z: self * rhs.z,
            w: self * rhs.w,
        }
    }
}

impl Neg for Vector4 {
    type Output = Self;

    #[inline]
    fn neg(self) -> Self::Output {
        Self {
            x: -self.x,
            y: -self.y,
            z: -self.z,
            w: -self.w,
        }
    }
}

impl Add for Vector4 {
    type Output = Self;

    #[inline]
    fn add(self, rhs: Self) -> Self::Output {
        Self {
            x: self.x + rhs.x,
            y: self.y + rhs.y,
            z: self.z + rhs.z,
            w: self.w + rhs.w,
        }
    }
}

impl Sub for Vector4 {
    type Output = Self;

    #[inline]
    fn sub(self, rhs: Self) -> Self::Output {
        Self {
            x: self.x - rhs.x,
            y: self.y - rhs.y,
            z: self.z - rhs.z,
            w: self.w - rhs.w,
        }
    }
}

impl Div<f32> for Vector4 {
    type Output = Vector4;

    #[inline]
    fn div(self, rhs: f32) -> Self::Output {
        let recip = rhs.recip();
        Self {
            x: self.x * recip,
            y: self.y * recip,
            z: self.z * recip,
            w: self.w * recip,
        }
    }
}
