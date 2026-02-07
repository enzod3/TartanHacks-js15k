import type {RenderTarget} from "./framebuffer.js";
import {GL_CULL_FACE, GL_DEPTH_TEST, GL_ONE_MINUS_SRC_ALPHA, GL_SRC_ALPHA} from "./webgl.js";
import {Entity, WorldImpl, create_entity} from "./world.js";

export abstract class GameImpl {
    Running = 0;
    Now = 0;

    abstract World: WorldImpl;

    ViewportWidth = window.innerWidth;
    ViewportHeight = window.innerHeight;
    ViewportResized = true;

    InputState: Record<string, number> = {
        MouseX: 0,
        MouseY: 0,
    };
    InputDelta: Record<string, number> = {
        MouseX: 0,
        MouseY: 0,
    };
    InputTouches: Record<string, number> = {};

    Ui = document.querySelector("main")!;

    constructor() {
        document.addEventListener("visibilitychange", () =>
            document.hidden ? this.Stop() : this.Start(),
        );

        this.Ui.addEventListener("contextmenu", (evt) => evt.preventDefault());

        this.Ui.addEventListener("mousedown", (evt) => {
            this.InputState[`Mouse${evt.button}`] = 1;
            this.InputDelta[`Mouse${evt.button}`] = 1;
        });
        this.Ui.addEventListener("mouseup", (evt) => {
            this.InputState[`Mouse${evt.button}`] = 0;
            this.InputDelta[`Mouse${evt.button}`] = -1;
        });
        this.Ui.addEventListener("mousemove", (evt) => {
            this.InputState["MouseX"] = evt.clientX;
            this.InputState["MouseY"] = evt.clientY;
            this.InputDelta["MouseX"] = evt.movementX;
            this.InputDelta["MouseY"] = evt.movementY;
        });
        this.Ui.addEventListener("wheel", (evt) => {
            evt.preventDefault();
            this.InputDelta["WheelY"] = evt.deltaY;
        });

        this.Ui.addEventListener("touchstart", (evt) => {
            if (evt.target === this.Ui) {
                evt.preventDefault();
            }

            if (evt.touches.length === 1) {
                this.InputTouches = {};
            }
            for (let i = 0; i < evt.touches.length; i++) {
                let touch = evt.touches[i];
                this.InputTouches[touch.identifier] = i;
            }
            for (let i = 0; i < evt.changedTouches.length; i++) {
                let touch = evt.changedTouches[i];
                let index = this.InputTouches[touch.identifier];
                this.InputState[`Touch${index}`] = 1;
                this.InputState[`Touch${index}X`] = touch.clientX;
                this.InputState[`Touch${index}Y`] = touch.clientY;
                this.InputDelta[`Touch${index}`] = 1;
                this.InputDelta[`Touch${index}X`] = 0;
                this.InputDelta[`Touch${index}Y`] = 0;
            }
        });
        this.Ui.addEventListener("touchmove", (evt) => {
            if (evt.target === this.Ui) {
                evt.preventDefault();
            }

            for (let i = 0; i < evt.changedTouches.length; i++) {
                let touch = evt.changedTouches[i];
                let index = this.InputTouches[touch.identifier];
                this.InputDelta[`Touch${index}X`] =
                    touch.clientX - this.InputState[`Touch${index}X`];
                this.InputDelta[`Touch${index}Y`] =
                    touch.clientY - this.InputState[`Touch${index}Y`];
                this.InputState[`Touch${index}X`] = touch.clientX;
                this.InputState[`Touch${index}Y`] = touch.clientY;
            }
        });
        this.Ui.addEventListener("touchend", (evt) => {
            if (evt.target === this.Ui) {
                evt.preventDefault();
            }

            for (let i = 0; i < evt.changedTouches.length; i++) {
                let touch = evt.changedTouches[i];
                let index = this.InputTouches[touch.identifier];
                this.InputState[`Touch${index}`] = 0;
                this.InputDelta[`Touch${index}`] = -1;
            }
        });
        this.Ui.addEventListener("touchcancel", (evt) => {
            for (let i = 0; i < evt.changedTouches.length; i++) {
                let touch = evt.changedTouches[i];
                let index = this.InputTouches[touch.identifier];
                this.InputState[`Touch${index}`] = 0;
                this.InputDelta[`Touch${index}`] = -1;
            }
        });

        window.addEventListener("keydown", (evt) => {
            if (!evt.repeat) {
                this.InputState[evt.code] = 1;
                this.InputDelta[evt.code] = 1;
            }
        });
        window.addEventListener("keyup", (evt) => {
            this.InputState[evt.code] = 0;
            this.InputDelta[evt.code] = -1;
        });
    }

    Start() {
        let last = performance.now();

        let tick = (now: number) => {
            let delta = (now - last) / 1000;
            last = now;

            this.Running = requestAnimationFrame(tick);

            this.Now = performance.now();
            this.FrameUpdate(delta);
            this.FrameReset(delta);
        };

        requestAnimationFrame(tick);
    }

    Stop() {
        cancelAnimationFrame(this.Running);
        this.Running = 0;
    }

    FrameUpdate(delta: number) {}

    FrameReset(delta: number) {
        this.ViewportResized = false;

        for (let name in this.InputDelta) {
            this.InputDelta[name] = 0;
        }
    }
}

export abstract class Game3D extends GameImpl {
    BackgroundCanvas = document.querySelector("#background")! as HTMLCanvasElement;
    BackgroundContext = this.BackgroundCanvas.getContext("2d")!;

    ForegroundCanvas = document.querySelector("#foreground")! as HTMLCanvasElement;
    ForegroundContext = this.ForegroundCanvas.getContext("2d")!;

    SceneCanvas = document.querySelector("#scene")! as HTMLCanvasElement;
    Gl = this.SceneCanvas.getContext("webgl2")!;

    Audio = new AudioContext();
    Cameras: Array<Entity> = [];
    Targets: Record<string, RenderTarget> = {};

    constructor() {
        super();

        this.Gl.enable(GL_DEPTH_TEST);
        this.Gl.enable(GL_CULL_FACE);

        this.Gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    }
}

type Mixin<G extends GameImpl> = (game: G, entity: Entity) => void;
export type Blueprint<G extends GameImpl> = Array<Mixin<G>>;

export function instantiate<G extends GameImpl>(game: G, blueprint: Blueprint<G>) {
    let entity = create_entity(game.World);
    for (let mixin of blueprint) {
        mixin(game, entity);
    }
    return entity;
}
