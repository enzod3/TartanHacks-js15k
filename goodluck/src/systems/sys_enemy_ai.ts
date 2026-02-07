import {mat4_get_translation} from "../../lib/mat4.js";
import {Vec3} from "../../lib/math.js";
import {Enemies} from "../blueprints/blu_enemy.js";
import {Game, Layer} from "../game.js";
import {Has} from "../world.js";
import {debug_line} from "./sys_debug_lines.js";

const SPEED = 4.5;
const ACCEL = 8; // Units/s² — how fast velocity steers toward desired direction.
const PAD = 0.6;
const CORNER_OFFSET = 0.5; // Extra offset past AABB corners so enemies don't clip them.
const MERGE_GAP = 0.3;
const WAYPOINT_ARRIVAL = 0.8;
const DBG_Y = 1.5;

/** 2D slab test (XZ plane). Returns index of nearest blocking AABB, or -1. */
function ray_vs_aabbs(
    ex: number,
    ez: number,
    tx: number,
    tz: number,
    ax: number[],
    bx: number[],
    az: number[],
    bz: number[],
    n: number,
    skip: number,
): number {
    let rdx = tx - ex;
    let rdz = tz - ez;
    let nearest_t = 2.0;
    let hit_idx = -1;

    for (let j = 0; j < n; j++) {
        if (j === skip) continue;

        let t0 = 0,
            t1 = 1;

        // X slab.
        if (Math.abs(rdx) > 0.0001) {
            let ta = (ax[j] - ex) / rdx;
            let tb = (bx[j] - ex) / rdx;
            if (ta > tb) {
                let tmp = ta;
                ta = tb;
                tb = tmp;
            }
            t0 = Math.max(t0, ta);
            t1 = Math.min(t1, tb);
        } else {
            if (ex < ax[j] || ex > bx[j]) continue;
        }

        // Z slab.
        if (Math.abs(rdz) > 0.0001) {
            let ta = (az[j] - ez) / rdz;
            let tb = (bz[j] - ez) / rdz;
            if (ta > tb) {
                let tmp = ta;
                ta = tb;
                tb = tmp;
            }
            t0 = Math.max(t0, ta);
            t1 = Math.min(t1, tb);
        } else {
            if (ez < az[j] || ez > bz[j]) continue;
        }

        if (t0 <= t1 && t1 > 0 && t0 < nearest_t) {
            nearest_t = t0;
            hit_idx = j;
        }
    }

    return hit_idx;
}

/** Pick the best visible corner of AABB j for a detour from enemy to player. */
function pick_corner(
    j: number,
    ex: number,
    ez: number,
    px: number,
    pz: number,
    ax: number[],
    bx: number[],
    az: number[],
    bz: number[],
): [number, number] {
    // Which faces can the enemy see?
    let see_left = ex < ax[j];
    let see_right = ex > bx[j];
    let see_near = ez < az[j];
    let see_far = ez > bz[j];

    // 4 corners offset diagonally outward so enemies pass around, not into, corners.
    let corners_x = [
        ax[j] - CORNER_OFFSET, bx[j] + CORNER_OFFSET,
        ax[j] - CORNER_OFFSET, bx[j] + CORNER_OFFSET,
    ];
    let corners_z = [
        az[j] - CORNER_OFFSET, az[j] - CORNER_OFFSET,
        bz[j] + CORNER_OFFSET, bz[j] + CORNER_OFFSET,
    ];
    let visible = [
        see_left || see_near,
        see_right || see_near,
        see_left || see_far,
        see_right || see_far,
    ];

    // Pick visible corner with shortest detour (enemy→corner + corner→player).
    let best_cost = Infinity;
    let best_x = px;
    let best_z = pz;
    for (let c = 0; c < 4; c++) {
        if (!visible[c]) continue;
        let cx = corners_x[c],
            cz = corners_z[c];
        let d1 = Math.sqrt((cx - ex) * (cx - ex) + (cz - ez) * (cz - ez));
        let d2 = Math.sqrt((cx - px) * (cx - px) + (cz - pz) * (cz - pz));
        let cost = d1 + d2;
        if (cost < best_cost) {
            best_cost = cost;
            best_x = cx;
            best_z = cz;
        }
    }

    return [best_x, best_z];
}

