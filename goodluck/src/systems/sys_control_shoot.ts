import {mat4_get_forward, mat4_get_translation} from "../../lib/mat4.js";
import {Vec3} from "../../lib/math.js";
import {instantiate} from "../../lib/game.js";
import {blueprint_bullet} from "../blueprints/blu_bullet.js";
import {CameraChild} from "../blueprints/blu_camera_follow.js";
import {CameraAnchor} from "../blueprints/blu_player.js";
import {set_position, set_scale} from "../components/com_transform.js";
import {CameraMode, Game, WeaponType} from "../game.js";
import {play_sound} from "../sound.js";

const BULLET_SPEED = 80;
const INFANTRY_COOLDOWN = 0.15;
const SHOTGUN_COOLDOWN = 0.6;
const SHOTGUN_SPREAD = Math.PI / 20; // ~13 degrees half-spread
const SHOTGUN_JITTER = 0.12;
// Diamond/cross: 2-4-4-2 rows top to bottom.
// Each entry is [h_fraction, v_fraction] from -1 to 1.
const CROSS_PATTERN: [number, number][] = [
    // Row 1 (top): 2 pellets.
    [-0.33, 1], [0.33, 1],
    // Row 2: 4 pellets.
    [-1, 0.33], [-0.33, 0.33], [0.33, 0.33], [1, 0.33],
    // Row 3: 4 pellets.
    [-1, -0.33], [-0.33, -0.33], [0.33, -0.33], [1, -0.33],
    // Row 4 (bottom): 2 pellets.
    [-0.33, -1], [0.33, -1],
];

export function sys_control_shoot(game: Game, delta: number) {
    game.ShootCooldown -= delta;

    if (game.InputDelta["Mouse0"] !== 1 && !game.InputState["Mouse0"]) {
        return;
    }

    if (game.ShootCooldown > 0) {
        return;
    }

    let forward: Vec3 = [0, 0, 0];
    let position: Vec3 = [0, 0, 0];

    if (game.CameraMode === CameraMode.FirstPerson) {
        let cam_world = game.World.Transform[CameraChild].World;
        mat4_get_forward(forward, cam_world);
        forward[0] = -forward[0];
        forward[1] = -forward[1];
        forward[2] = -forward[2];
        mat4_get_translation(position, cam_world);
        position[0] += forward[0] * 1.5;
        position[1] += forward[1] * 1.5 - 0.3;
        position[2] += forward[2] * 1.5;
    } else {
        let player_parent = game.World.Transform[CameraAnchor].Parent!;
        let player_world = game.World.Transform[player_parent].World;
        mat4_get_forward(forward, player_world);
        forward[1] = 0;
        let len = Math.sqrt(forward[0] * forward[0] + forward[2] * forward[2]);
        if (len > 0) {
            forward[0] /= len;
            forward[2] /= len;
        }
        mat4_get_translation(position, player_world);
        position[1] += 0.7;
        position[0] += forward[0] * 1.0;
        position[2] += forward[2] * 1.0;
    }

    if (game.Weapon === WeaponType.Shotgun) {
        play_sound(400, 0.15);
        game.ShootCooldown = SHOTGUN_COOLDOWN;

        // Right and up vectors for offsetting pellets in a cone.
        let right: Vec3 = [forward[2], 0, -forward[0]];
        let rlen = Math.sqrt(right[0] * right[0] + right[2] * right[2]);
        if (rlen > 0) {
            right[0] /= rlen;
            right[2] /= rlen;
        }
        let up: Vec3 = [
            right[1] * forward[2] - right[2] * forward[1],
            right[2] * forward[0] - right[0] * forward[2],
            right[0] * forward[1] - right[1] * forward[0],
        ];

        for (let i = 0; i < CROSS_PATTERN.length; i++) {
            let [h_frac, v_frac] = CROSS_PATTERN[i];
            let h_off = h_frac * SHOTGUN_SPREAD + (Math.random() - 0.5) * SHOTGUN_JITTER;
            let v_off = v_frac * SHOTGUN_SPREAD + (Math.random() - 0.5) * SHOTGUN_JITTER;

            let dx = forward[0] + right[0] * h_off + up[0] * v_off;
            let dy = forward[1] + right[1] * h_off + up[1] * v_off;
            let dz = forward[2] + right[2] * h_off + up[2] * v_off;

            let len = Math.sqrt(dx * dx + dy * dy + dz * dz);
            dx /= len;
            dy /= len;
            dz /= len;

            let bullet = instantiate(game, blueprint_bullet(game));
            set_position(position[0], position[1], position[2])(game, bullet);
            set_scale(0.08, 0.08, 0.08)(game, bullet);

            let rigid_body = game.World.RigidBody[bullet];
            rigid_body.VelocityLinear[0] = dx * BULLET_SPEED;
            rigid_body.VelocityLinear[1] = dy * BULLET_SPEED;
            rigid_body.VelocityLinear[2] = dz * BULLET_SPEED;
        }
    } else {
        play_sound(800, 0.1);
        game.ShootCooldown = INFANTRY_COOLDOWN;

        let bullet = instantiate(game, blueprint_bullet(game));
        set_position(position[0], position[1], position[2])(game, bullet);
        set_scale(0.15, 0.15, 0.15)(game, bullet);

        let rigid_body = game.World.RigidBody[bullet];
        rigid_body.VelocityLinear[0] = forward[0] * BULLET_SPEED;
        rigid_body.VelocityLinear[1] = forward[1] * BULLET_SPEED;
        rigid_body.VelocityLinear[2] = forward[2] * BULLET_SPEED;
    }
}
