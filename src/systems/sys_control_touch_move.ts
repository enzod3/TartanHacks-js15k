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
let right_touch_id: number | null = null;
let right_touch_x = 0;
let right_touch_y = 0;
let is_dragging_right = false;

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

    for (let t = 0; t < 2; t++) {
        let state = game.InputState[`Touch${t}`];

        // Handle touch release for shooting
        if (game.InputDelta[`Touch${t}`] === -1 && t === right_touch_id) {
            // If the finger was lifted and we never dragged far enough to pan, SHOOT!
            if (!is_dragging_right) {
                game.InputState["TapShoot"] = 1;
            }
            right_touch_id = null;
            is_dragging_right = false;
        }

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

            move.Direction[0] -= clamp(-1, 1, dist_x);
            move.Direction[2] -= clamp(-1, 1, dist_y);
        }

        // RIGHT SIDE = DUAL ACTION (PAN OR TAP)
        else {
            // Initialize tracking for a new touch
            if (game.InputDelta[`Touch${t}`] === 1) {
                right_touch_id = t;
                right_touch_x = x;
                right_touch_y = y;
                is_dragging_right = false;
            }

            // Calculate distance from start to see if we should start panning
            let total_dist = Math.sqrt(Math.pow(x - right_touch_x, 2) + Math.pow(y - right_touch_y, 2));

            // If we move more than 10 pixels, consider it a pan/drag
            if (total_dist > 10) {
                is_dragging_right = true;
            }

            if (is_dragging_right) {
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
