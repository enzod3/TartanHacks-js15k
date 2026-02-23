import {quat_get_pitch, quat_multiply} from "../../lib/quat.js";
import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Move | Has.ControlPlayer;

export function sys_control_keyboard(game: Game, delta: number) {
    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) === QUERY) {
            update(game, i);
        }
    }
}

function update(game: Game, entity: Entity) {
    let control = game.World.ControlPlayer[entity];

    if (control.Move) {
        let move = game.World.Move[entity];
        if (game.InputState["KeyW"]) {
            move.Direction[2] += 1;
        }
        if (game.InputState["KeyA"]) {
            move.Direction[0] += 1;
        }
        if (game.InputState["KeyS"]) {
            move.Direction[2] -= 1;
        }
        if (game.InputState["KeyD"]) {
            move.Direction[0] -= 1;
        }
    }

    if (control.Yaw) {
        let move = game.World.Move[entity];
        if (game.InputState["ArrowLeft"]) {
            quat_multiply(move.LocalRotation, move.LocalRotation, [0, 1, 0, 0]);
        }
        if (game.InputState["ArrowRight"]) {
            quat_multiply(move.LocalRotation, move.LocalRotation, [0, -1, 0, 0]);
        }
    }

    if (control.Pitch) {
        let transform = game.World.Transform[entity];
        let move = game.World.Move[entity];
        let current_pitch = quat_get_pitch(transform.Rotation);
        if (game.InputState["ArrowUp"] && current_pitch > control.MinPitch) {
            quat_multiply(move.SelfRotation, move.SelfRotation, [-1, 0, 0, 0]);
        }
        if (game.InputState["ArrowDown"] && current_pitch < control.MaxPitch) {
            quat_multiply(move.SelfRotation, move.SelfRotation, [1, 0, 0, 0]);
        }
    }
}
