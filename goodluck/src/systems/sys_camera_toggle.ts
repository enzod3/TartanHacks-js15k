import {quat_slerp} from "../../lib/quat.js";
import {CameraChild} from "../blueprints/blu_camera_follow.js";
import {CameraAnchor, PlayerBodyParts} from "../blueprints/blu_player.js";
import {CameraMode, Game} from "../game.js";
import {Has} from "../world.js";

const TRANSITION_DURATION = 0.2;
const SHOW_BODY_AT = 0.15;
const HIDE_BODY_AT = 0.7;

const FP_POS: [number, number, number] = [0, 1.8, 0];
const FP_ROT: [number, number, number, number] = [0, 1, 0, 0];
const TD_POS: [number, number, number] = [0, 25, 0];
const TD_ROT: [number, number, number, number] = [0, 0.707, 0.707, 0];

let body_toggled = false;

export function switch_camera(game: Game, mode: CameraMode) {
    if (game.CameraMode === mode) return;

    let camera_transform = game.World.Transform[CameraChild];
    game.CameraMode = mode;

    game.CameraFromPos = [
        camera_transform.Translation[0],
        camera_transform.Translation[1],
        camera_transform.Translation[2],
    ];
    game.CameraFromRot = [
        camera_transform.Rotation[0],
        camera_transform.Rotation[1],
        camera_transform.Rotation[2],
        camera_transform.Rotation[3],
    ];

    if (mode === CameraMode.FirstPerson) {
        game.CameraTargetPos = [...FP_POS];
        game.CameraTargetRot = [...FP_ROT];
    } else {
        game.CameraTargetPos = [...TD_POS];
        game.CameraTargetRot = [...TD_ROT];

        let anchor_transform = game.World.Transform[CameraAnchor];
        anchor_transform.Rotation = [0, 0, 0, 1];
        game.World.Signature[CameraAnchor] |= Has.Dirty;
    }

    game.CameraTransition = 0;
    body_toggled = false;

    let control = game.World.ControlPlayer[CameraAnchor];
    control.Pitch = mode === CameraMode.FirstPerson ? 0.2 : 0;
}

export function sys_camera_toggle(game: Game, delta: number) {
    // Handle toggle input (only if no powerup timer active).
    if (game.InputDelta["KeyV"] === -1 && game.ThirdPersonTimer <= 0) {
        let target = game.CameraMode === CameraMode.TopDown ? CameraMode.FirstPerson : CameraMode.TopDown;
        switch_camera(game, target);
    }

    // Animate transition.
    if (game.CameraTransition < 1) {
        game.CameraTransition += delta / TRANSITION_DURATION;
        if (game.CameraTransition > 1) game.CameraTransition = 1;

        // Deferred body show/hide during transition.
        if (!body_toggled) {
            let threshold = game.CameraMode === CameraMode.TopDown ? SHOW_BODY_AT : HIDE_BODY_AT;
            if (game.CameraTransition >= threshold) {
                body_toggled = true;
                for (let part of PlayerBodyParts) {
                    if (game.CameraMode === CameraMode.FirstPerson) {
                        game.World.Signature[part] &= ~Has.Render;
                    } else {
                        game.World.Signature[part] |= Has.Render;
                    }
                }
            }
        }

        // Smooth ease-in-out.
        let t = game.CameraTransition;
        t = t * t * (3 - 2 * t);

        let camera_transform = game.World.Transform[CameraChild];

        camera_transform.Translation[0] = game.CameraFromPos[0] + (game.CameraTargetPos[0] - game.CameraFromPos[0]) * t;
        camera_transform.Translation[1] = game.CameraFromPos[1] + (game.CameraTargetPos[1] - game.CameraFromPos[1]) * t;
        camera_transform.Translation[2] = game.CameraFromPos[2] + (game.CameraTargetPos[2] - game.CameraFromPos[2]) * t;

        quat_slerp(camera_transform.Rotation, game.CameraFromRot, game.CameraTargetRot, t);

        game.World.Signature[CameraChild] |= Has.Dirty;
    }
}
