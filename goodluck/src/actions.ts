import {Game, WeaponType} from "./game.js";
import {start_wave} from "./systems/sys_enemy_spawn.js";

export const enum Action {
    ToggleFullscreen,
    UpgradeShotgun,
    UpgradeInfantryDamage,
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
        case Action.UpgradeShotgun: {
            game.Weapon = WeaponType.Shotgun;
            start_wave(game);
            break;
        }
        case Action.UpgradeInfantryDamage: {
            game.BulletDamage++;
            start_wave(game);
            break;
        }
    }
}
