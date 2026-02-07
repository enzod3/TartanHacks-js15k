import {Game} from "./game.js";
import {play_pickup} from "./sound.js";
import {start_wave} from "./systems/sys_enemy_spawn.js";
import {apply_upgrade} from "./systems/sys_upgrade_stations.js";

export const enum Action {
    ToggleFullscreen,
    PlayAgain,
    ChooseUpgrade,
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
        case Action.ChooseUpgrade: {
            let index = payload as number;
            let type = game.UpgradeChoices[index];
            if (type !== undefined) {
                apply_upgrade(game, type);
                play_pickup();
                game.UpgradeChoices = [];
                game.UpgradeLabels = [];
                start_wave(game);
            }
            break;
        }
    }
}
