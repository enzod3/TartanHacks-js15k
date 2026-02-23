import {Game} from "../game.js";

export function setup_joystick(game: Game) {
    let size = 120;
    let thumb_size = 50;
    let radius = size / 2;
    let max_dist = radius - thumb_size / 2;

    let base = document.createElement("div");
    base.style.cssText = `
        position:fixed;
        bottom:20px;
        left:20px;
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        background:rgba(255,255,255,0.15);
        border:2px solid rgba(255,255,255,0.3);
        touch-action:none;
        z-index:100;
    `;

    let thumb = document.createElement("div");
    thumb.style.cssText = `
        position:absolute;
        width:${thumb_size}px;
        height:${thumb_size}px;
        border-radius:50%;
        background:rgba(255,255,255,0.4);
        top:${(size - thumb_size) / 2}px;
        left:${(size - thumb_size) / 2}px;
        pointer-events:none;
    `;
    base.appendChild(thumb);
    document.body.appendChild(base);

    let active_touch: number | null = null;
    let center_x = 0;
    let center_y = 0;

    function move_thumb(dx: number, dy: number) {
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > max_dist) {
            dx = (dx / dist) * max_dist;
            dy = (dy / dist) * max_dist;
            dist = max_dist;
        }
        game.JoystickX = dx / max_dist;
        game.JoystickY = dy / max_dist;
        thumb.style.transform = `translate(${dx}px,${dy}px)`;
    }

    base.addEventListener("touchstart", (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        let touch = evt.changedTouches[0];
        active_touch = touch.identifier;
        let rect = base.getBoundingClientRect();
        center_x = rect.left + radius;
        center_y = rect.top + radius;
        move_thumb(touch.clientX - center_x, touch.clientY - center_y);
    });

    base.addEventListener("touchmove", (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        for (let i = 0; i < evt.changedTouches.length; i++) {
            let touch = evt.changedTouches[i];
            if (touch.identifier === active_touch) {
                move_thumb(touch.clientX - center_x, touch.clientY - center_y);
            }
        }
    });

    let reset = (evt: TouchEvent) => {
        evt.preventDefault();
        evt.stopPropagation();
        for (let i = 0; i < evt.changedTouches.length; i++) {
            if (evt.changedTouches[i].identifier === active_touch) {
                active_touch = null;
                game.JoystickX = 0;
                game.JoystickY = 0;
                thumb.style.transform = "translate(0px,0px)";
            }
        }
    };

    base.addEventListener("touchend", reset);
    base.addEventListener("touchcancel", reset);
}