export function sys_enemy_ai(game: Game, delta: number) {
    // Find player.
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
    let px = pp[0],
        pz = pp[2];

    // Collect terrain AABBs directly from the collision system.
    let raw_ax: number[] = [],
        raw_bx: number[] = [],
        raw_az: number[] = [],
        raw_bz: number[] = [];
    for (let i = 0; i < game.World.Signature.length; i++) {
        if (
            (game.World.Signature[i] & (Has.Transform | Has.Collide)) ===
            (Has.Transform | Has.Collide)
        ) {
            let c = game.World.Collide[i];
            if (c.Layers & Layer.Terrain) {
                raw_ax.push(c.Min[0]);
                raw_bx.push(c.Max[0]);
                raw_az.push(c.Min[2]);
                raw_bz.push(c.Max[2]);
            }
        }
    }

    // Merge overlapping/touching AABBs.
    let merged = true;
    while (merged) {
        merged = false;
        for (let i = 0; i < raw_ax.length; i++) {
            for (let j = i + 1; j < raw_ax.length; j++) {
                if (
                    raw_ax[i] - MERGE_GAP <= raw_bx[j] &&
                    raw_bx[i] + MERGE_GAP >= raw_ax[j] &&
                    raw_az[i] - MERGE_GAP <= raw_bz[j] &&
                    raw_bz[i] + MERGE_GAP >= raw_az[j]
                ) {
                    raw_ax[i] = Math.min(raw_ax[i], raw_ax[j]);
                    raw_bx[i] = Math.max(raw_bx[i], raw_bx[j]);
                    raw_az[i] = Math.min(raw_az[i], raw_az[j]);
                    raw_bz[i] = Math.max(raw_bz[i], raw_bz[j]);
                    raw_ax.splice(j, 1);
                    raw_bx.splice(j, 1);
                    raw_az.splice(j, 1);
                    raw_bz.splice(j, 1);
                    merged = true;
                    break;
                }
            }
            if (merged) break;
        }
    }

    // Apply padding.
    let ax: number[] = [],
        bx: number[] = [],
        az: number[] = [],
        bz: number[] = [];
    for (let i = 0; i < raw_ax.length; i++) {
        ax.push(raw_ax[i] - PAD);
        bx.push(raw_bx[i] + PAD);
        az.push(raw_az[i] - PAD);
        bz.push(raw_bz[i] + PAD);
    }
    let n = ax.length;

    // Debug: cyan wireframe rectangles for padded AABBs.
    for (let j = 0; j < n; j++) {
        let y = DBG_Y;
        debug_line(ax[j], y, az[j], bx[j], y, az[j], 0, 1, 1);
        debug_line(bx[j], y, az[j], bx[j], y, bz[j], 0, 1, 1);
        debug_line(bx[j], y, bz[j], ax[j], y, bz[j], 0, 1, 1);
        debug_line(ax[j], y, bz[j], ax[j], y, az[j], 0, 1, 1);
    }

    for (let enemy of Enemies) {
        if (game.World.Signature[enemy.Entity] === Has.None) continue;

        let transform = game.World.Transform[enemy.Entity];
        let ep: Vec3 = [0, 0, 0];
        mat4_get_translation(ep, transform.World);
        let ex = ep[0],
            ez = ep[2];

        let rdx = px - ex,
            rdz = pz - ez;
        let dist = Math.sqrt(rdx * rdx + rdz * rdz);
        if (dist < 1.2) continue;

        // Default target: player.
        let tx = px,
            tz = pz;

        // Waypoint state machine.
        if (enemy.WaypointActive) {
            // Check if direct path to player is now clear.
            let block = ray_vs_aabbs(ex, ez, px, pz, ax, bx, az, bz, n, -1);
            if (block === -1) {
                // Clear path — beeline to player.
                enemy.WaypointActive = false;
                tx = px;
                tz = pz;
                debug_line(ex, DBG_Y, ez, px, DBG_Y, pz, 0, 1, 0);
            } else {
                // Check if arrived at waypoint.
                let wdx = enemy.WaypointX - ex;
                let wdz = enemy.WaypointZ - ez;
                let wdist = Math.sqrt(wdx * wdx + wdz * wdz);
                if (wdist < WAYPOINT_ARRIVAL) {
                    // Arrived — recompute.
                    enemy.WaypointActive = false;
                    // Fall through to recompute below.
                } else {
                    // Keep moving toward waypoint.
                    tx = enemy.WaypointX;
                    tz = enemy.WaypointZ;
                    debug_line(ex, DBG_Y, ez, px, DBG_Y, pz, 1, 0, 0);
                    debug_line(ex, DBG_Y + 0.1, ez, tx, DBG_Y + 0.1, tz, 1, 1, 0);
                    // Debug: magenta vertical at waypoint.
                    debug_line(tx, DBG_Y - 0.5, tz, tx, DBG_Y + 1, tz, 1, 0, 1);
                }
            }
        }

        if (!enemy.WaypointActive && tx === px && tz === pz) {
            // Recompute: ray from enemy to player.
            let j = ray_vs_aabbs(ex, ez, px, pz, ax, bx, az, bz, n, -1);
            if (j === -1) {
                // Clear path.
                tx = px;
                tz = pz;
                debug_line(ex, DBG_Y, ez, px, DBG_Y, pz, 0, 1, 0);
            } else {
                // Blocked by AABB j — pick best visible corner.
                let [cx, cz] = pick_corner(j, ex, ez, px, pz, ax, bx, az, bz);

                // Check if ray to that corner is also blocked by another AABB.
                let k = ray_vs_aabbs(ex, ez, cx, cz, ax, bx, az, bz, n, j);
                if (k >= 0) {
                    // Blocked by AABB k — use corner of k instead.
                    [cx, cz] = pick_corner(k, ex, ez, px, pz, ax, bx, az, bz);
                }

                enemy.WaypointX = cx;
                enemy.WaypointZ = cz;
                enemy.WaypointActive = true;
                tx = cx;
                tz = cz;

                // Debug lines.
                let ht = ray_vs_aabbs(ex, ez, px, pz, ax, bx, az, bz, n, -1);
                if (ht >= 0) {
                    debug_line(ex, DBG_Y, ez, px, DBG_Y, pz, 1, 0, 0);
                }
                debug_line(ex, DBG_Y + 0.1, ez, tx, DBG_Y + 0.1, tz, 1, 1, 0);
                debug_line(tx, DBG_Y - 0.5, tz, tx, DBG_Y + 1, tz, 1, 0, 1);
            }
        }

        // Desired direction (normalized).
        let dx = tx - ex,
            dz = tz - ez;
        let dl = Math.sqrt(dx * dx + dz * dz);
        if (dl > 0.01) {
            dx /= dl;
            dz /= dl;
        }

        // Desired velocity.
        let desired_vx = dx * SPEED;
        let desired_vz = dz * SPEED;

        // Steer velocity toward desired (smooth acceleration, no instant reversals).
        let steer = ACCEL * delta;
        let dvx = desired_vx - enemy.VelX;
        let dvz = desired_vz - enemy.VelZ;
        let dvl = Math.sqrt(dvx * dvx + dvz * dvz);
        if (dvl > steer) {
            dvx = (dvx / dvl) * steer;
            dvz = (dvz / dvl) * steer;
        }
        enemy.VelX += dvx;
        enemy.VelZ += dvz;

        // Clamp to max speed.
        let vl = Math.sqrt(enemy.VelX * enemy.VelX + enemy.VelZ * enemy.VelZ);
        if (vl > SPEED) {
            enemy.VelX = (enemy.VelX / vl) * SPEED;
            enemy.VelZ = (enemy.VelZ / vl) * SPEED;
        }

        // Reactive collision push-out (safety fallback).
        let collide = game.World.Collide[enemy.Entity];
        if (collide) {
            for (let collision of collide.Collisions) {
                let other = collision.Other;
                if (!(game.World.Signature[other] & Has.Collide)) continue;
                if (!(game.World.Collide[other].Layers & Layer.Terrain)) continue;
                transform.Translation[0] += collision.Hit[0];
                transform.Translation[2] += collision.Hit[2];
                // Kill velocity component into the wall.
                let nx = collision.Hit[0];
                let nz = collision.Hit[2];
                let nl = Math.sqrt(nx * nx + nz * nz);
                if (nl > 0.001) {
                    nx /= nl;
                    nz /= nl;
                    let dot = enemy.VelX * nx + enemy.VelZ * nz;
                    if (dot < 0) {
                        enemy.VelX -= dot * nx;
                        enemy.VelZ -= dot * nz;
                    }
                }
                break;
            }
        }

        transform.Translation[0] += enemy.VelX * delta;
        transform.Translation[2] += enemy.VelZ * delta;
        game.World.Signature[enemy.Entity] |= Has.Dirty;

        // Billboard health bar to face player.
        let angle = Math.atan2(px - ex, pz - ez);
        let bar_transform = game.World.Transform[enemy.HealthBar];
        bar_transform.Rotation[0] = 0;
        bar_transform.Rotation[1] = Math.sin(angle / 2);
        bar_transform.Rotation[2] = 0;
        bar_transform.Rotation[3] = Math.cos(angle / 2);
        game.World.Signature[enemy.HealthBar] |= Has.Dirty;
    }
}
