import {mat4_get_translation} from "../../lib/mat4.js";
import {Vec3} from "../../lib/math.js";
import {vec3_normalize, vec3_subtract} from "../../lib/vec3.js";
import {Enemies} from "../blueprints/blu_enemy.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const ENEMY_SPEED = 3;

export function sys_enemy_ai(game: Game, delta: number) {
    // Find player entity.
    let player_entity = -1;
    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & (Has.ControlPlayer | Has.Transform | Has.Collide)) ===
            (Has.ControlPlayer | Has.Transform | Has.Collide)) {
            player_entity = i;
            break;
        }
    }
    if (player_entity === -1) return;

    let player_pos: Vec3 = [0, 0, 0];
    mat4_get_translation(player_pos, game.World.Transform[player_entity].World);

    for (let enemy of Enemies) {
        if (game.World.Signature[enemy.Entity] === Has.None) continue;

        let transform = game.World.Transform[enemy.Entity];
        let enemy_pos: Vec3 = [0, 0, 0];
        mat4_get_translation(enemy_pos, transform.World);

        let dir: Vec3 = [0, 0, 0];
        vec3_subtract(dir, player_pos, enemy_pos);
        dir[1] = 0;
        let len = Math.sqrt(dir[0] * dir[0] + dir[2] * dir[2]);
        if (len < 1.2) continue;

        vec3_normalize(dir, dir);
        transform.Translation[0] += dir[0] * ENEMY_SPEED * delta;
        transform.Translation[2] += dir[2] * ENEMY_SPEED * delta;
        game.World.Signature[enemy.Entity] |= Has.Dirty;
    }
}
