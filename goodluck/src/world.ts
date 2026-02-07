import {WorldImpl} from "../lib/world.js";
import {Camera} from "./components/com_camera.js";
import {Children} from "./components/com_children.js";
import {Collide} from "./components/com_collide.js";
import {ControlPlayer} from "./components/com_control_player.js";
import {Lifespan} from "./components/com_lifespan.js";
import {Light} from "./components/com_light.js";
import {Mimic} from "./components/com_mimic.js";
import {Move} from "./components/com_move.js";
import {Render} from "./components/com_render.js";
import {RigidBody} from "./components/com_rigid_body.js";
import {Transform} from "./components/com_transform.js";

const enum Component {
    Camera,
    Children,
    Collide,
    ControlPlayer,
    Dirty,
    Lifespan,
    Light,
    Mimic,
    Move,
    Render,
    RigidBody,
    Transform,
}

export const enum Has {
    None = 0,
    Camera = 1 << Component.Camera,
    Children = 1 << Component.Children,
    Collide = 1 << Component.Collide,
    ControlPlayer = 1 << Component.ControlPlayer,
    Dirty = 1 << Component.Dirty,
    Lifespan = 1 << Component.Lifespan,
    Light = 1 << Component.Light,
    Mimic = 1 << Component.Mimic,
    Move = 1 << Component.Move,
    Render = 1 << Component.Render,
    RigidBody = 1 << Component.RigidBody,
    Transform = 1 << Component.Transform,
}

export class World extends WorldImpl {
    Camera: Array<Camera> = [];
    Children: Array<Children> = [];
    Collide: Array<Collide> = [];
    ControlPlayer: Array<ControlPlayer> = [];
    Lifespan: Array<Lifespan> = [];
    Light: Array<Light> = [];
    Mimic: Array<Mimic> = [];
    Move: Array<Move> = [];
    Render: Array<Render> = [];
    RigidBody: Array<RigidBody> = [];
    Transform: Array<Transform> = [];
}
