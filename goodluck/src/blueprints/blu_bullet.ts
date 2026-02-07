import {collide} from "../components/com_collide.js";
import {lifespan} from "../components/com_lifespan.js";
import {render_colored_shaded} from "../components/com_render.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {transform} from "../components/com_transform.js";
import {Game, Layer} from "../game.js";

export function blueprint_bullet(game: Game) {
    return [
        transform(),
        collide(true, Layer.Bullet, Layer.Terrain | Layer.Enemy),
        rigid_body(RigidKind.Dynamic),
        render_colored_shaded(
            game.MaterialColoredShaded,
            game.MeshCube,
            [1.0, 0.9, 0.3, 1],
            32,
            1.0,
        ),
        lifespan(3),
    ];
}
