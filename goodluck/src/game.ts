import {Quat, Vec3} from "../lib/math.js";
import {sys_control_touch_move} from "./systems/sys_control_touch_move.js";
import {Entity} from "../lib/world.js";
import {Game3D} from "../lib/game.js";
import {MAX_FORWARD_LIGHTS} from "../materials/light.js";
import {mat_forward_colored_phong} from "../materials/mat_forward_colored_phong.js";
import {mat_forward_textured_phong} from "../materials/mat_forward_textured_phong.js";
import {mesh_cube} from "../meshes/cube.js";
import {mesh_plane} from "../meshes/plane.js";
import {mesh_island} from "./meshes/mesh_island.js";
import {tex_ground} from "./textures/tex_ground.js";
import {tex_rock} from "./textures/tex_rock.js";
import {tex_water} from "./textures/tex_water.js";
import {tex_wood} from "./textures/tex_wood.js";
import {tex_zombie} from "./textures/tex_zombie.js";
import {sys_camera} from "./systems/sys_camera.js";
import {sys_camera_toggle} from "./systems/sys_camera_toggle.js";
import {sys_control_shoot} from "./systems/sys_control_shoot.js";
import {sys_damage} from "./systems/sys_damage.js";
import {sys_lifespan} from "./systems/sys_lifespan.js";
import {sys_collide} from "./systems/sys_collide.js";
import {sys_control_jump} from "./systems/sys_control_jump.js";
//import {sys_control_joystick} from "./systems/sys_control_joystick.js";
import {sys_control_keyboard} from "./systems/sys_control_keyboard.js";
import {sys_control_mouse_move} from "./systems/sys_control_mouse_move.js";
import {sys_light} from "./systems/sys_light.js";
import {sys_mimic} from "./systems/sys_mimic.js";
import {sys_move} from "./systems/sys_move.js";
import {sys_physics_integrate} from "./systems/sys_physics_integrate.js";
import {sys_physics_kinematic} from "./systems/sys_physics_kinematic.js";
import {sys_physics_resolve} from "./systems/sys_physics_resolve.js";
import {sys_render_forward} from "./systems/sys_render_forward.js";
import {sys_resize} from "./systems/sys_resize.js";
import {sys_transform} from "./systems/sys_transform.js";
import {sys_ui} from "./systems/sys_ui.js";
import {sys_enemy_ai} from "./systems/sys_enemy_ai.js";
import {sys_enemy_spawn} from "./systems/sys_enemy_spawn.js";
import {sys_debug_lines} from "./systems/sys_debug_lines.js";
import {World} from "./world.js";
import {sys_boundary} from "./systems/sys_boundary.js";
import {sys_powerup} from "./systems/sys_powerup.js";
import {sys_upgrade_stations} from "./systems/sys_upgrade_stations.js";
import {play_music} from "./sound.js";
import {SONG} from "./music.js";

export class Game extends Game3D {
    World = new World();

    MaterialColoredShaded = mat_forward_colored_phong(this.Gl);
    MaterialTexturedShaded = mat_forward_textured_phong(this.Gl);

    MeshCube = mesh_cube(this.Gl);
    MeshPlane = mesh_plane(this.Gl);
    MeshIsland = mesh_island(this.Gl);

    TexGround = tex_ground(this.Gl);
    TexRock = tex_rock(this.Gl);
    TexWater = tex_water(this.Gl);
    TexWood = tex_wood(this.Gl);
    TexZombie = tex_zombie(this.Gl);

    LightPositions = new Float32Array(4 * MAX_FORWARD_LIGHTS);
    LightDetails = new Float32Array(4 * MAX_FORWARD_LIGHTS);

    CameraMode: CameraMode = CameraMode.FirstPerson;
    CameraEntity: Entity = 0;
    CameraTransition = 0;
    CameraTargetPos: Vec3 = [0, 1.8, 0];
    CameraTargetRot: Quat = [0, 1, 0, 0];
    CameraFromPos: Vec3 = [0, 1.8, 0];
    CameraFromRot: Quat = [0, 1, 0, 0];

    // JoystickX = 0;
    // JoystickY = 0;

    PlayerHealth = 10;
    PlayerMaxHealth = 10;

    Wave = 1;
    WaveState: WaveState = WaveState.Spawning;
    WaveEnemiesTotal = 5;
    WaveEnemiesSpawned = 0;
    Weapon: WeaponType = WeaponType.Infantry;
    BulletDamage = 1;
    ShotgunPelletDamage = 0.8;
    ShootCooldown = 0;
    Paused = false;
    ThirdPersonTimer = 0;
    PowerupEntity: Entity = -1;
    MusicStarted = false;

    MaxWaves = 4;
    TotalKills = 0;
    UpgradesPicked: string[] = [];
    UpgradeStations: Entity[] = [];
    RockEntity: Entity = -1;
    FireRateMultiplier = 1;
    UpgradeLabels: string[] = [];

    override FrameUpdate(delta: number) {
        if (!this.Paused) {
            // Collisions and physics.
            sys_physics_integrate(this, delta);
            sys_transform(this, delta);
            sys_physics_kinematic(this, delta);
            sys_collide(this, delta);
            sys_physics_resolve(this, delta);
            sys_transform(this, delta);

            // Player input.
            sys_control_keyboard(this, delta);
            // sys_control_joystick(this, delta);
            sys_control_touch_move(this, delta);
            sys_control_mouse_move(this, delta);
            sys_control_jump(this, delta);
            sys_camera_toggle(this, delta);

            let upgrading_or_evac = this.WaveState === WaveState.Upgrading || this.WaveState === WaveState.Evac;

            if (!upgrading_or_evac) {
                sys_control_shoot(this, delta);
            }

            // Game logic — skip enemy AI/spawn during upgrade/evac.
            if (!upgrading_or_evac) {
                sys_enemy_ai(this, delta);
                sys_enemy_spawn(this, delta);
                sys_damage(this, delta);
            }
            sys_lifespan(this, delta);
            sys_move(this, delta);
            sys_mimic(this, delta);
            sys_transform(this, delta);
            sys_boundary(this, delta);
            sys_powerup(this, delta);
            sys_upgrade_stations(this, delta);
        }

        // Start music on first click/tap (AudioContext needs user gesture).
        if (!this.MusicStarted && (this.InputDelta["Mouse0"] === 1 || this.InputDelta["Touch0"] === 1)) {
            this.MusicStarted = true;
            play_music(SONG);
        }

        // Camera (after final transforms so there's no 1-frame lag).
        sys_resize(this, delta);
        sys_camera(this, delta);

        // Rendering.
        sys_light(this, delta);
        sys_render_forward(this, delta);
        //sys_debug_lines(this, delta);
        sys_ui(this, delta);
    }
}

export const enum Layer {
    None = 0,
    Player = 1,
    Terrain = 2,
    Enemy = 4,
    Bullet = 8,
    Ground = 16,
    Pickup = 32,
}

export const enum CameraMode {
    TopDown,
    FirstPerson,
}

export const enum WaveState {
    Spawning,
    Fighting,
    Upgrading,
    Evac,
    Won,
}

export const enum WeaponType {
    Infantry,
    Shotgun,
    Thrower,
}
