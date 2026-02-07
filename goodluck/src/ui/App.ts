import {html} from "../../lib/html.js";
import {Game} from "../game.js";
import {Fullscreen} from "./Fullscreen.js";

export function App(game: Game) {
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
    </div>`;
}
