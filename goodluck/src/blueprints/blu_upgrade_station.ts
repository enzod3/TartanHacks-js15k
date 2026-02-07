import {children} from "../components/com_children.js";
import {collide} from "../components/com_collide.js";
import {render_colored_shaded} from "../components/com_render.js";
import {render_textured_shaded} from "../components/com_render.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {transform} from "../components/com_transform.js";
import {Game, Layer} from "../game.js";

export const enum UpgradeType {
    Thrower,
    Shotgun,
    InfantryDmg,
    DamageUp,
    FireRateUp,
    Continue,
    Grenade,
}

export function blueprint_upgrade_station(game: Game, type: UpgradeType) {
    let model_child = get_model_child(game, type);
    let glow_color = get_glow_color(type);

    return [
        transform(),
        collide(true, Layer.Pickup, Layer.Player, [2, 3, 2]),
        rigid_body(RigidKind.Kinematic),
        children(
            // Pedestal.
            [
                transform([0, 0.15, 0], [0, 0, 0, 1], [0.8, 0.3, 0.8]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.5, 0.5, 0.45, 1], 4, 0.1),
            ],
            // Spinning weapon model.
            model_child,
            // Glow base.
            [
                transform([0, 0.05, 0], [0, 0, 0, 1], [1.2, 0.1, 1.2]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, glow_color, 0, 1.0),
            ],
        ),
    ];
}

function get_model_child(game: Game, type: UpgradeType) {
    switch (type) {
        case UpgradeType.Thrower:
            return [
                transform([0, 1.2, 0], [0, 0, 0, 1], [0.6, 0.6, 0.6]),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexRock, 4, 0.3),
            ];
        case UpgradeType.Shotgun:
            return [
                transform([0, 1.2, 0], [0, 0, 0, 1], [0.2, 0.2, 0.8]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.12, 0.12, 0.12, 1], 32, 0.3),
            ];
        case UpgradeType.InfantryDmg:
            return [
                transform([0, 1.2, 0], [0, 0, 0, 1], [0.1, 0.1, 0.5]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.5, 0.3, 0.15, 1], 32, 0.4),
            ];
        case UpgradeType.DamageUp:
            return [
                transform([0, 1.2, 0], [0, 0, 0, 1], [0.4, 0.4, 0.4]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [1.0, 0.9, 0.2, 1], 64, 1.0),
            ];
        case UpgradeType.FireRateUp:
            return [
                transform([0, 1.2, 0], [0, 0, 0, 1], [0.4, 0.4, 0.4]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.2, 0.9, 0.3, 1], 64, 1.0),
            ];
        case UpgradeType.Continue:
            return [
                transform([0, 1.2, 0], [0, 0, 0, 1], [0.4, 0.4, 0.4]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.9, 0.9, 0.9, 1], 32, 0.6),
            ];
        case UpgradeType.Grenade:
            return [
                transform([0, 1.2, 0], [0, 0, 0, 1], [0.4, 0.4, 0.4]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.3, 0.6, 0.2, 1], 8, 0.6),
            ];
    }
}

function get_glow_color(type: UpgradeType): [number, number, number, number] {
    switch (type) {
        case UpgradeType.Thrower:
            return [0.6, 0.4, 0.2, 0.5];
        case UpgradeType.Shotgun:
            return [0.4, 0.4, 0.5, 0.5];
        case UpgradeType.InfantryDmg:
            return [0.6, 0.4, 0.2, 0.5];
        case UpgradeType.DamageUp:
            return [1.0, 0.9, 0.2, 0.5];
        case UpgradeType.FireRateUp:
            return [0.2, 0.9, 0.3, 0.5];
        case UpgradeType.Continue:
            return [0.9, 0.9, 0.9, 0.5];
        case UpgradeType.Grenade:
            return [0.3, 0.6, 0.2, 0.5];
    }
}
