use core::f32;
use pathfinder::{
    camera::Camera,
    debug::{BufferHandle, LineList, MeshHandle, Renderer, TriangleList},
    math::{
        matrix::Matrix4,
        vector::{Vector3, Vector4},
    },
    mesh,
    path::{DisallowInterior, Grid, Octtree, PathfindingPath},
    scene::Scene,
};
use std::{collections::HashMap, error::Error, path::Path, time::Instant};
use winit::{
    application::ApplicationHandler,
    dpi::{LogicalPosition, LogicalSize},
    event::{DeviceEvent, ElementState, KeyEvent, RawKeyEvent, WindowEvent},
    event_loop::{self, ActiveEventLoop, EventLoop},
    keyboard::{KeyCode, PhysicalKey},
    window::{Window, WindowAttributes, WindowButtons},
};

const GRID_TYPES: &'static [&'static str] = &["grid", "grid_neg", "octtree"];
const SHADER_TYPES: &'static [&'static str] = &["none", "wire", "fill"];

const SCENE_PATH: &'static str = &"../../../frontend/server/models/Duplex_boxes.json";
const PATH_PATH: Option<&'static str> = None;

// const PATH_PATH: Option<&'static str> = Some(&"../../../backend/pathfinder/4.json");
// const SCENE_PATH: &'static str = &"../../../frontend/server/models/BUILDING_boxes.json";

const LINE_WIDTH: f32 = 2.0;
const PIPE_WIDTH: f32 = 4.0;
const CAMERA_SPEED: f32 = 12.0f32;
const MOUSE_SENSITIVITY: f64 = 0.5;
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
    instances: HashMap<&'static str, BufferHandle>,
    camera: Option<Camera>,
    last_frame_time: Option<Instant>,
    delta_time: f32,
    model: Matrix4,
    cursor_state: CursorState,
    key_states: HashMap<KeyCode, ElementState>,
    selected_grid: usize,
    selected_shader: usize,
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
                        .with_enabled_buttons(WindowButtons::CLOSE | WindowButtons::MINIMIZE)
                        .with_maximized(true)
                        .with_inner_size(LogicalSize::new(1920, 1080))
                        .with_title("Pathfinder"),
                )
                .unwrap(),
        );
        self.renderer = Some(Renderer::new(self.window.as_ref().unwrap()).unwrap());
        let mut meshes = vec![mesh::cube_solid(), mesh::cube_wire()];
        let renderer = self.renderer.as_mut().unwrap();
        if let Some(path_str) = PATH_PATH {
            let path = PathfindingPath::load(&Path::new(path_str)).unwrap();
            let path_mesh = path.into();
            meshes.push(path_mesh);
        }
        let mesh_handles = renderer.load_meshes(&meshes).unwrap();
        self.meshes.insert("fill", mesh_handles[0]);
        self.meshes.insert("wire", mesh_handles[1]);
        if let Some(_) = PATH_PATH {
            self.meshes.insert("path", mesh_handles[2]);
        }
        let scene = Scene::load(&Path::new(SCENE_PATH)).unwrap();
        let octree = Octtree::build::<DisallowInterior>(&scene, 0, 6);
        let grid = Grid::build::<DisallowInterior>(&scene, 1.0);
        let grid_neg = Grid::build::<DisallowInterior>(&scene, 0.5);
        let scene_instances = renderer
            .load_instance_buffer(&scene.get_bounds_instances())
            .unwrap();
        let octree_instances = renderer
            .load_instance_buffer(&octree.get_bounds_instances())
            .unwrap();
        let grid_instances = renderer
            .load_instance_buffer(&grid.get_bounds_instances())
            .unwrap();
        let grid_neg_instances = renderer
            .load_instance_buffer(&grid_neg.get_bounds_instances())
            .unwrap();
        self.instances.insert("scene", scene_instances);
        self.instances.insert("octtree", octree_instances);
        self.instances.insert("grid", grid_instances);
        self.instances.insert("grid_neg", grid_neg_instances);
        let proj = Matrix4::perspective(std::f32::consts::FRAC_PI_3, 1080.0 / 1920.0, 1e-3, 1e3);
        let mut camera = Camera::new(proj);
        // camera.set_position(Vector3::new(2.0, 2.0, 2.0));
        // camera.set_forward(-Vector3::new(2.0, 2.0, 2.0));
        camera.set_position(scene.bounds.max + scene.bounds.dimensions() / 2.0);
        camera.set_forward(-(scene.bounds.max - scene.bounds.min));
        self.camera = Some(camera);
        self.selected_grid = 0;
        self.selected_shader = 0;
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
                    let delta = (delta.0 * MOUSE_SENSITIVITY, delta.1 * MOUSE_SENSITIVITY);
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
                KeyCode::ArrowLeft => {
                    self.selected_shader = (self.selected_shader + 1) % SHADER_TYPES.len()
                }
                KeyCode::ArrowRight => {
                    self.selected_grid = (self.selected_grid + 1) % GRID_TYPES.len()
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
        let camera = self.camera.as_ref().unwrap();
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
                let _ = renderer.begin_frame(&camera.get_camera_matrix());
                renderer.draw_mesh_instanced::<LineList>(
                    *self.meshes.get(&"wire").unwrap(),
                    *self.instances.get(&"scene").unwrap(),
                    Vector4::new(1.0, 0.0, 0.0, 1.0),
                    LINE_WIDTH,
                );
                match SHADER_TYPES[self.selected_shader] {
                    "wire" => renderer.draw_mesh_instanced::<LineList>(
                        *self.meshes.get(&"wire").unwrap(),
                        *self.instances.get(GRID_TYPES[self.selected_grid]).unwrap(),
                        Vector4::new(0.1, 0.1, 0.0, 0.5),
                        LINE_WIDTH,
                    ),
                    "fill" => renderer.draw_mesh_instanced::<TriangleList>(
                        *self.meshes.get(&"fill").unwrap(),
                        *self.instances.get(GRID_TYPES[self.selected_grid]).unwrap(),
                        Vector4::new(0.1, 0.1, 0.0, 0.5),
                        1.0,
                    ),
                    _ => (),
                }
                if let Some(_) = PATH_PATH {
                    let _ = renderer.draw_mesh::<LineList>(
                        *self.meshes.get(&"path").unwrap(),
                        &Matrix4::default(),
                        PIPE_WIDTH,
                    );
                }
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
