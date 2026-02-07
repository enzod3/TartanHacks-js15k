import {html} from "../../lib/html.js";
import {Game} from "../game.js";
import {Fullscreen} from "./Fullscreen.js";

export function App(game: Game) {
    let hp_pct = Math.max(0, (game.PlayerHealth / game.PlayerMaxHealth) * 100);
    let bar_color = hp_pct > 50 ? "#4c4" : hp_pct > 25 ? "#cc4" : "#c44";
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
    </div>`;
}
