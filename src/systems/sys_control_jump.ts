import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.ControlPlayer | Has.RigidBody;

export function sys_control_jump(game: Game, delta: number) {
    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) === QUERY) {
            update(game, i);
        }
    }
}

function update(game: Game, entity: Entity) {
    let control = game.World.ControlPlayer[entity];
    let rigid_body = game.World.RigidBody[entity];

    if (control.Move) {
        if (game.InputState["Space"]) {
            if (rigid_body.IsGrounded) {
                rigid_body.Acceleration[1] = 300;
            }
        }
    }
}
