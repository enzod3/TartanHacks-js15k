import {destroy_all} from "../components/com_children.js";
import {Game, Layer, CameraMode} from "../game.js";
import {Has} from "../world.js";
import {play_sound} from "../sound.js";
import {switch_camera} from "./sys_camera_toggle.js";

export function sys_powerup(game: Game, delta: number) {
    // Spin and bob the powerup.
    if (game.PowerupEntity >= 0 && game.World.Signature[game.PowerupEntity] !== Has.None) {
        let t = game.World.Transform[game.PowerupEntity];
        let angle = game.Now / 1000 * 2;
        t.Rotation[0] = 0;
        t.Rotation[1] = Math.sin(angle / 2);
        t.Rotation[2] = 0;
        t.Rotation[3] = Math.cos(angle / 2);
        t.Translation[1] = 0.3 + Math.sin(game.Now / 1000 * 3) * 0.2;
        game.World.Signature[game.PowerupEntity] |= Has.Dirty;
    }

    // Check pickup via player's collisions.
    if (game.PowerupEntity >= 0 && game.World.Signature[game.PowerupEntity] !== Has.None) {
        for (let i = 0; i < game.World.Signature.length; i++) {
            if (!(game.World.Signature[i] & Has.Collide)) continue;
            if (!(game.World.Collide[i].Layers & Layer.Player)) continue;

            let collide = game.World.Collide[i];
            for (let collision of collide.Collisions) {
                if (collision.Other === game.PowerupEntity) {
                    play_sound(600, 0.2);
                    play_sound(900, 0.15);
                    destroy_all(game.World, game.PowerupEntity);
                    game.PowerupEntity = -1;

                    if (game.CameraMode === CameraMode.FirstPerson) {
                        switch_camera(game, CameraMode.TopDown);
                    }
                    game.ThirdPersonTimer = 10;
                    break;
                }
            }
            if (game.PowerupEntity < 0) break;
        }
    }

    // Count down 3rd person timer.
    if (game.ThirdPersonTimer > 0) {
        game.ThirdPersonTimer -= delta;
        if (game.ThirdPersonTimer <= 0) {
            game.ThirdPersonTimer = 0;
            if (game.CameraMode === CameraMode.TopDown) {
                switch_camera(game, CameraMode.FirstPerson);
            }
        }
    }
}
