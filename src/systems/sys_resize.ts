import {mat4_from_perspective, mat4_invert} from "../../lib/mat4.js";
import {Projection, ProjectionKind} from "../../lib/projection.js";
import {CameraKind} from "../components/com_camera.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Camera;

export function sys_resize(game: Game, delta: number) {
    if (game.ViewportWidth != window.innerWidth || game.ViewportHeight != window.innerHeight) {
        game.ViewportResized = true;
    }

    if (game.ViewportResized) {
        game.ViewportWidth =
            game.BackgroundCanvas.width =
            game.SceneCanvas.width =
            game.ForegroundCanvas.width =
                window.innerWidth;
        game.ViewportHeight =
            game.BackgroundCanvas.height =
            game.SceneCanvas.height =
            game.ForegroundCanvas.height =
                window.innerHeight;

        for (let i = 0; i < game.World.Signature.length; i++) {
            if ((game.World.Signature[i] & QUERY) === QUERY) {
                let camera = game.World.Camera[i];
                switch (camera.Kind) {
                    case CameraKind.Canvas:
                        camera.ViewportWidth = game.ViewportWidth;
                        camera.ViewportHeight = game.ViewportHeight;
                        update_projection(
                            camera.Projection,
                            game.ViewportWidth / game.ViewportHeight,
                        );
                        break;
                }
            }
        }
    }
}

function update_projection(projection: Projection, aspect: number) {
    switch (projection.Kind) {
        case ProjectionKind.Perspective: {
            if (aspect < 1) {
                // Portrait orientation.
                mat4_from_perspective(
                    projection.Projection,
                    projection.FovY / aspect,
                    aspect,
                    projection.Near,
                    projection.Far,
                );
            } else {
                // Landscape orientation.
                mat4_from_perspective(
                    projection.Projection,
                    projection.FovY,
                    aspect,
                    projection.Near,
                    projection.Far,
                );
            }
            break;
        }
    }

    mat4_invert(projection.Inverse, projection.Projection);
}
