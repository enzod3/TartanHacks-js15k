import {children} from "../components/com_children.js";
import {collide} from "../components/com_collide.js";
import {render_colored_shaded} from "../components/com_render.js";
import {render_textured_shaded} from "../components/com_render.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {transform} from "../components/com_transform.js";
import {Game, Layer} from "../game.js";

export function blueprint_evac(game: Game) {
    return [
        transform(),
        collide(true, Layer.Pickup, Layer.Player, [3, 8, 3]),
        rigid_body(RigidKind.Kinematic),
        children(
            // Vertical pole.
            [
                transform([0, 2, 0], [0, 0, 0, 1], [0.15, 4, 0.15]),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexWood, 4, 0.1),
            ],
            // Rung 1.
            [
                transform([0, 1.0, 0], [0, 0, 0, 1], [0.8, 0.08, 0.15]),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexWood, 4, 0.1),
            ],
            // Rung 2.
            [
                transform([0, 1.7, 0], [0, 0, 0, 1], [0.8, 0.08, 0.15]),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexWood, 4, 0.1),
            ],
            // Rung 3.
            [
                transform([0, 2.4, 0], [0, 0, 0, 1], [0.8, 0.08, 0.15]),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexWood, 4, 0.1),
            ],
            // Rung 4.
            [
                transform([0, 3.1, 0], [0, 0, 0, 1], [0.8, 0.08, 0.15]),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexWood, 4, 0.1),
            ],
            // Glow cube.
            [
                transform([0, 2, 0], [0, 0, 0, 1], [2, 4, 2]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.4, 1.0, 0.3, 0.25], 0, 1.0),
            ],
        ),
    ];
}
