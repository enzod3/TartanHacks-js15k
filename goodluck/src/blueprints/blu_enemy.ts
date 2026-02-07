import {Entity} from "../../lib/world.js";
import {callback} from "../components/com_callback.js";
import {children} from "../components/com_children.js";
import {collide} from "../components/com_collide.js";
import {move} from "../components/com_move.js";
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
        collide(true, Layer.Enemy, Layer.Bullet | Layer.Player, [0.6, 1.6, 0.4]),
        rigid_body(RigidKind.Kinematic),
        move(3, 0),
        callback((_game, entity) => {
            enemy_data.Entity = entity;
            Enemies.push(enemy_data);
        }),
        children(
            // Enemy body (single red rectangle).
            [
                transform([0, 0.7, 0], [0, 0, 0, 1], [0.6, 1.6, 0.4]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.85, 0.2, 0.2, 1]),
            ],
            // Health bar (green).
            [
                transform([0, 1.8, 0], [0, 0, 0, 1], [1.0, 0.14, 0.05]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.2, 0.9, 0.2, 1], 0, 1.0),
                callback((_game, entity) => {
                    enemy_data.HealthBar = entity;
                }),
            ],
        ),
    ];
}
