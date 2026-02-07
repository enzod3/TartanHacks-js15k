import {UpgradeType} from "../blueprints/blu_upgrade_station.js";
import {Game, Layer, WaveState, WeaponType} from "../game.js";
import {Has} from "../world.js";

// Evac entity for the ladder.
export let EvacEntity: number = -1;

export function set_evac_entity(e: number) {
    EvacEntity = e;
}

export function sys_upgrade_stations(game: Game, delta: number) {
    if (game.WaveState === WaveState.Evac) {
        // Spin/bob the evac ladder.
        if (EvacEntity >= 0 && game.World.Signature[EvacEntity] !== Has.None) {
            let t = game.World.Transform[EvacEntity];
            let angle = game.Now / 1000 * 1.5;
            t.Rotation[0] = 0;
            t.Rotation[1] = Math.sin(angle / 2);
            t.Rotation[2] = 0;
            t.Rotation[3] = Math.cos(angle / 2);
            t.Translation[1] = 0.1 + Math.sin(game.Now / 1000 * 2) * 0.15;
            game.World.Signature[EvacEntity] |= Has.Dirty;
        }

        // Check player collision with evac.
        for (let i = 0; i < game.World.Signature.length; i++) {
            if (!(game.World.Signature[i] & Has.Collide)) continue;
            if (!(game.World.Collide[i].Layers & Layer.Player)) continue;

            let collide = game.World.Collide[i];
            for (let collision of collide.Collisions) {
                if (collision.Other === EvacEntity) {
                    game.WaveState = WaveState.Won;
                    game.EndTime = Date.now();
                    game.Paused = true;
                    document.exitPointerLock();
                    return;
                }
            }
        }
    }
}

export function apply_upgrade(game: Game, type: UpgradeType) {
    switch (type) {
        case UpgradeType.Thrower:
            game.Weapon = WeaponType.Thrower;
            game.UpgradesPicked.push("Thrower");
            break;
        case UpgradeType.Shotgun:
            game.Weapon = WeaponType.Shotgun;
            game.UpgradesPicked.push("Shotgun");
            break;
        case UpgradeType.InfantryDmg:
            game.BulletDamage++;
            game.UpgradesPicked.push("Dmg+");
            break;
        case UpgradeType.DamageUp:
            game.BulletDamage++;
            game.UpgradesPicked.push("Dmg+");
            break;
        case UpgradeType.FireRateUp:
            game.FireRateMultiplier *= 0.75;
            game.UpgradesPicked.push("Fire Rate+");
            break;
        case UpgradeType.Continue:
            game.UpgradesPicked.push("Continue");
            break;
    }
}
