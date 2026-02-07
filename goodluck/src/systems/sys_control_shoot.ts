import {mat4_get_forward, mat4_get_translation} from "../../lib/mat4.js";
import {Vec3} from "../../lib/math.js";
import {instantiate} from "../../lib/game.js";
import {blueprint_bullet} from "../blueprints/blu_bullet.js";
import {CameraChild} from "../blueprints/blu_camera_follow.js";
import {set_position, set_scale} from "../components/com_transform.js";
import {Game} from "../game.js";

const BULLET_SPEED = 120;

export function sys_control_shoot(game: Game, delta: number) {
    if (game.InputDelta["Mouse0"] !== 1) {
        return;
    }

    let cam_transform = game.World.Transform[CameraChild];
    let world_matrix = cam_transform.World;

    // mat4_get_forward returns +Z axis; camera looks along -Z.
    let forward: Vec3 = [0, 0, 0];
    mat4_get_forward(forward, world_matrix);
    forward[0] = -forward[0];
    forward[1] = -forward[1];
    forward[2] = -forward[2];

    let position: Vec3 = [0, 0, 0];
    mat4_get_translation(position, world_matrix);

    // Spawn slightly in front and below camera.
    position[0] += forward[0] * 1.5;
    position[1] += forward[1] * 1.5 - 0.3;
    position[2] += forward[2] * 1.5;

    let bullet = instantiate(game, blueprint_bullet(game));
    set_position(position[0], position[1], position[2])(game, bullet);
    set_scale(0.15, 0.15, 0.15)(game, bullet);

    let rigid_body = game.World.RigidBody[bullet];
    rigid_body.VelocityLinear[0] = forward[0] * BULLET_SPEED;
    rigid_body.VelocityLinear[1] = forward[1] * BULLET_SPEED;
    rigid_body.VelocityLinear[2] = forward[2] * BULLET_SPEED;
}
