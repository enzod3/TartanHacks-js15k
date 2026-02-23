import {Action} from "../actions.js";
import {collide} from "../components/com_collide.js";
import {lifespan} from "../components/com_lifespan.js";
import {render_colored_shaded} from "../components/com_render.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {transform} from "../components/com_transform.js";
import {Game, Layer} from "../game.js";

export function blueprint_grenade(game: Game) {
    return [
        transform(),
        collide(true, Layer.None, Layer.Terrain | Layer.Ground, [2, 2, 2]),
        rigid_body(RigidKind.Dynamic),
        render_colored_shaded(
            game.MaterialColoredShaded,
            game.MeshCube,
            [0.3, 0.6, 0.2, 1],
            8,
            0.6,
        ),
        lifespan(1, Action.GrenadeExplode),
    ];
}
