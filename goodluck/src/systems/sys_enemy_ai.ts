import {mat4_get_translation} from "../../lib/mat4.js";
import {Vec3} from "../../lib/math.js";
import {Enemies} from "../blueprints/blu_enemy.js";
import {Game, Layer} from "../game.js";
import {Has} from "../world.js";

// Base constants
const BASE_SPEED = 4.5;
const BASE_ACCEL = 8;
const GS = 80;
const GO = -40;

let grid = new Uint8Array(GS * GS);
let parent = new Int16Array(GS * GS);
let queue: number[] = [];
const DX = [1, -1, 0, 0, 1, -1, 1, -1];
const DZ = [0, 0, 1, -1, 1, 1, -1, -1];

function build_grid(game: Game) {
    grid.fill(0);
    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & (Has.Transform | Has.Collide)) === (Has.Transform | Has.Collide)) {
            let c = game.World.Collide[i];
            if (!(c.Layers & Layer.Terrain)) continue;
            let x0 = Math.max(0, Math.floor(c.Min[0] - GO));
            let x1 = Math.min(GS, Math.ceil(c.Max[0] - GO));
            let z0 = Math.max(0, Math.floor(c.Min[2] - GO));
            let z1 = Math.min(GS, Math.ceil(c.Max[2] - GO));
            for (let x = x0; x < x1; x++)
                for (let z = z0; z < z1; z++)
                    grid[z * GS + x] = 1;
        }
    }
}

function bfs(px: number, pz: number) {
    parent.fill(-1);
    let gx = Math.max(0, Math.min(GS - 1, (px - GO) | 0));
    let gz = Math.max(0, Math.min(GS - 1, (pz - GO) | 0));
    let start = gz * GS + gx;
    queue.length = 0;
    queue.push(start);
    parent[start] = start;
    let head = 0;
    while (head < queue.length) {
        let cur = queue[head++];
        let cx = cur % GS, cz = (cur / GS) | 0;
        for (let d = 0; d < 8; d++) {
            let nx = cx + DX[d], nz = cz + DZ[d];
            if (nx < 0 || nx >= GS || nz < 0 || nz >= GS) continue;
            let ni = nz * GS + nx;
            if (parent[ni] !== -1 || grid[ni]) continue;
            if (d >= 4 && (grid[cz * GS + nx] || grid[nz * GS + cx])) continue;
            parent[ni] = cur;
            queue.push(ni);
        }
    }
}

function has_los(x0: number, z0: number, x1: number, z1: number): boolean {
    let gx0 = Math.max(0, Math.min(GS - 1, (x0 - GO) | 0));
    let gz0 = Math.max(0, Math.min(GS - 1, (z0 - GO) | 0));
    let gx1 = Math.max(0, Math.min(GS - 1, (x1 - GO) | 0));
    let gz1 = Math.max(0, Math.min(GS - 1, (z1 - GO) | 0));
    let dx = Math.abs(gx1 - gx0), dz = Math.abs(gz1 - gz0);
    let sx = gx0 < gx1 ? 1 : -1, sz = gz0 < gz1 ? 1 : -1;
    let err = dx - dz, x = gx0, z = gz0;
    while (true) {
        if (grid[z * GS + x]) return false;
        if (x === gx1 && z === gz1) break;
        let e2 = 2 * err;
        if (e2 > -dz) { err -= dz; x += sx; }
        if (e2 < dx) { err += dx; z += sz; }
    }
    return true;
}

function get_target(ex: number, ez: number, px: number, pz: number): [number, number] {
    if (has_los(ex, ez, px, pz)) return [px, pz];

    let gx = Math.max(0, Math.min(GS - 1, (ex - GO) | 0));
    let gz = Math.max(0, Math.min(GS - 1, (ez - GO) | 0));
    let idx = gz * GS + gx;
    if (parent[idx] < 0 || parent[idx] === idx) return [px, pz];

    let step = idx;
    for (let i = 0; i < 3; i++) {
        let next = parent[step];
        if (next === step) break;
        step = next;
    }

    let pgx = Math.max(0, Math.min(GS - 1, (px - GO) | 0));
    let pgz = Math.max(0, Math.min(GS - 1, (pz - GO) | 0));
    if (step === pgz * GS + pgx) return [px, pz];

    return [(step % GS) + GO + 0.5, ((step / GS) | 0) + GO + 0.5];
}

