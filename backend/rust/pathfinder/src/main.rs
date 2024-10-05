use core::f32;
use pathfinder::{
    camera::Camera,
    debug::{MeshHandle, Renderer},
    math::{matrix::Matrix4, vector::Vector3},
    mesh,
};
use std::{collections::HashMap, error::Error, time::Instant};
use winit::{
    application::ApplicationHandler,
    dpi::{LogicalPosition, LogicalSize},
    event::{DeviceEvent, ElementState, KeyEvent, RawKeyEvent, WindowEvent},
    event_loop::{self, ActiveEventLoop, EventLoop},
    keyboard::{KeyCode, PhysicalKey},
    window::{Window, WindowAttributes, WindowButtons},
};

enum CursorState {
    Free,
    Lock,
}

impl Default for CursorState {
    fn default() -> Self {
        CursorState::Free
    }
}

#[derive(Default)]
struct Application {
    window: Option<Window>,
    renderer: Option<Renderer>,
    meshes: HashMap<&'static str, MeshHandle>,
    camera: Option<Camera>,
    last_frame_time: Option<Instant>,
    delta_time: f32,
    model: Matrix4,
    cursor_state: CursorState,
    key_states: HashMap<KeyCode, ElementState>,
}

impl Application {
    fn new() -> Result<Self, Box<dyn Error>> {
        Ok(Self::default())
    }
}

impl ApplicationHandler for Application {
    fn resumed(&mut self, event_loop: &ActiveEventLoop) {
        self.window = Some(
            event_loop
                .create_window(
                    WindowAttributes::default()
                        .with_resizable(false)
                        .with_enabled_buttons(WindowButtons::CLOSE)
                        .with_inner_size(LogicalSize::new(800, 600))
                        .with_title("Pathfinder"),
                )
                .unwrap(),
        );
        self.renderer = Some(Renderer::new(self.window.as_ref().unwrap()).unwrap());
        let meshes = vec![mesh::triangle()];
        let mesh_handles = self
            .renderer
            .as_mut()
            .unwrap()
            .load_meshes(&meshes)
            .unwrap();
        self.meshes.insert("triangle", mesh_handles[0]);
        let proj = Matrix4::perspective(std::f32::consts::FRAC_PI_3, 600.0 / 800.0, 1e-3, 1e3);
        let mut camera = Camera::new(proj);
        camera.set_position(Vector3::new(2.0, 2.0, 2.0));
        camera.set_forward(-Vector3::new(2.0, 2.0, 2.0));
        self.camera = Some(camera);
    }

    fn new_events(&mut self, _event_loop: &ActiveEventLoop, _cause: winit::event::StartCause) {
        let last_frame_time = *self.last_frame_time.get_or_insert(Instant::now());
        let current_time = Instant::now();
        self.delta_time = (current_time - last_frame_time).as_secs_f32();
        self.last_frame_time = Some(current_time);
        self.model = self.model * Matrix4::rotate_z(f32::consts::FRAC_PI_2 * self.delta_time);

        if let Some(camera) = self.camera.as_mut() {
            if let CursorState::Lock = self.cursor_state {
                let camera_update = self
                    .key_states
                    .iter()
                    .filter(|(_, &state)| state == ElementState::Pressed)
                    .fold(Vector3::zero(), |dir, (key, _)| match key {
                        KeyCode::KeyW => dir + camera.forward,
                        KeyCode::KeyS => dir - camera.forward,
                        KeyCode::KeyD => dir + camera.right,
                        KeyCode::KeyA => dir - camera.right,
                        _ => dir,
                    });
                const CAMERA_SPEED: f32 = 4.0f32;
                if camera_update.length() > 1e-4 {
                    let camera_update = CAMERA_SPEED * self.delta_time * camera_update.norm();
                    camera.update_position(camera_update);
                }
            }
        }
    }

    fn device_event(
        &mut self,
        event_loop: &ActiveEventLoop,
        _device_id: winit::event::DeviceId,
        event: winit::event::DeviceEvent,
    ) {
        let camera = self.camera.as_mut().unwrap();
        let window = self.window.as_mut().unwrap();
        if let CursorState::Lock = self.cursor_state {
            let _ = window.set_cursor_position(LogicalPosition::new(400, 300));
        }
        match event {
            DeviceEvent::MouseMotion { delta } => {
                if let CursorState::Lock = self.cursor_state {
                    const MOUSE_SENSITIVITY: f64 = 0.5;
                    let delta = (delta.0 * MOUSE_SENSITIVITY, delta.1 * MOUSE_SENSITIVITY);
                    println!("X:{}, Y:{}", delta.0, delta.1);
                    camera.update_rotation(delta);
                }
            }
            winit::event::DeviceEvent::Key(RawKeyEvent {
                physical_key: PhysicalKey::Code(code),
                state: ElementState::Pressed,
            }) => match code {
                KeyCode::KeyR => {
                    camera.set_position(Vector3::new(2.0, 2.0, 2.0));
                    camera.set_forward(-Vector3::new(2.0, 2.0, 2.0));
                }
                KeyCode::KeyQ => event_loop.exit(),
                KeyCode::KeyG => {
                    self.cursor_state = match self.cursor_state {
                        CursorState::Free => {
                            let _ = window.set_cursor_grab(winit::window::CursorGrabMode::Confined);
                            window.set_cursor_visible(false);
                            CursorState::Lock
                        }
                        CursorState::Lock => {
                            let _ = window.set_cursor_grab(winit::window::CursorGrabMode::None);
                            window.set_cursor_visible(true);
                            CursorState::Free
                        }
                    }
                }
                _ => (),
            },
            _ => (),
        }
    }

    fn window_event(
        &mut self,
        event_loop: &ActiveEventLoop,
        _window_id: winit::window::WindowId,
        event: WindowEvent,
    ) {
        match event {
            WindowEvent::KeyboardInput {
                event:
                    KeyEvent {
                        physical_key: PhysicalKey::Code(code),
                        state,
                        repeat: false,
                        ..
                    },
                ..
            } => {
                *self.key_states.entry(code).or_insert(state) = state;
            }
            WindowEvent::CloseRequested => {
                event_loop.exit();
            }
            WindowEvent::RedrawRequested => {
                let renderer = self.renderer.as_mut().unwrap();
                let _ = renderer.begin_frame(&self.camera.as_ref().unwrap().get_camera_matrix());
                renderer.draw_mesh(*self.meshes.get(&"triangle").unwrap(), &self.model);
                let _ = renderer.end_frame();
                self.window.as_ref().unwrap().request_redraw();
            }
            _ => (),
        }
    }
}

fn main() -> Result<(), Box<dyn Error>> {
    let event_loop = EventLoop::new()?;
    event_loop.set_control_flow(event_loop::ControlFlow::Poll);
    let mut app = Application::new()?;
    event_loop.run_app(&mut app)?;
    Ok(())
}
