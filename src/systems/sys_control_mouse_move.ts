import {DEG_TO_RAD, Quat, Vec3} from "../../lib/math.js";
import {clamp} from "../../lib/number.js";
import {quat_from_axis, quat_get_pitch, quat_multiply} from "../../lib/quat.js";
import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Transform | Has.Move | Has.ControlPlayer;
const AXIS_X: Vec3 = [1, 0, 0];
const AXIS_Y: Vec3 = [0, 1, 0];

export function sys_control_mouse_move(game: Game, delta: number) {
    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) === QUERY) {
            update(game, i);
        }
    }
}

const rotation: Quat = [0, 0, 0, 0];

function update(game: Game, entity: Entity) {
    let control = game.World.ControlPlayer[entity];
    let transform = game.World.Transform[entity];

    if (control.Yaw && game.InputDelta.MouseX) {
        let amount = game.InputDelta.MouseX * control.Yaw * DEG_TO_RAD;
        quat_from_axis(rotation, AXIS_Y, -amount);
        quat_multiply(transform.Rotation, rotation, transform.Rotation);
        game.World.Signature[entity] |= Has.Dirty;
    }

    if (control.Pitch && game.InputDelta.MouseY) {
        let current_pitch = quat_get_pitch(transform.Rotation);
        let min_amount = control.MinPitch - current_pitch;
        let max_amount = control.MaxPitch - current_pitch;
        let amount = clamp(min_amount, max_amount, game.InputDelta.MouseY * control.Pitch);
        quat_from_axis(rotation, AXIS_X, amount * DEG_TO_RAD);
        quat_multiply(transform.Rotation, transform.Rotation, rotation);
        game.World.Signature[entity] |= Has.Dirty;
    }
}
