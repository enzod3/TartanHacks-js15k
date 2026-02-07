import {mat4_get_forward, mat4_get_translation} from "../../lib/mat4.js";
import {Vec3} from "../../lib/math.js";
import {instantiate} from "../../lib/game.js";
import {blueprint_bullet} from "../blueprints/blu_bullet.js";
import {CameraChild} from "../blueprints/blu_camera_follow.js";
import {CameraAnchor} from "../blueprints/blu_player.js";
import {set_position, set_scale} from "../components/com_transform.js";
import {CameraMode, Game} from "../game.js";

const BULLET_SPEED = 80;

export function sys_control_shoot(game: Game, delta: number) {
    if (game.InputDelta["Mouse0"] !== 1) {
        return;
    }

    let forward: Vec3 = [0, 0, 0];
    let position: Vec3 = [0, 0, 0];

    if (game.CameraMode === CameraMode.FirstPerson) {
        // First person: shoot where camera looks.
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
        // Top-down: shoot in the player's facing direction (horizontal).
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

    let bullet = instantiate(game, blueprint_bullet(game));
    set_position(position[0], position[1], position[2])(game, bullet);
    set_scale(0.15, 0.15, 0.15)(game, bullet);

    let rigid_body = game.World.RigidBody[bullet];
    rigid_body.VelocityLinear[0] = forward[0] * BULLET_SPEED;
    rigid_body.VelocityLinear[1] = forward[1] * BULLET_SPEED;
    rigid_body.VelocityLinear[2] = forward[2] * BULLET_SPEED;
}
