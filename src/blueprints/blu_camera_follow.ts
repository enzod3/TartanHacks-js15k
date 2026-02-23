import {Entity} from "../../lib/world.js";
import {perspective} from "../../lib/projection.js";
import {callback} from "../components/com_callback.js";
import {camera_canvas} from "../components/com_camera.js";
import {children} from "../components/com_children.js";
import {mimic} from "../components/com_mimic.js";
import {transform} from "../components/com_transform.js";
import {Game} from "../game.js";

export let CameraChild: Entity;

export function blueprint_camera_follow(game: Game, target: Entity) {
    return [
        transform(),
        mimic(target, 1),
        children([
            // First-person default: at bean head level, looking forward.
            transform([0, 1.8, 0], [0, 1, 0, 0]),
            camera_canvas(perspective(1, 0.1, 1000), [0.01, 0.02, 0.05, 1]),
            callback((_game, entity) => (CameraChild = entity)),
        ]),
    ];
}
