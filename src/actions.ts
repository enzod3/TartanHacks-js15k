import {mat4_get_translation} from "../lib/mat4.js";
import {Vec3} from "../lib/math.js";
import {instantiate} from "../lib/game.js";
import {blueprint_bullet} from "./blueprints/blu_bullet.js";
import {set_position, set_scale} from "./components/com_transform.js";
import {Game, WaveState} from "./game.js";
import {play_gunshot, play_pickup} from "./sound.js";
import {Has} from "./world.js";
import {start_wave} from "./systems/sys_enemy_spawn.js";
import {apply_upgrade} from "./systems/sys_upgrade_stations.js";

export const enum Action {
    ToggleFullscreen,
    PlayAgain,
    ChooseUpgrade,
    GrenadeExplode,
    StartGame,
}

export function dispatch(game: Game, action: Action, payload: unknown) {
    switch (action) {
        case Action.ToggleFullscreen: {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                document.body.requestFullscreen();
            }
            break;
        }
        case Action.PlayAgain: {
            location.reload();
            break;
        }
        case Action.ChooseUpgrade: {
            let index = payload as number;
            let type = game.UpgradeChoices[index];
            if (type !== undefined) {
                apply_upgrade(game, type);
                play_pickup();
                game.UpgradeChoices = [];
                game.UpgradeLabels = [];
                start_wave(game);
            }
            break;
        }
        case Action.StartGame: {
            game.WaveState = WaveState.Spawning;
            game.Paused = false;
            game.StartTime = Date.now();
            break;
        }
        case Action.GrenadeExplode: {
            let entity = payload as number;
            if (game.World.Signature[entity] === Has.None) break;
            let pos: Vec3 = [0, 0, 0];
            mat4_get_translation(pos, game.World.Transform[entity].World);
            play_gunshot(0.8);

            let speed = 40;
            // Spherical spread: 3 vertical rings.
            let rings: [number, number][] = [
                [0.5, -0.9],  // low ring
                [0.8, -0.4],  // mid-low ring
                [1.0, 0.0],   // middle ring
                [0.8, 0.4],   // mid-high ring
                [0.5, 0.9],   // high ring
            ];
            for (let [r, dy] of rings) {
                let count = r === 1.0 ? 10 : 6;
                for (let i = 0; i < count; i++) {
                    let angle = (i / count) * Math.PI * 2;
                    let dx = Math.cos(angle) * r;
                    let dz = Math.sin(angle) * r;

                    let bullet = instantiate(game, blueprint_bullet(game));
                    set_position(pos[0], pos[1] + 0.5, pos[2])(game, bullet);
                    set_scale(0.1, 0.1, 0.1)(game, bullet);

                    let rb = game.World.RigidBody[bullet];
                    rb.VelocityLinear[0] = dx * speed;
                    rb.VelocityLinear[1] = dy * speed;
                    rb.VelocityLinear[2] = dz * speed;
                }
            }
            break;
        }
    }
}
