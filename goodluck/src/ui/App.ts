import {html} from "../../lib/html.js";
import {Enemies} from "../blueprints/blu_enemy.js";
import {Action} from "../actions.js";
import {Game, WaveState} from "../game.js";
const UPGRADE_DESCS: Record<string, string> = {
    "Rock Thrower": "Hurl boulders that pierce foes",
    "Shotgun": "Spread shot, close-range devastation",
    "Rifle Dmg+": "Increase rifle damage",
    "Dmg+": "Increase weapon damage",
    "Fire Rate+": "Shoot faster",
    "Continue": "Press on without upgrades",
    "Grenade": "Explosive that bursts into pellets",
};

function format_time(ms: number): string {
    let s = Math.floor(ms / 1000);
    let m = Math.floor(s / 60);
    s = s % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function App(game: Game) {
    if (game.WaveState === WaveState.Welcome) {
        return WelcomeOverlay();
    }
    if (game.WaveState === WaveState.Won) {
        return WonOverlay(game);
    }
    if (game.WaveState === WaveState.Dead) {
        return DeadOverlay(game);
    }

    let hp_pct = Math.max(0, (game.PlayerHealth / game.PlayerMaxHealth) * 100);
    let bar_color = hp_pct > 50 ? "#4c4" : hp_pct > 25 ? "#cc4" : "#c44";
    let remaining = Enemies.length + (game.WaveEnemiesTotal - game.WaveEnemiesSpawned);
    return html`<div>
        <div style="
            position:fixed;
            top:50%;left:50%;
            transform:translate(-50%,-50%);
            pointer-events:none;
            color:#fff;
            font-size:24px;
            text-shadow:0 0 4px rgba(0,0,0,0.8);
            line-height:1;
        ">${game.WaveState !== WaveState.Upgrading ? "+" : ""}</div>
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
        ${game.WaveState === WaveState.Upgrading ? UpgradeOverlay(game) : ""}
    </div>`;
}

function UpgradeOverlay(game: Game): string {
    let buttons = "";
    for (let i = 0; i < game.UpgradeLabels.length; i++) {
        let label = game.UpgradeLabels[i];
        let desc = UPGRADE_DESCS[label] || "";
        buttons += `<button
            onclick="$(${Action.ChooseUpgrade},${i})"
            style="
                pointer-events:auto;
                cursor:pointer;
                padding:14px 24px;
                margin:8px;
                min-width:180px;
                background:linear-gradient(180deg,#3a332b,#2a2520);
                border:2px solid #5a5040;
                border-radius:4px;
                color:#d4c8a0;
                font-family:Georgia,serif;
                font-size:18px;
                text-shadow:1px 1px 2px rgba(0,0,0,0.8);
                box-shadow:inset 0 1px 0 rgba(255,255,255,0.08),inset 0 -2px 4px rgba(0,0,0,0.5),0 2px 8px rgba(0,0,0,0.6);
            "
        ><div style="font-size:20px;margin-bottom:4px;">${label}</div><div style="font-size:12px;color:#a89870;">${desc}</div></button>`;
    }
    return `<div style="
        position:fixed;
        top:0;left:0;right:0;bottom:0;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        pointer-events:none;
        z-index:50;
    ">
        <div style="
            color:#d4c8a0;
            font-family:Georgia,serif;
            font-size:28px;
            margin-bottom:20px;
            text-shadow:0 0 10px rgba(0,0,0,0.9),0 2px 4px rgba(0,0,0,0.7);
            pointer-events:none;
        ">Choose Your Upgrade</div>
        <div style="display:flex;flex-wrap:wrap;justify-content:center;">
            ${buttons}
        </div>
    </div>`;
}

function get_top_html(game: Game, remaining: number): string {
    if (game.WaveState === WaveState.Upgrading) {
        return `Wave ${game.Wave} Complete`;
    }
    if (game.WaveState === WaveState.Evac) {
        return "Get to the Evac Point!";
    }
    return `Wave ${game.Wave} - ${remaining} remaining`;
}

function WonOverlay(game: Game) {
    let upgrades = game.UpgradesPicked.length > 0 ? game.UpgradesPicked.join(", ") : "None";
    let elapsed = format_time(game.EndTime - game.StartTime);
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
        <div style="color:#fff;font-size:20px;margin-bottom:10px;">
            Time: ${elapsed}
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

function WelcomeOverlay() {
    return html`<div style="
        position:fixed;top:0;left:0;right:0;bottom:0;
        background:rgba(0,0,0,0.7);
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        z-index:100;font-family:Georgia,serif;
    ">
        <div style="font-size:56px;color:#d4c8a0;text-shadow:0 0 20px rgba(180,60,20,0.8),0 4px 8px rgba(0,0,0,0.9);margin-bottom:24px;letter-spacing:4px;">Zom<span style="color:#c44;">BEACH</span></div>
        <div style="color:#a89870;font-size:13px;text-align:center;line-height:1.8;margin-bottom:24px;">
            Move left &bull; Look right &bull; Tap to shoot<br>4 waves &bull; Collect orbs &bull; Choose upgrades
        </div>
        <button onclick="$(${Action.StartGame})" style="
            pointer-events:auto;cursor:pointer;padding:14px 44px;
            background:linear-gradient(180deg,#3a332b,#2a2520);
            border:2px solid #5a5040;border-radius:6px;
            color:#d4c8a0;font-family:Georgia,serif;font-size:22px;letter-spacing:2px;
            text-shadow:1px 1px 2px rgba(0,0,0,0.8);
            box-shadow:inset 0 1px 0 rgba(255,255,255,0.08),inset 0 -2px 4px rgba(0,0,0,0.5),0 2px 12px rgba(0,0,0,0.6);
        ">START</button>
    </div>`;
}

function DeadOverlay(game: Game) {
    let elapsed = format_time(game.EndTime - game.StartTime);
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
        <div style="color:#c44;font-size:36px;margin-bottom:20px;text-shadow:0 0 12px rgba(255,0,0,0.6);">
            You Died
        </div>
        <div style="color:#fff;font-size:20px;margin-bottom:10px;">
            Survived: ${elapsed}
        </div>
        <div style="color:#fff;font-size:20px;margin-bottom:10px;">
            Wave: ${game.Wave} / ${game.MaxWaves}
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
                background:#c44;
                color:#fff;
                border:none;
                border-radius:8px;
                font-size:22px;
                cursor:pointer;
            "
        >Try Again</button>
    </div>`;
}
