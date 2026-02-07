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
    WaypointX: number;
    WaypointZ: number;
    WaypointActive: boolean;
    VelX: number;
    VelZ: number;
}

export let Enemies: EnemyData[] = [];

export function blueprint_enemy(game: Game, hp: number = 2) {
    let enemy_data: EnemyData = {Entity: 0, Health: hp, MaxHealth: hp, HealthBar: 0, WaypointX: 0, WaypointZ: 0, WaypointActive: false, VelX: 0, VelZ: 0};
    return [
        transform(),
        collide(true, Layer.Enemy, Layer.Bullet | Layer.Player | Layer.Terrain | Layer.Ground, [0.9, 2.0, 0.6]),
        rigid_body(RigidKind.Kinematic),
        move(3, 0),
        callback((_game, entity) => {
            enemy_data.Entity = entity;
            Enemies.push(enemy_data);
        }),
        children(
            // Enemy body (single red rectangle).
            [
                transform([0, 0.9, 0], [0, 0, 0, 1], [0.9, 2.0, 0.6]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.85, 0.2, 0.2, 1]),
            ],
            // Health bar (green).
            [
                transform([0, 2.2, 0], [0, 0, 0, 1], [1.2, 0.14, 0.05]),
                render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [0.2, 0.9, 0.2, 1], 0, 1.0),
                callback((_game, entity) => {
                    enemy_data.HealthBar = entity;
                }),
            ],
        ),
    ];
}
