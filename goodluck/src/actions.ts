import {Game} from "./game.js";

export const enum Action {
    ToggleFullscreen,
    PlayAgain,
}

export function dispatch(game: Game, action: Action, payload: unknown) {
    switch (action) {
        case Action.ToggleFullscreen: {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                document.body.requestFullscreen();
            }
            break;
        }
        case Action.PlayAgain: {
            location.reload();
            break;
        }
    }
}
