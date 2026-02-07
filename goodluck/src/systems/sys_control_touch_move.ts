// /**
//  * # sys_control_touch_move
//  *
//  * Handle touch input using the "invisible joystick" approach. Good for FPS and
//  * TPS camera controls.
//  *
//  * The first finger moves the entity. The second finger rotates it.
//  */
//
// import {DEG_TO_RAD, Quat, Vec2, Vec3} from "../../lib/math.js";
// import {clamp} from "../../lib/number.js";
// import {quat_from_axis, quat_get_pitch, quat_multiply} from "../../lib/quat.js";
// import {Entity} from "../../lib/world.js";
// import {Game} from "../game.js";
// import {Has} from "../world.js";
//
// const QUERY = Has.Move | Has.ControlPlayer;
// const AXIS_Y: Vec3 = [0, 1, 0];
// const AXIS_X: Vec3 = [1, 0, 0];
// const DEAD_ZONE = 0.01;
// const TOUCH_SENSITIVITY = 10;
//
// // The position of the joystick center, given by the initial Touch0's x and y.
// const joystick: Vec2 = [0, 0];
// const rotation: Quat = [0, 0, 0, 0];
//
// export function sys_control_touch_move(game: Game, delta: number) {
//     if (game.InputDelta["Touch0"] === 1) {
//         // The center of the invisible joystick is given by the position of the
//         // first touch of the first finger on the screen's surface.
//         joystick[0] = game.InputState["Touch0X"];
//         joystick[1] = game.InputState["Touch0Y"];
//     }
//
//     for (let i = 0; i < game.World.Signature.length; i++) {
//         if ((game.World.Signature[i] & QUERY) === QUERY) {
//             update(game, i);
//         }
//     }
// }
//
// function update(game: Game, entity: Entity) {
//     let transform = game.World.Transform[entity];
//     let control = game.World.ControlPlayer[entity];
//     let move = game.World.Move[entity];
//     move.Direction[0] = 0;
//     move.Direction[1] = 0;
//     move.Direction[2] = 0; 
//
//     if (control.Move && game.InputState["Touch0"] === 1) {
//         let divisor = Math.min(game.ViewportWidth, game.ViewportHeight) / 4;
//         let amount_x = (game.InputState["Touch0X"] - joystick[0]) / divisor;
//         let amount_y = (game.InputState["Touch0Y"] - joystick[1]) / divisor;
//
//         if (Math.abs(amount_x) > DEAD_ZONE) {
//             // Strafe movement.
//             move.Direction[0] += clamp(-1, 1, -amount_x);
//         }
//         if (Math.abs(amount_y) > DEAD_ZONE) {
//             // Forward movement.
//             move.Direction[2] += clamp(-1, 1, -amount_y);
//         }
//     }
//
//     if (control.Yaw && game.InputDelta["Touch1X"]) {
//         let amount = game.InputDelta["Touch1X"] * control.Yaw * TOUCH_SENSITIVITY * DEG_TO_RAD;
//         // See sys_control_mouse.
//         quat_from_axis(rotation, AXIS_Y, -amount);
//         quat_multiply(transform.Rotation, rotation, transform.Rotation);
//         game.World.Signature[entity] |= Has.Dirty;
//     }
//
//     if (control.Pitch && game.InputDelta["Touch1Y"]) {
//         let current_pitch = quat_get_pitch(transform.Rotation);
//         let min_amount = control.MinPitch - current_pitch;
//         let max_amount = control.MaxPitch - current_pitch;
//
//         let amount = clamp(
//             min_amount,
//             max_amount,
//             game.InputDelta["Touch1Y"] * control.Pitch * TOUCH_SENSITIVITY,
//         );
//         quat_from_axis(rotation, AXIS_X, amount * DEG_TO_RAD);
//         // Pitch is post-multiplied, i.e. applied relative to the entity's self
//         // space; the X axis is always aligned with its left and right sides.
//         quat_multiply(transform.Rotation, transform.Rotation, rotation);
//         game.World.Signature[entity] |= Has.Dirty;
//     }
// }
// src/systems/sys_control_touch_move.ts
//
// import {DEG_TO_RAD, Quat, Vec3} from "../../lib/math.js";
// import {clamp} from "../../lib/number.js";
// import {quat_from_axis, quat_get_pitch, quat_multiply} from "../../lib/quat.js";
// import {Entity} from "../../lib/world.js";
// import {Game} from "../game.js";
// import {Has} from "../world.js";
//
// const QUERY = Has.Transform | Has.Move | Has.ControlPlayer;
// const AXIS_X: Vec3 = [1, 0, 0];
// const AXIS_Y: Vec3 = [0, 1, 0];
// const rotation: Quat = [0, 0, 0, 0];
// const TOUCH_SENSITIVITY = 1.5; // Adjusted for DeltaX/Y
//
// // Track the start position of the movement touch
// let joystick_x = 0;
// let joystick_y = 0;
// let is_moving = false;
// let current_touch_x = 0;
// let current_touch_y = 0;
//
// export function sys_control_touch_move(game: Game, delta: number) {
//     for (let i = 0; i < game.World.Signature.length; i++) {
//         if ((game.World.Signature[i] & QUERY) === QUERY) {
//             update(game, i);
//         }
//     }
// }
//
// function update(game: Game, entity: Entity) {
//     let control = game.World.ControlPlayer[entity];
//     let transform = game.World.Transform[entity];
//     let move = game.World.Move[entity];
//
//     // Reset move direction every frame
//     move.Direction = [0, 0, 0];
//
//     // Iterate through potential touches (Touch0, Touch1, etc.)
//     for (let t = 0; t < 2; t++) {
//         let state = game.InputState[`Touch${t}`];
//         if (!state) continue;
//
//         let x = game.InputState[`Touch${t}X`];
//         let y = game.InputState[`Touch${t}Y`];
//         let dx = game.InputDelta[`Touch${t}X`];
//         let dy = game.InputDelta[`Touch${t}Y`];
//
//         // LEFT SIDE = MOVEMENT
//         if (x < game.ViewportWidth / 2) {
//             // If this touch just started, set the joystick center
//             if (game.InputDelta[`Touch${t}`] === 1) {
//                 joystick_x = x;
//                 joystick_y = y;
//             }
//
//             let dist_x = (x - joystick_x) / (game.ViewportWidth / 8);
//             let dist_y = (y - joystick_y) / (game.ViewportHeight / 8);
//
//             move.Direction[0] -= clamp(-1, 1, dist_x); // Strafe
//             move.Direction[2] -= clamp(-1, 1, dist_y); // Forward/Back
//         } 
//
//         // RIGHT SIDE = PANNING
//         else {
//             if (control.Yaw && dx) {
//                 let amount = dx * control.Yaw * TOUCH_SENSITIVITY * DEG_TO_RAD;
//                 quat_from_axis(rotation, AXIS_Y, -amount);
//                 quat_multiply(transform.Rotation, rotation, transform.Rotation);
//             }
//
//             if (control.Pitch && dy) {
//                 let current_pitch = quat_get_pitch(transform.Rotation);
//                 let amount = clamp(control.MinPitch - current_pitch, control.MaxPitch - current_pitch, dy * control.Pitch * TOUCH_SENSITIVITY);
//                 quat_from_axis(rotation, AXIS_X, amount * DEG_TO_RAD);
//                 quat_multiply(transform.Rotation, transform.Rotation, rotation);
//             }
//           is_moving = false; // Reset flag each frame
//     for (let t = 0; t < 2; t++) {
//         let x = game.InputState[`Touch${t}X`];
//         let y = game.InputState[`Touch${t}Y`];
//
//         if (game.InputState[`Touch${t}`] && x < game.ViewportWidth / 2) {
//             is_moving = true;
//             current_touch_x = x;
//             current_touch_y = y;
//
//             if (game.InputDelta[`Touch${t}`] === 1) {
//                 joystick_x = x;
//                 joystick_y = y;
//             }
//
//             game.World.Signature[entity] |= Has.Dirty;
//         }
//     }
// }
// function draw_joystick(game: Game) {
//     const ctx = (game as any).ForegroundContext;
//     if (!ctx) return;
//
//     // Clear the 2D canvas every frame
//     ctx.clearRect(0, 0, game.ViewportWidth, game.ViewportHeight);
//
//     if (is_moving) {
//         // Draw Outer Circle (Base)
//         ctx.beginPath();
//         ctx.arc(joystick_x, joystick_y, 60, 0, Math.PI * 2);
//         ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
//         ctx.fill();
//         ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
//         ctx.lineWidth = 2;
//         ctx.stroke();
//
//         // Draw Inner Circle (Thumb)
//         // We limit the thumb position visually so it stays inside the base
//         let dx = current_touch_x - joystick_x;
//         let dy = current_touch_y - joystick_y;
//         let dist = Math.sqrt(dx * dx + dy * dy);
//         let max_dist = 40;
//
//         if (dist > max_dist) {
//             dx = (dx / dist) * max_dist;
//             dy = (dy / dist) * max_dist;
//         }
//
//         ctx.beginPath();
//         ctx.arc(joystick_x + dx, joystick_y + dy, 30, 0, Math.PI * 2);
//         ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
//         ctx.fill();
//     }
// }
import {DEG_TO_RAD, Quat, Vec3} from "../../lib/math.js";
import {clamp} from "../../lib/number.js";
import {quat_from_axis, quat_get_pitch, quat_multiply} from "../../lib/quat.js";
import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Transform | Has.Move | Has.ControlPlayer;
const AXIS_X: Vec3 = [1, 0, 0];
const AXIS_Y: Vec3 = [0, 1, 0];
const rotation: Quat = [0, 0, 0, 0];
const TOUCH_SENSITIVITY = 1.5; 

