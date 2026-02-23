# Goodluck Boilerplate - Space Budget Reference

esbuild tree-shakes unused imports automatically. To remove something, stop importing it.
The main levers are: system calls in `game.ts`, component arrays in `world.ts`, and blueprint/scene imports.

## Components (`src/components/`)

| Component | Status | Notes |
|-----------|--------|-------|
| com_animate | REMOVABLE | Animation keyframes. Re-add for enemy death anims |
| com_audio_listener | REMOVABLE | Positional audio listener |
| com_audio_source | REMOVABLE | Positional audio source |
| com_camera | REQUIRED | Camera projection |
| com_callback | REQUIRED | Entity creation callbacks (used for CameraAnchor) |
| com_children | REQUIRED | Entity hierarchy |
| com_collide | REQUIRED | Collision detection |
| com_control_always | OPTIONAL | AI control. Re-add for enemies |
| com_control_player | REQUIRED | Player input control |
| com_disable | REMOVABLE | Disable entity rendering |
| com_draw | REMOVABLE | 2D canvas overlay drawing |
| com_emit_particles | REMOVABLE | Particle emitter. Re-add for gun FX |
| com_lifespan | REMOVABLE | Timed entity destruction. Re-add for bullets |
| com_light | REQUIRED | Point and directional lights |
| com_mimic | REQUIRED | Camera follow behavior |
| com_move | REQUIRED | Entity movement |
| com_named | REMOVABLE | Named entity lookup (replaced by direct refs) |
| com_render | REQUIRED | 3D mesh rendering |
| com_rigid_body | REQUIRED | Physics rigid body |
| com_shake | REMOVABLE | Screen/entity shake effect |
| com_spawn | REMOVABLE | Entity spawner. Re-add for enemy spawners |
| com_task | REMOVABLE | Timed task execution |
| com_toggle | REMOVABLE | Component toggling |
| com_transform | REQUIRED | Position/rotation/scale |
| com_trigger | REMOVABLE | Collision trigger actions. Re-add for enemies |

## Systems (`src/systems/`)

| System | Status | Notes |
|--------|--------|-------|
| sys_animate | REMOVABLE | Processes animations |
| sys_audio_listener | REMOVABLE | Audio listener positioning |
| sys_audio_source | REMOVABLE | Audio source playback |
| sys_camera | REQUIRED | Camera matrix computation |
| sys_camera_toggle | REQUIRED | Camera mode toggle (V key) |
| sys_collide | REQUIRED | Collision detection |
| sys_control_always | OPTIONAL | AI control. Re-add for enemies |
| sys_control_jump | REQUIRED | Jump input handling |
| sys_control_keyboard | REQUIRED | WASD movement input |
| sys_control_mouse_move | REQUIRED | Mouse look input |
| sys_control_touch_move | REMOVABLE | Touch screen controls |
| sys_control_xbox | REMOVABLE | Xbox controller input |
| sys_debug | REMOVABLE | Debug wireframe overlay |
| sys_draw | REMOVABLE | 2D canvas drawing |
| sys_light | REQUIRED | Light uniform computation |
| sys_lifespan | REMOVABLE | Entity lifespan. Re-add for bullets |
| sys_mimic | REQUIRED | Entity following |
| sys_move | REQUIRED | Entity movement |
| sys_particles | REMOVABLE | Particle system. Re-add for gun FX |
| sys_physics_integrate | REQUIRED | Physics integration |
| sys_physics_kinematic | REQUIRED | Kinematic body updates |
| sys_physics_resolve | REQUIRED | Physics collision resolution |
| sys_poll | REMOVABLE | Event polling (removed - no triggers/tasks) |
| sys_render_forward | REQUIRED | Forward rendering pipeline |
| sys_resize | REQUIRED | Viewport resize handling |
| sys_shake | REMOVABLE | Shake effect processing |
| sys_spawn | REMOVABLE | Entity spawning. Re-add for enemy spawners |
| sys_toggle | REMOVABLE | Component toggling |
| sys_transform | REQUIRED | Transform matrix computation |
| sys_trigger | REMOVABLE | Collision trigger. Re-add for enemies |
| sys_ui | REQUIRED | UI rendering |

## Materials (`materials/`)

| Material | Status | Notes |
|----------|--------|-------|
| mat_forward_colored_phong | REQUIRED | Phong shading (player, ground) |
| mat_forward_colored_unlit | REMOVABLE | Wireframe/unlit (was debug) |
| mat_forward_colored_flat | OPTIONAL | Flat shading alternative |
| mat_forward_colored_gouraud | OPTIONAL | Gouraud shading alternative |
| mat_forward_colored_points | REMOVABLE | Point rendering |
| mat_forward_colored_shadows | OPTIONAL | Shadow mapping |
| mat_forward_particles_colored | REMOVABLE | Colored particles. Re-add for gun FX |
| mat_forward_particles_textured | REMOVABLE | Textured particles |
| mat_forward_textured_* | REMOVABLE | Textured mesh rendering |
| mat_forward_mapped_shaded | REMOVABLE | Normal-mapped shading |
| mat_forward_depth | REMOVABLE | Depth-only rendering |
| mat_deferred_* | REMOVABLE | Deferred rendering pipeline |
| mat_postprocess_* | OPTIONAL | Post-processing effects |
| mat_render2d | REMOVABLE | 2D sprite rendering |

## Meshes (`meshes/`)

| Mesh | Status | Notes |
|------|--------|-------|
| cube | REQUIRED | Player body, ground, obstacles |
| plane | OPTIONAL | Flat surfaces |
| quad | REMOVABLE | Screen-space quad |
| icosphere_flat | OPTIONAL | Sphere with flat shading |
| icosphere_smooth | OPTIONAL | Sphere with smooth shading |
| monkey_flat | REMOVABLE | Suzanne debug mesh |
| monkey_smooth | REMOVABLE | Suzanne debug mesh |
| ludek | REMOVABLE | Humanoid mesh |
| hand | REMOVABLE | Hand mesh |
| terrain | OPTIONAL | Terrain heightmap mesh |
