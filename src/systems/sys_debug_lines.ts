import {GL_ARRAY_BUFFER, GL_FLOAT, GL_LINES} from "../../lib/webgl.js";
import {CameraKind} from "../components/com_camera.js";
import {Game} from "../game.js";

// Inline shader sources.
const VS = `#version 300 es
uniform mat4 pv;
in vec3 p;
in vec3 c;
out vec3 vc;
void main(){vc=c;gl_Position=pv*vec4(p,1.0);}`;

const FS = `#version 300 es
precision mediump float;
in vec3 vc;
out vec4 fc;
void main(){fc=vec4(vc,1.0);}`;

let prog: WebGLProgram | null = null;
let loc_pv: WebGLUniformLocation;
let vbo: WebGLBuffer;
let vao: WebGLVertexArrayObject;

// Line data: each line = 2 vertices, each vertex = 3 pos + 3 color = 6 floats.
let data: number[] = [];

/** Queue a debug line (world space). Color is [r, g, b] 0..1. */
export function debug_line(
    x0: number,
    y0: number,
    z0: number,
    x1: number,
    y1: number,
    z1: number,
    r: number,
    g: number,
    b: number,
) {
    data.push(x0, y0, z0, r, g, b, x1, y1, z1, r, g, b);
}

export function sys_debug_lines(game: Game, _delta: number) {
    if (data.length === 0) return;

    let gl = game.Gl;

    // Lazy init.
    if (!prog) {
        let vs = gl.createShader(gl.VERTEX_SHADER)!;
        gl.shaderSource(vs, VS);
        gl.compileShader(vs);
        let fs = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(fs, FS);
        gl.compileShader(fs);
        prog = gl.createProgram()!;
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.bindAttribLocation(prog, 0, "p");
        gl.bindAttribLocation(prog, 1, "c");
        gl.linkProgram(prog);
        loc_pv = gl.getUniformLocation(prog, "pv")!;
        vbo = gl.createBuffer()!;
        vao = gl.createVertexArray()!;
        gl.bindVertexArray(vao);
        gl.bindBuffer(GL_ARRAY_BUFFER, vbo);
        // position
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, GL_FLOAT, false, 24, 0);
        // color
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, GL_FLOAT, false, 24, 12);
        gl.bindVertexArray(null);
    }

    // Find camera Pv.
    let camera_entity = game.Cameras[0];
    if (camera_entity === undefined) {
        data.length = 0;
        return;
    }
    let camera = game.World.Camera[camera_entity];
    if (camera.Kind === CameraKind.Xr) {
        data.length = 0;
        return;
    }

    gl.useProgram(prog);
    gl.uniformMatrix4fv(loc_pv, false, camera.Pv);

    gl.bindVertexArray(vao);
    gl.bindBuffer(GL_ARRAY_BUFFER, vbo);
    gl.bufferData(GL_ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);

    gl.disable(gl.DEPTH_TEST);
    gl.drawArrays(GL_LINES, 0, data.length / 6);
    gl.enable(gl.DEPTH_TEST);

    gl.bindVertexArray(null);

    data.length = 0;
}
