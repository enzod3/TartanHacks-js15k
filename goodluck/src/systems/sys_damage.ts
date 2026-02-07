import {mat4_get_translation} from "../../lib/mat4.js";
import {Vec3} from "../../lib/math.js";
import {instantiate} from "../../lib/game.js";
import {Enemies} from "../blueprints/blu_enemy.js";
import {destroy_all} from "../components/com_children.js";
import {lifespan} from "../components/com_lifespan.js";
import {render_colored_shaded} from "../components/com_render.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {set_position, set_scale, transform} from "../components/com_transform.js";
import {Game, Layer} from "../game.js";
import {play_sound} from "../sound.js";
import {Has} from "../world.js";

const CONTACT_DAMAGE_COOLDOWN = 0.5;
let contact_timer = 0;

export function sys_damage(game: Game, delta: number) {
    contact_timer -= delta;

    // Check bullet-enemy collisions.
    for (let i = Enemies.length - 1; i >= 0; i--) {
        let enemy = Enemies[i];
        if (game.World.Signature[enemy.Entity] === Has.None) {
            Enemies.splice(i, 1);
            continue;
        }

        let collide = game.World.Collide[enemy.Entity];
        for (let collision of collide.Collisions) {
            let other = collision.Other;
            if (!(game.World.Signature[other] & Has.Collide)) continue;
            let other_collide = game.World.Collide[other];

            if (other_collide.Layers & Layer.Bullet) {
                destroy_all(game.World, other);
                enemy.Health--;

                let ratio = Math.max(0, enemy.Health / enemy.MaxHealth);
                let bar_transform = game.World.Transform[enemy.HealthBar];
                bar_transform.Scale[0] = ratio;
                game.World.Signature[enemy.HealthBar] |= Has.Dirty;

                if (enemy.Health <= 0) {
                    play_sound(120, 0.3, "sawtooth");
                    spawn_debris(game, enemy.Entity);
                    destroy_all(game.World, enemy.Entity);
                    Enemies.splice(i, 1);
                    break;
                } else {
                    play_sound(200, 0.15);
                }
            }

            if ((other_collide.Layers & Layer.Player) && contact_timer <= 0) {
                game.PlayerHealth--;
                contact_timer = CONTACT_DAMAGE_COOLDOWN;
            }
        }
    }
}

function spawn_debris(game: Game, entity: number) {
    let pos: Vec3 = [0, 0, 0];
    mat4_get_translation(pos, game.World.Transform[entity].World);

    for (let j = 0; j < 30; j++) {
        let vx = (Math.random() - 0.5) * 15;
        let vy = Math.random() * 8 + 2;
        let vz = (Math.random() - 0.5) * 15;
        let s = 0.1 + Math.random() * 0.15;

        let particle = instantiate(game, [
            transform(),
            set_position(
                pos[0] + (Math.random() - 0.5),
                pos[1] + 1.0 + Math.random(),
                pos[2] + (Math.random() - 0.5),
            ),
            set_scale(s, s, s),
            rigid_body(RigidKind.Dynamic, 0.3),
            render_colored_shaded(
                game.MaterialColoredShaded,
                game.MeshCube,
                [0.9, 0.1 + Math.random() * 0.2, 0.1, 1],
                0,
                0.8,
            ),
            lifespan(2),
        ]);

        let rb = game.World.RigidBody[particle];
        rb.VelocityLinear[0] = vx;
        rb.VelocityLinear[1] = vy;
        rb.VelocityLinear[2] = vz;
    }
}

export function reset_damage() {
    contact_timer = 0;
}
