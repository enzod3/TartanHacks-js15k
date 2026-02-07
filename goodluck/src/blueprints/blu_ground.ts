import {collide} from "../components/com_collide.js";
import {RigidKind, rigid_body} from "../components/com_rigid_body.js";
import {transform} from "../components/com_transform.js";
import {Game, Layer} from "../game.js";

export function blueprint_ground(game: Game) {
    return [
        transform(),
        collide(false, Layer.Ground, Layer.None),
        rigid_body(RigidKind.Static),
    ];
}
