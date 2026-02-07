import {Game} from "../game.js";
import {Has} from "../world.js";

const ISLAND_RADIUS = 38; // Matches your 120-scale island mesh
const FALL_SPEED = 0.5;   // Units per frame

export function sys_boundary(game: Game, delta: number) {
    for (let i = 0; i < game.World.Signature.length; i++) {
        // We look for the player specifically
        if ((game.World.Signature[i] & (Has.Transform | Has.ControlPlayer)) === (Has.Transform | Has.ControlPlayer)) {
            let tr = game.World.Transform[i];
            
            // 1. Calculate horizontal distance from center
            let x = tr.Translation[0];
            let z = tr.Translation[2];
            let distance = Math.sqrt(x * x + z * z);

            // 2. If out of bounds OR already falling
            if (distance > ISLAND_RADIUS ) {
                
                // STRIP PHYSICS: This stops the floor from pushing you back up
                game.World.Signature[i] &= ~(Has.Collide | Has.RigidBody);
                
                // DIRECT MOVE: Manually sink the Y position
                tr.Translation[1] -= FALL_SPEED;

                // UPDATE RENDERER: Tell the engine the position has changed
                game.World.Signature[i] |= Has.Dirty;
            }
        }
    }
}
