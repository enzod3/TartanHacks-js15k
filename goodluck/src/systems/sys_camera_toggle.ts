import {CameraChild} from "../blueprints/blu_camera_follow.js";
import {CameraAnchor, PlayerBodyParts} from "../blueprints/blu_player.js";
import {CameraMode, Game} from "../game.js";
import {Has} from "../world.js";

export function sys_camera_toggle(game: Game, delta: number) {
    if (game.InputDelta["KeyV"] === -1) {
        game.CameraMode =
            game.CameraMode === CameraMode.TopDown ? CameraMode.FirstPerson : CameraMode.TopDown;

        let camera_transform = game.World.Transform[CameraChild];
        if (game.CameraMode === CameraMode.FirstPerson) {
            // First person: at bean head level, looking forward (180° Y rotation).
            camera_transform.Translation = [0, 1.8, 0];
            camera_transform.Rotation = [0, 1, 0, 0];
        } else {
            // Top-down bird's eye: high above, looking straight down.
            camera_transform.Translation = [0, 25, 0];
            camera_transform.Rotation = [-0.707, 0, 0, 0.707];
        }
        game.World.Signature[CameraChild] |= Has.Dirty;

        // Enable pitch control only in first person.
        let control = game.World.ControlPlayer[CameraAnchor];
        control.Pitch = game.CameraMode === CameraMode.FirstPerson ? 0.2 : 0;

        // Reset anchor rotation for clean top-down view.
        if (game.CameraMode === CameraMode.TopDown) {
            let anchor_transform = game.World.Transform[CameraAnchor];
            anchor_transform.Rotation = [0, 0, 0, 1];
            game.World.Signature[CameraAnchor] |= Has.Dirty;
        }

        // Hide/show player body in first person to prevent clipping.
        for (let part of PlayerBodyParts) {
            if (game.CameraMode === CameraMode.FirstPerson) {
                game.World.Signature[part] &= ~Has.Render;
            } else {
                game.World.Signature[part] |= Has.Render;
            }
        }
    }
}
