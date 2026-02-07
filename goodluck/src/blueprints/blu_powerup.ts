import {collide} from "../components/com_collide.js";
import {render_colored_shaded} from "../components/com_render.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {transform} from "../components/com_transform.js";
import {children} from "../components/com_children.js";
import {Game, Layer} from "../game.js";

export function blueprint_powerup(game: Game) {
    return [
        transform(),
        collide(true, Layer.Pickup, Layer.Player, [1.5, 1.5, 1.5]),
        rigid_body(RigidKind.Kinematic),
        children(
            // Outer glow cube.
            [
                transform([0, 0.6, 0], [0, 0, 0, 1], [1.4, 1.4, 1.4]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.1, 0.8, 1.0, 0.25], 64, 1.0),
            ],
            // Mid glow cube.
            [
                transform([0, 0.6, 0], [0, 0, 0, 1], [1.0, 1.0, 1.0]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.2, 0.9, 1.0, 0.4], 64, 1.0),
            ],
            // Inner core cube.
            [
                transform([0, 0.6, 0], [0, 0, 0, 1], [0.6, 0.6, 0.6]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.5, 1.0, 1.0, 1], 128, 1.0),
            ],
        ),
    ];
}
