import {html} from "../../lib/html.js";
import {Enemies} from "../blueprints/blu_enemy.js";
import {Action} from "../actions.js";
import {Game, WaveState, WeaponType} from "../game.js";
import {Fullscreen} from "./Fullscreen.js";

export function App(game: Game) {
    let hp_pct = Math.max(0, (game.PlayerHealth / game.PlayerMaxHealth) * 100);
    let bar_color = hp_pct > 50 ? "#4c4" : hp_pct > 25 ? "#cc4" : "#c44";
    let remaining = Enemies.length + (game.WaveEnemiesTotal - game.WaveEnemiesSpawned);
    return html`<div>
        ${Fullscreen()}
        <div style="
            position:fixed;
            top:50%;left:50%;
            transform:translate(-50%,-50%);
            pointer-events:none;
            color:#fff;
            font-size:24px;
            text-shadow:0 0 4px rgba(0,0,0,0.8);
            line-height:1;
        ">+</div>
        <div style="
            position:fixed;
            top:10px;left:50%;
            transform:translateX(-50%);
            pointer-events:none;
            color:#fff;
            font-size:18px;
            font-family:Arial,sans-serif;
            text-shadow:0 0 6px rgba(0,0,0,0.9);
        ">Wave ${game.Wave} - ${remaining} remaining</div>
        <div style="
            position:fixed;
            bottom:20px;left:50%;
            transform:translateX(-50%);
            pointer-events:none;
            width:200px;
        ">
            <div style="
                border-radius:4px;
                height:16px;
                overflow:hidden;
            ">
                <div style="
                    background:${bar_color};
                    width:${hp_pct}%;
                    height:100%;
                    transition:width 0.2s;
                "></div>
            </div>
            <div style="
                text-align:center;
                color:#fff;
                font-size:12px;
                margin-top:2px;
                text-shadow:0 0 4px rgba(0,0,0,0.8);
            ">${game.PlayerHealth} / ${game.PlayerMaxHealth}</div>
        </div>
        ${game.WaveState === WaveState.Upgrading ? UpgradeOverlay(game) : ""}
    </div>`;
}

function UpgradeOverlay(game: Game) {
    return html`<div style="
        position:fixed;
        top:0;left:0;right:0;bottom:0;
        background:rgba(0,0,0,0.7);
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        font-family:Arial,sans-serif;
        z-index:100;
    ">
        <div style="color:#fff;font-size:28px;margin-bottom:30px;text-shadow:0 0 8px rgba(0,0,0,0.9);">
            Wave ${game.Wave} Complete!
        </div>
        <div style="display:flex;gap:20px;">
            ${game.Weapon !== WeaponType.Shotgun ? html`<button
                onclick="$(${Action.UpgradeShotgun})"
                style="
                    padding:20px 30px;
                    background:#c33;
                    color:#fff;
                    border:none;
                    border-radius:8px;
                    font-size:20px;
                    cursor:pointer;
                "
            >Shotgunner</button>` : ""}
            <button
                onclick="$(${Action.UpgradeInfantryDamage})"
                style="
                    padding:20px 30px;
                    background:#36c;
                    color:#fff;
                    border:none;
                    border-radius:8px;
                    font-size:20px;
                    cursor:pointer;
                "
            >Dmg + (${game.BulletDamage} &rarr; ${game.BulletDamage + 1})</button>
        </div>
    </div>`;
}