// UI State
let joystick_x = 0;
let joystick_y = 0;
let is_moving = false;
let current_touch_x = 0;
let current_touch_y = 0;

export function sys_control_touch_move(game: Game, delta: number) {
    // 1. Reset UI state for the new frame
    is_moving = false;

    // 2. Process all entities
    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) === QUERY) {
            update(game, i);
        }
    }

    // 3. Render the UI once per frame after all updates
    draw_joystick(game);
}

function update(game: Game, entity: Entity) {
    let control = game.World.ControlPlayer[entity];
    let transform = game.World.Transform[entity];
    let move = game.World.Move[entity];

    // Reset move direction every frame
    //move.Direction = [0, 0, 0];

    // Iterate through potential touches
    for (let t = 0; t < 2; t++) {
        let state = game.InputState[`Touch${t}`];
        if (!state) continue;

        let x = game.InputState[`Touch${t}X`];
        let y = game.InputState[`Touch${t}Y`];
        let dx = game.InputDelta[`Touch${t}X`];
        let dy = game.InputDelta[`Touch${t}Y`];

        // LEFT SIDE = MOVEMENT
        if (x < game.ViewportWidth / 2) {
            is_moving = true;
            current_touch_x = x;
            current_touch_y = y;

            if (game.InputDelta[`Touch${t}`] === 1) {
                joystick_x = x;
                joystick_y = y;
            }

            let dist_x = (x - joystick_x) / (game.ViewportWidth / 8);
            let dist_y = (y - joystick_y) / (game.ViewportHeight / 8);

            move.Direction[0] -= clamp(-1, 1, dist_x); // Strafe
            move.Direction[2] -= clamp(-1, 1, dist_y); // Forward/Back
        } 
        
        // RIGHT SIDE = PANNING
        else {
            if (control.Yaw && dx) {
                let amount = dx * control.Yaw * TOUCH_SENSITIVITY * DEG_TO_RAD;
                quat_from_axis(rotation, AXIS_Y, -amount);
                quat_multiply(transform.Rotation, rotation, transform.Rotation);
                game.World.Signature[entity] |= Has.Dirty;
            }

            if (control.Pitch && dy) {
                let current_pitch = quat_get_pitch(transform.Rotation);
                let amount = clamp(
                    control.MinPitch - current_pitch, 
                    control.MaxPitch - current_pitch, 
                    dy * control.Pitch * TOUCH_SENSITIVITY * DEG_TO_RAD
                );
                quat_from_axis(rotation, AXIS_X, amount);
                quat_multiply(transform.Rotation, transform.Rotation, rotation);
                game.World.Signature[entity] |= Has.Dirty;
            }
        }
    }
}

function draw_joystick(game: Game) {
    const ctx = (game as any).ForegroundContext;
    if (!ctx) return;

    // Clear the 2D canvas
    ctx.clearRect(0, 0, game.ViewportWidth, game.ViewportHeight);

    if (is_moving) {
        // Outer Circle
        ctx.beginPath();
        ctx.arc(joystick_x, joystick_y, 60, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner Circle (Thumb)
        let dx = current_touch_x - joystick_x;
        let dy = current_touch_y - joystick_y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        let max_dist = 40;
        
        if (dist > max_dist) {
            dx = (dx / dist) * max_dist;
            dy = (dy / dist) * max_dist;
        }

        ctx.beginPath();
        ctx.arc(joystick_x + dx, joystick_y + dy, 30, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fill();
    }
}
