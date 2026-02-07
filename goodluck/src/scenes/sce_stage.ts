import {instantiate} from "../../lib/game.js";
import {blueprint_camera_follow} from "../blueprints/blu_camera_follow.js";
import {Enemies} from "../blueprints/blu_enemy.js";
import {blueprint_ground} from "../blueprints/blu_ground.js";
import {CameraAnchor, PlayerBodyParts, blueprint_player} from "../blueprints/blu_player.js";
import {light_directional} from "../components/com_light.js";
import {render_textured_shaded} from "../components/com_render.js";
import {set_position, set_rotation, set_scale, transform} from "../components/com_transform.js";
import {Game} from "../game.js";
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
