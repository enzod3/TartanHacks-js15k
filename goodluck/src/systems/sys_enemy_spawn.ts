import {instantiate} from "../../lib/game.js";
import {blueprint_enemy, Enemies} from "../blueprints/blu_enemy.js";
import {blueprint_powerup} from "../blueprints/blu_powerup.js";
import {destroy_all} from "../components/com_children.js";
import {set_position} from "../components/com_transform.js";
import {Game, WaveState} from "../game.js";

const SPAWN_INTERVAL = 1.5;
const MAP_RADIUS = 40;

let time_since_spawn = 0;

export function sys_enemy_spawn(game: Game, delta: number) {
    switch (game.WaveState) {
        case WaveState.Spawning: {
            time_since_spawn += delta;
            if (time_since_spawn >= SPAWN_INTERVAL && game.WaveEnemiesSpawned < game.WaveEnemiesTotal) {
                time_since_spawn = 0;

                let angle = Math.random() * Math.PI * 2;
                let x = Math.cos(angle) * MAP_RADIUS;
                let z = Math.sin(angle) * MAP_RADIUS;

                let hp = game.Wave;
                instantiate(game, [
                    ...blueprint_enemy(game, hp),
                    set_position(x, 0.5, z),
                ]);
                game.WaveEnemiesSpawned++;
            }
            if (game.WaveEnemiesSpawned >= game.WaveEnemiesTotal) {
                game.WaveState = WaveState.Fighting;
            }
            break;
        }
        case WaveState.Fighting: {
            if (Enemies.length === 0) {
                game.WaveState = WaveState.Upgrading;
                game.Paused = true;
                document.exitPointerLock();
            }
            break;
        }
        case WaveState.Upgrading: {
            // Wait for player to pick upgrade.
            break;
        }
    }
}

export function start_wave(game: Game) {
    game.Wave++;
    game.WaveEnemiesTotal = 3 + game.Wave * 2;
    game.WaveEnemiesSpawned = 0;
    game.WaveState = WaveState.Spawning;
    game.Paused = false;
    time_since_spawn = 0;

    // Destroy previous powerup if it still exists.
    if (game.PowerupEntity >= 0) {
        destroy_all(game.World, game.PowerupEntity);
        game.PowerupEntity = -1;
    }

    // Spawn powerup at a random spot.
    let angle = Math.random() * Math.PI * 2;
    let r = 5 + Math.random() * 20;
    game.PowerupEntity = instantiate(game, [
        ...blueprint_powerup(game),
        set_position(Math.cos(angle) * r, 0, Math.sin(angle) * r),
    ]);
}

export function reset_spawn_timer() {
    time_since_spawn = 0;
}
