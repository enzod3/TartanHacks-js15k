import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Move | Has.ControlPlayer;

export function sys_control_joystick(game: Game, delta: number) {
    if (game.JoystickX === 0 && game.JoystickY === 0) {
        return;
    }

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
        // JoystickX: positive = right, Direction[0]: negative = right.
        move.Direction[0] -= game.JoystickX;
        // JoystickY: negative = up/forward, Direction[2]: positive = forward.
        move.Direction[2] -= game.JoystickY;
    }
}
