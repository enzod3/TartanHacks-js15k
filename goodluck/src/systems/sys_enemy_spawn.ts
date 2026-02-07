import {instantiate} from "../../lib/game.js";
import {blueprint_enemy} from "../blueprints/blu_enemy.js";
import {set_position} from "../components/com_transform.js";
import {Game} from "../game.js";

const SPAWN_INTERVAL = 3;
const MAP_RADIUS = 40;

let time_since_spawn = 0;

export function sys_enemy_spawn(game: Game, delta: number) {
    time_since_spawn += delta;

    if (time_since_spawn >= SPAWN_INTERVAL) {
        time_since_spawn = 0;

        // Pick a random point on the edge of the map.
        let angle = Math.random() * Math.PI * 2;
        let x = Math.cos(angle) * MAP_RADIUS;
        let z = Math.sin(angle) * MAP_RADIUS;

        instantiate(game, [
            ...blueprint_enemy(game),
            set_position(x, 0.5, z),
        ]);
    }
}

export function reset_spawn_timer() {
    time_since_spawn = 0;
}
