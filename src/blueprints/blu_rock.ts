import {collide} from "../components/com_collide.js";
import {lifespan} from "../components/com_lifespan.js";
import {render_textured_shaded} from "../components/com_render.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {transform} from "../components/com_transform.js";
import {Game, Layer} from "../game.js";

export function blueprint_rock(game: Game) {
    return [
        transform(),
        collide(true, Layer.Bullet, Layer.Terrain | Layer.Enemy | Layer.Ground, [2, 2, 2]),
        rigid_body(RigidKind.Dynamic),
        render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexRock, 4, 0.2),
        lifespan(5),
    ];
}
