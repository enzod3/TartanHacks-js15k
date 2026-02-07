import {Entity} from "../../lib/world.js";
import {callback} from "../components/com_callback.js";
import {children} from "../components/com_children.js";
import {collide} from "../components/com_collide.js";
import {control_player} from "../components/com_control_player.js";
import {light_point} from "../components/com_light.js";
import {move} from "../components/com_move.js";
import {render_colored_shaded} from "../components/com_render.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {transform} from "../components/com_transform.js";
import {Game, Layer} from "../game.js";

export let CameraAnchor: Entity;
export let PlayerBodyParts: Entity[] = [];

export function blueprint_player(game: Game) {
    PlayerBodyParts = [];
    return [
        transform(),
        control_player(true, 0.2, 0),
        move(10, 3),
        collide(true, Layer.Player, Layer.Terrain | Layer.Enemy | Layer.Ground),
        rigid_body(RigidKind.Dynamic),
        children(
            // Player body (single rectangle).
            [
                transform([0, 0.9, 0], [0, 0, 0, 1], [0.9, 2.0, 0.6]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.85, 0.7, 0.45, 1]),
                callback((_game, entity) => PlayerBodyParts.push(entity)),
            ],
            // Camera rig anchor.
            [
                transform(),
                move(0, 3),
                control_player(false, 0, 0.2, -10, 80),
                callback((_game, entity) => (CameraAnchor = entity)),
                children(
                    // Gun (visible in all views).
                    [
                        transform([0, 0.7, 0.3], [0, 0, 0, 1], [0.08, 0.08, 0.5]),
                        render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.3, 0.3, 0.35, 1]),
                    ],
                ),
            ],
            // Overhead light.
            [transform([0, 4, 0]), light_point([0.6, 0.7, 1.0], 8)],
        ),
    ];
}
