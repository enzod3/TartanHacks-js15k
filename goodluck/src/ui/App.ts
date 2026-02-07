import {html} from "../../lib/html.js";
import {Enemies} from "../blueprints/blu_enemy.js";
import {Action} from "../actions.js";
import {Game, WaveState} from "../game.js";
import {Fullscreen} from "./Fullscreen.js";

export function App(game: Game) {
    if (game.WaveState === WaveState.Won) {
        return WonOverlay(game);
    }

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
            text-align:center;
        ">${get_top_html(game, remaining)}</div>
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
        ${game.ThirdPersonTimer > 0 ? html`<div style="
            position:fixed;
            top:40px;left:50%;
            transform:translateX(-50%);
            pointer-events:none;
            color:#3ff;
            font-size:16px;
            font-family:Arial,sans-serif;
            text-shadow:0 0 8px rgba(0,200,255,0.8);
        ">3rd Person: ${Math.ceil(game.ThirdPersonTimer)}s</div>` : ""}
    </div>`;
}

function get_top_html(game: Game, remaining: number): string {
    if (game.WaveState === WaveState.Upgrading) {
        let labels = game.UpgradeLabels;
        let choices = labels.join("  |  ");
        return `Choose Your Upgrade<br><span style="font-size:14px;color:#ff0">${choices}</span>`;
    }
    if (game.WaveState === WaveState.Evac) {
        return "Get to the Evac Point!";
    }
    return `Wave ${game.Wave} - ${remaining} remaining`;
}

function WonOverlay(game: Game) {
    let upgrades = game.UpgradesPicked.length > 0 ? game.UpgradesPicked.join(", ") : "None";
    return html`<div style="
        position:fixed;
        top:0;left:0;right:0;bottom:0;
        background:rgba(0,0,0,0.85);
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        font-family:Arial,sans-serif;
        z-index:100;
    ">
        <div style="color:#4f4;font-size:36px;margin-bottom:20px;text-shadow:0 0 12px rgba(0,255,0,0.6);">
            You Escaped!
        </div>
        <div style="color:#fff;font-size:20px;margin-bottom:10px;">
            Waves Survived: ${game.MaxWaves}
        </div>
        <div style="color:#fff;font-size:20px;margin-bottom:10px;">
            Total Kills: ${game.TotalKills}
        </div>
        <div style="color:#ccc;font-size:16px;margin-bottom:30px;">
            Upgrades: ${upgrades}
        </div>
        <button
            onclick="$(${Action.PlayAgain})"
            style="
                padding:15px 40px;
                background:#4a4;
                color:#fff;
                border:none;
                border-radius:8px;
                font-size:22px;
                cursor:pointer;
            "
        >Play Again</button>
    </div>`;
}
