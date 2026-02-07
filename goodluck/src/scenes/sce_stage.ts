import {instantiate} from "../../lib/game.js";
import {blueprint_camera_follow} from "../blueprints/blu_camera_follow.js";
import {Enemies} from "../blueprints/blu_enemy.js";
import {blueprint_ground} from "../blueprints/blu_ground.js";
import {CameraAnchor, PlayerBodyParts, blueprint_player} from "../blueprints/blu_player.js";
import {children} from "../components/com_children.js";
import {collide} from "../components/com_collide.js";
import {light_directional} from "../components/com_light.js";
import {render_textured_shaded} from "../components/com_render.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {set_position, set_rotation, set_scale, transform} from "../components/com_transform.js";
import {Game, Layer} from "../game.js";
import {Has} from "../world.js";
import {World} from "../world.js";

export function scene_stage(game: Game) {
    game.World = new World();
    game.ViewportResized = true;
    Enemies.length = 0;

    // Ground collision (invisible).
    instantiate(game, [
        ...blueprint_ground(game),
        set_position(0, -0.5, 0),
        set_scale(80, 1, 80),
    ]);

    // Water plane (beneath island).
    instantiate(game, [
        transform(),
        set_position(0, -0.8, 0),
        set_scale(300, 1, 300),
        render_textured_shaded(game.MaterialTexturedShaded, game.MeshPlane, game.TexWater),
    ]);

    // Island ground (plateau mesh with curved edges, sand texture).
    instantiate(game, [
        transform(),
        set_position(0, -1.5, 0),
        set_scale(120, 1, 120),
        render_textured_shaded(game.MaterialTexturedShaded, game.MeshIsland, game.TexGround),
    ]);

    // Background islands.
    let islands: [number, number, number][] = [
        [85, 0.01, 65],
        [-75, 0.01, 80],
        [95, 0.01, -55],
        [-65, 0.01, -75],
        [45, 0.01, 105],
        [-105, 0.01, 25],
    ];
    let island_scales = [18, 14, 22, 16, 10, 20];
    for (let i = 0; i < islands.length; i++) {
        let [x, y, z] = islands[i];
        let s = island_scales[i];
        instantiate(game, [
            transform(),
            set_position(x, y, z),
            set_scale(s, 1, s),
            render_textured_shaded(game.MaterialTexturedShaded, game.MeshIsland, game.TexGround),
        ]);
    }

    // Rock formations (multi-cube clusters).
    let rock_positions: [number, number, number][] = [
        [-12, 0, -8],
        [15, 0, 12],
        [-8, 0, 18],
        [20, 0, -15],
        [-18, 0, -20],
        [25, 0, 5],
        [-25, 0, -10],
        [30, 0, 18],
    ];
    for (let [rx, _ry, rz] of rock_positions) {
        let boulders: any[] = [];
        let count = 3 + (Math.random() * 3) | 0;
        for (let j = 0; j < count; j++) {
            let sx = 1.0 + Math.random() * 2.0;
            let sy = 0.8 + Math.random() * 1.5;
            let sz = 1.0 + Math.random() * 2.0;
            let ox = (Math.random() - 0.5) * 2.5;
            let oz = (Math.random() - 0.5) * 2.5;
            boulders.push([
                transform([ox, sy / 2, oz], [0, 0, 0, 1], [sx, sy, sz]),
                collide(false, Layer.Terrain, Layer.None),
                rigid_body(RigidKind.Static),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexRock),
            ]);
        }
        instantiate(game, [
            transform(),
            set_position(rx, 0, rz),
            set_rotation(0, Math.random() * 360, 0),
            children(...boulders),
        ]);
    }

    // Driftwood (wood textured).
    let wood: [number, number, number, number, number, number, number, number][] = [
        [8, -18, 3.0, 0.4, 0.4, 0, 30, 12],
        [-20, 10, 2.5, 0.35, 0.35, 0, -15, -8],
        [18, 22, 2.8, 0.3, 0.3, 0, 70, 5],
    ];
    for (let [x, z, sx, sy, sz, rotx, roty, rotz] of wood) {
        instantiate(game, [
            transform(),
            set_position(x, sy / 2, z),
            set_rotation(rotx, roty, rotz),
            set_scale(sx, sy, sz),
            collide(false, Layer.Terrain, Layer.None),
            rigid_body(RigidKind.Static),
            render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexWood),
        ]);
    }

    // Shipwreck.
    instantiate(game, [
        transform(),
        set_position(-30, 0, 25),
        set_rotation(0, -35, 8),
        children(
            // Hull bottom.
            [
                transform([0, 0.4, 0], [0, 0, 0, 1], [10, 0.5, 4]),
                collide(false, Layer.Terrain, Layer.None),
                rigid_body(RigidKind.Static),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexWood),
            ],
            // Left wall.
            [
                transform([-4.5, 1.5, 0], [0, 0, 0, 1], [0.5, 2.5, 4]),
                collide(false, Layer.Terrain, Layer.None),
                rigid_body(RigidKind.Static),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexWood),
            ],
            // Right wall.
            [
                transform([4.5, 1.5, 0], [0, 0, 0, 1], [0.5, 2.5, 4]),
                collide(false, Layer.Terrain, Layer.None),
                rigid_body(RigidKind.Static),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexWood),
            ],
            // Back wall.
            [
                transform([0, 2.0, -1.8], [0, 0, 0, 1], [10, 3.5, 0.4]),
                collide(false, Layer.Terrain, Layer.None),
                rigid_body(RigidKind.Static),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexWood),
            ],
            // Broken front (shorter).
            [
                transform([2.5, 1.0, 1.8], [0, 0, 0, 1], [5, 1.5, 0.4]),
                collide(false, Layer.Terrain, Layer.None),
                rigid_body(RigidKind.Static),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexWood),
            ],
            // Mast stump.
            [
                transform([0, 3.5, 0], [0, 0, 0, 1], [0.4, 6, 0.4]),
                collide(false, Layer.Terrain, Layer.None),
                rigid_body(RigidKind.Static),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexWood),
            ],
            // Broken crossbeam.
            [
                transform([0.5, 5.0, 0], [0, 0, 0, 1], [3, 0.3, 0.3]),
                set_rotation(0, 0, 15),
                collide(false, Layer.Terrain, Layer.None),
                rigid_body(RigidKind.Static),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexWood),
            ],
            // Fallen plank debris.
            [
                transform([3, 0.2, 2.5], [0, 0, 0, 1], [3, 0.2, 0.6]),
                set_rotation(5, 25, 0),
                collide(false, Layer.Terrain, Layer.None),
                rigid_body(RigidKind.Static),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexWood),
            ],
            [
                transform([-3, 0.15, 3], [0, 0, 0, 1], [2.5, 0.2, 0.5]),
                set_rotation(-3, -40, 0),
                collide(false, Layer.Terrain, Layer.None),
                rigid_body(RigidKind.Static),
                render_textured_shaded(game.MaterialTexturedShaded, game.MeshCube, game.TexWood),
            ],
        ),
    ]);

    // Directional light (moonlight).
    instantiate(game, [transform(), set_rotation(-45, 30, 0), light_directional([0.6, 0.7, 1.0], 1.2)]);

    // Player (y=0.5 so bottom of cube sits on ground surface at y=0).
    instantiate(game, [...blueprint_player(game), set_position(0, 0.5, 0)]);

    // Hide player body at startup (first-person default).
    for (let part of PlayerBodyParts) {
        game.World.Signature[part] &= ~Has.Render;
    }

    // Camera.
    instantiate(game, [
        ...blueprint_camera_follow(game, CameraAnchor),
    ]);
}