export function sys_enemy_ai(game: Game, delta: number) {
    let player_entity = -1;
    for (let i = 0; i < game.World.Signature.length; i++) {
        if (
            (game.World.Signature[i] & (Has.ControlPlayer | Has.Transform | Has.Collide)) ===
            (Has.ControlPlayer | Has.Transform | Has.Collide)
        ) {
            player_entity = i;
            break;
        }
    }
    if (player_entity === -1) return;

    let pp: Vec3 = [0, 0, 0];
    mat4_get_translation(pp, game.World.Transform[player_entity].World);
    let px = pp[0], pz = pp[2];

    build_grid(game);
    bfs(px, pz);

    // --- Dynamic Difficulty Scaling ---
    // Increase speed by 0.5 per wave
    let current_speed = BASE_SPEED + (game.Wave * 0.5);
    // Increase acceleration so they remain agile at high speeds
    let current_accel = BASE_ACCEL + (game.Wave * 0.3);

    for (let enemy of Enemies) {
        if (game.World.Signature[enemy.Entity] === Has.None) continue;

        let transform = game.World.Transform[enemy.Entity];
        let ep: Vec3 = [0, 0, 0];
        mat4_get_translation(ep, transform.World);
        let ex = ep[0], ez = ep[2];

        let dist = Math.sqrt((px - ex) * (px - ex) + (pz - ez) * (pz - ez));
        if (dist < 1.2) continue;

        let [tx, tz] = get_target(ex, ez, px, pz);

        // Desired direction.
        let dx = tx - ex, dz = tz - ez;
        let dl = Math.sqrt(dx * dx + dz * dz);
        if (dl > 0.01) { dx /= dl; dz /= dl; }

        // Steer velocity toward desired.
        let steer = current_accel * delta;
        let dvx = dx * current_speed - enemy.VelX, dvz = dz * current_speed - enemy.VelZ;
        let dvl = Math.sqrt(dvx * dvx + dvz * dvz);
        if (dvl > steer) { dvx = (dvx / dvl) * steer; dvz = (dvz / dvl) * steer; }
        enemy.VelX += dvx;
        enemy.VelZ += dvz;

        // Clamp to current max speed.
        let vl = Math.sqrt(enemy.VelX * enemy.VelX + enemy.VelZ * enemy.VelZ);
        if (vl > current_speed) { 
            enemy.VelX = (enemy.VelX / vl) * current_speed; 
            enemy.VelZ = (enemy.VelZ / vl) * current_speed; 
        }

        // Collision push-out (terrain + enemy hits).
        let collide = game.World.Collide[enemy.Entity];
        if (collide) {
            for (let collision of collide.Collisions) {
                let other = collision.Other;
                if (!(game.World.Signature[other] & Has.Collide)) continue;
                let other_layers = game.World.Collide[other].Layers;
                if (other_layers & Layer.Terrain) {
                    transform.Translation[0] += collision.Hit[0];
                    transform.Translation[2] += collision.Hit[2];
                    let nx = collision.Hit[0], nz = collision.Hit[2];
                    let nl = Math.sqrt(nx * nx + nz * nz);
                    if (nl > 0.001) {
                        nx /= nl; nz /= nl;
                        let dot = enemy.VelX * nx + enemy.VelZ * nz;
                        if (dot < 0) { enemy.VelX -= dot * nx; enemy.VelZ -= dot * nz; }
                    }
                } else if (other_layers & Layer.Enemy) {
                    transform.Translation[0] += collision.Hit[0] * 0.5;
                    transform.Translation[2] += collision.Hit[2] * 0.5;
                }
            }
        }

        transform.Translation[0] += enemy.VelX * delta;
        transform.Translation[2] += enemy.VelZ * delta;
        game.World.Signature[enemy.Entity] |= Has.Dirty;

        // Face movement direction.
        let vl2 = Math.sqrt(enemy.VelX * enemy.VelX + enemy.VelZ * enemy.VelZ);
        if (vl2 > 0.5) {
            let facing = Math.atan2(enemy.VelX, enemy.VelZ) + Math.PI;
            transform.Rotation[0] = 0;
            transform.Rotation[1] = Math.sin(facing / 2);
            transform.Rotation[2] = 0;
            transform.Rotation[3] = Math.cos(facing / 2);
        }

        // Animate legs.
        if (enemy.LeftLeg && enemy.RightLeg) {
            let speed = Math.sqrt(enemy.VelX * enemy.VelX + enemy.VelZ * enemy.VelZ);
            let swing = Math.sin(game.Now / 1000 * 10) * 0.3 * Math.min(1, speed / current_speed);
            let left_leg = game.World.Transform[enemy.LeftLeg];
            let right_leg = game.World.Transform[enemy.RightLeg];
            left_leg.Rotation[0] = Math.sin(swing / 2);
            left_leg.Rotation[3] = Math.cos(swing / 2);
            right_leg.Rotation[0] = Math.sin(-swing / 2);
            right_leg.Rotation[3] = Math.cos(-swing / 2);
            game.World.Signature[enemy.LeftLeg] |= Has.Dirty;
            game.World.Signature[enemy.RightLeg] |= Has.Dirty;
        }
    }
}
