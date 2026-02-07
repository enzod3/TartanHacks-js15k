import {children} from "../components/com_children.js";
import {collide} from "../components/com_collide.js";
import {render_colored_shaded} from "../components/com_render.js";
import {render_textured_shaded} from "../components/com_render.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {transform} from "../components/com_transform.js";
import {Game, Layer} from "../game.js";

export function blueprint_evac(game: Game) {
    let pole_height = 12;
    let pole_spacing = 0.6;
    let rung_count = 10;
    let rung_spacing = pole_height / (rung_count + 1);

    let rungs: any[] = [];
    for (let i = 1; i <= rung_count; i++) {
        let y = i * rung_spacing;
        rungs.push([
            transform([0, y, 0], [0, 0, 0, 1], [pole_spacing * 2, 0.08, 0.12]),
            render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexWood, 4, 0.1),
        ]);
    }

    return [
        transform(),
        collide(true, Layer.Pickup, Layer.Player, [3, pole_height, 3]),
        rigid_body(RigidKind.Kinematic),
        children(
            // Left pole.
            [
                transform([-pole_spacing, pole_height / 2, 0], [0, 0, 0, 1], [0.12, pole_height, 0.12]),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexWood, 4, 0.1),
            ],
            // Right pole.
            [
                transform([pole_spacing, pole_height / 2, 0], [0, 0, 0, 1], [0.12, pole_height, 0.12]),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexWood, 4, 0.1),
            ],
            // Rungs.
            ...rungs,
            // Glow column.
            [
                transform([0, pole_height / 2, 0], [0, 0, 0, 1], [2, pole_height, 2]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.4, 1.0, 0.3, 0.2], 0, 1.0),
            ],
        ),
    ];
}
