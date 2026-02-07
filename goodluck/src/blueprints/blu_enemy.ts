import {Entity} from "../../lib/world.js";
import {callback} from "../components/com_callback.js";
import {children} from "../components/com_children.js";
import {collide} from "../components/com_collide.js";
import {move} from "../components/com_move.js";
import {render_colored_shaded, render_textured_shaded} from "../components/com_render.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {transform} from "../components/com_transform.js";
import {Game, Layer} from "../game.js";

export interface EnemyData {
    Entity: Entity;
    Health: number;
    MaxHealth: number;
    HealthBar: Entity;
    LeftLeg: Entity;
    RightLeg: Entity;
    VelX: number;
    VelZ: number;
}

export let Enemies: EnemyData[] = [];

export function blueprint_enemy(game: Game, hp: number = 2) {
    let enemy_data: EnemyData = {Entity: 0, Health: hp, MaxHealth: hp, HealthBar: 0, LeftLeg: 0, RightLeg: 0, VelX: 0, VelZ: 0};
    return [
        transform(),
        collide(true, Layer.Enemy, Layer.Bullet | Layer.Player | Layer.Terrain | Layer.Ground | Layer.Enemy, [1.0, 4.0, 0.8]),
        rigid_body(RigidKind.Kinematic),
        move(3, 0),
        callback((_game, entity) => {
            enemy_data.Entity = entity;
            Enemies.push(enemy_data);
        }),
        children(
            // Torso.
            [
                transform([0, 1.1, 0], [0, 0, 0, 1], [0.6, 0.7, 0.35]),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexZombie),
            ],
            // Head.
            [
                transform([0, 1.75, 0], [0, 0, 0, 1], [0.4, 0.4, 0.35]),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexZombie),
                children(
                    // Left eye.
                    [
                        transform([-0.25, 0.1, -0.52], [0, 0, 0, 1], [0.2, 0.15, 0.05]),
                        render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [1.0, 0.1, 0.1, 1], 16, 1.0),
                    ],
                    // Right eye.
                    [
                        transform([0.25, 0.1, -0.52], [0, 0, 0, 1], [0.2, 0.15, 0.05]),
                        render_colored_shaded(game.MaterialColoredShaded, game.MeshCube, [1.0, 0.1, 0.1, 1], 16, 1.0),
                    ],
                ),
            ],
            // Left arm (horizontal, extended forward).
            [
                transform([-0.45, 1.25, -0.35], [0.707, 0, 0, 0.707], [0.2, 0.55, 0.2]),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexZombie),
            ],
            // Right arm (horizontal, extended forward).
            [
                transform([0.45, 1.25, -0.35], [0.707, 0, 0, 0.707], [0.2, 0.55, 0.2]),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexZombie),
            ],
            // Left leg.
            [
                transform([-0.15, 0.35, 0], [0, 0, 0, 1], [0.25, 0.7, 0.25]),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexZombie),
                callback((_game, entity) => {
                    enemy_data.LeftLeg = entity;
                }),
            ],
            // Right leg.
            [
                transform([0.15, 0.35, 0], [0, 0, 0, 1], [0.25, 0.7, 0.25]),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexZombie),
                callback((_game, entity) => {
                    enemy_data.RightLeg = entity;
                }),
            ],
            // Health bar.
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
