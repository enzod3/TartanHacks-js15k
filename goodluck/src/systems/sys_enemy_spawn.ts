import {instantiate} from "../../lib/game.js";
import {blueprint_enemy, Enemies} from "../blueprints/blu_enemy.js";
import {blueprint_evac} from "../blueprints/blu_evac.js";
import {blueprint_powerup} from "../blueprints/blu_powerup.js";
import {blueprint_upgrade_station, UpgradeType} from "../blueprints/blu_upgrade_station.js";
import {destroy_all} from "../components/com_children.js";
import {set_position} from "../components/com_transform.js";
import {Game, WaveState, WeaponType} from "../game.js";
import {StationTypes, set_evac_entity} from "./sys_upgrade_stations.js";

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
                if (game.Wave >= game.MaxWaves) {
                    // All waves done — spawn evac.
                    game.WaveState = WaveState.Evac;
                    let evac = instantiate(game, [
                        ...blueprint_evac(game),
                        set_position(0, 0, 0),
                    ]);
                    set_evac_entity(evac);
                } else {
                    // Transition to upgrading — spawn stations.
                    game.WaveState = WaveState.Upgrading;
                    spawn_upgrade_stations(game);
                }
            }
            break;
        }
        case WaveState.Upgrading: {
            // Handled by sys_upgrade_stations.
            break;
        }
    }
}

function spawn_upgrade_stations(game: Game) {
    let choices = get_upgrade_choices(game);
    let positions: [number, number, number][] = [
        [-5, 0, -8],
        [0, 0, -8],
        [5, 0, -8],
    ];

    game.UpgradeLabels = [];
    for (let i = 0; i < choices.length; i++) {
        let type = choices[i];
        let [x, y, z] = positions[i];
        let entity = instantiate(game, [
            ...blueprint_upgrade_station(game, type),
            set_position(x, y, z),
        ]);
        game.UpgradeStations.push(entity);
        StationTypes.set(entity, type);
        game.UpgradeLabels.push(upgrade_label(type));
    }
}

function upgrade_label(type: UpgradeType): string {
    switch (type) {
        case UpgradeType.Thrower: return "Rock Thrower";
        case UpgradeType.Shotgun: return "Shotgun";
        case UpgradeType.InfantryDmg: return "Rifle Dmg+";
        case UpgradeType.DamageUp: return "Dmg+";
        case UpgradeType.FireRateUp: return "Fire Rate+";
        case UpgradeType.Continue: return "Continue";
    }
}

function get_upgrade_choices(game: Game): UpgradeType[] {
    let round = game.Wave; // Wave 1 done = round 1, etc.

    if (round === 1) {
        // Round 1: weapon choices.
        return [UpgradeType.Thrower, UpgradeType.Shotgun, UpgradeType.InfantryDmg];
    } else {
        // Rounds 2 & 3: stat upgrades.
        if (game.Weapon === WeaponType.Thrower) {
            return [UpgradeType.DamageUp, UpgradeType.FireRateUp, UpgradeType.Continue];
        } else {
            return [UpgradeType.DamageUp, UpgradeType.FireRateUp];
        }
    }
}

export function start_wave(game: Game) {
    game.Wave++;
    game.WaveEnemiesTotal = 3 + game.Wave * 2;
    game.WaveEnemiesSpawned = 0;
    game.WaveState = WaveState.Spawning;
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
