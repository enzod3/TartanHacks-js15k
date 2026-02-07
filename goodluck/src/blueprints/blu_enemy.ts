import {Entity} from "../../lib/world.js";
import {callback} from "../components/com_callback.js";
import {children} from "../components/com_children.js";
import {collide} from "../components/com_collide.js";
import {render_colored_shaded} from "../components/com_render.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {transform} from "../components/com_transform.js";
import {Game, Layer} from "../game.js";

export interface EnemyData {
    Entity: Entity;
    Health: number;
    MaxHealth: number;
    HealthBar: Entity;
}

export let Enemies: EnemyData[] = [];

export function blueprint_enemy(game: Game) {
    let enemy_data: EnemyData = {Entity: 0, Health: 2, MaxHealth: 2, HealthBar: 0};
    return [
        transform(),
        collide(true, Layer.Enemy, Layer.Bullet),
        rigid_body(RigidKind.Kinematic),
        callback((_game, entity) => {
            enemy_data.Entity = entity;
            Enemies.push(enemy_data);
        }),
        children(
            // Body lower.
            [
                transform([0, 0, 0], [0, 0, 0, 1], [0.7, 0.7, 0.6]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.8, 0.2, 0.2, 1]),
            ],
            // Body mid.
            [
                transform([0, 0.6, 0], [0, 0, 0, 1], [0.6, 0.6, 0.5]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.85, 0.25, 0.2, 1]),
            ],
            // Body upper.
            [
                transform([0, 1.1, 0], [0, 0, 0, 1], [0.5, 0.5, 0.45]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.9, 0.2, 0.15, 1]),
            ],
            // Head.
            [
                transform([0, 1.6, 0], [0, 0, 0, 1], [0.42, 0.4, 0.42]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.9, 0.3, 0.25, 1]),
            ],
            // Health bar background (dark).
            [
                transform([0, 2.2, 0], [0, 0, 0, 1], [1.0, 0.1, 0.1]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.15, 0.15, 0.15, 1], 0, 1.0),
            ],
            // Health bar foreground (green).
            [
                transform([0, 2.2, 0.01], [0, 0, 0, 1], [1.0, 0.1, 0.1]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.2, 0.9, 0.2, 1], 0, 1.0),
                callback((_game, entity) => {
                    enemy_data.HealthBar = entity;
                }),
            ],
        ),
    ];
}
