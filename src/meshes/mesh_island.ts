import {Mesh} from "../../lib/mesh.js";
import {GL_ARRAY_BUFFER, GL_ELEMENT_ARRAY_BUFFER, GL_FLOAT, GL_STATIC_DRAW} from "../../lib/webgl.js";
import {Attribute} from "../../materials/layout.js";

export function mesh_island(gl: WebGL2RenderingContext, res = 32, height = 1.5, radius = 0.4): Mesh {
    // Plateau shape: flat top (d < edge_start), curved sides (d >= edge_start).
    let edge_start = 0.55;
    let verts = (res + 1) * (res + 1);
    let vertex_arr = new Float32Array(verts * 3);
    let normal_arr = new Float32Array(verts * 3);
    let texcoord_arr = new Float32Array(verts * 2);
    let weights_arr = new Float32Array(0);
    let index_arr = new Uint16Array(res * res * 6);

    for (let z = 0; z <= res; z++) {
        for (let x = 0; x <= res; x++) {
            let i = z * (res + 1) + x;

            // Position in -0.5..0.5 range.
            let px = x / res - 0.5;
            let pz = z / res - 0.5;

            // Distance from center, normalized to radius.
            let d = Math.sqrt(px * px + pz * pz) / radius;

            // Plateau with smooth curved edges.
            let h: number;
            if (d >= 1) {
                h = 0;
            } else if (d <= edge_start) {
                h = height;
            } else {
                // Smoothstep falloff from edge_start to 1.
                let t = (d - edge_start) / (1 - edge_start);
                let s = t * t * (3 - 2 * t);
                h = height * (1 - s);
            }

            vertex_arr[i * 3] = px;
            vertex_arr[i * 3 + 1] = h;
            vertex_arr[i * 3 + 2] = pz;

            // Compute normal via finite differences.
            let dhdx = 0, dhdz = 0;
            if (d > edge_start && d < 1) {
                let t = (d - edge_start) / (1 - edge_start);
                let ds_dt = 6 * t * (1 - t);
                let dt_dd = 1 / ((1 - edge_start) * radius);
                let dhdd = -height * ds_dt * dt_dd;
                dhdx = dhdd * (px / (d * radius));
                dhdz = dhdd * (pz / (d * radius));
            }
            let nl = Math.sqrt(dhdx * dhdx + 1 + dhdz * dhdz);
            normal_arr[i * 3] = -dhdx / nl;
            normal_arr[i * 3 + 1] = 1 / nl;
            normal_arr[i * 3 + 2] = -dhdz / nl;

            texcoord_arr[i * 2] = x / res;
            texcoord_arr[i * 2 + 1] = z / res;
        }
    }

    let idx = 0;
    for (let z = 0; z < res; z++) {
        for (let x = 0; x < res; x++) {
            let tl = z * (res + 1) + x;
            let tr = tl + 1;
            let bl = tl + (res + 1);
            let br = bl + 1;
            index_arr[idx++] = tl;
            index_arr[idx++] = tr;
            index_arr[idx++] = bl;
            index_arr[idx++] = tr;
            index_arr[idx++] = br;
            index_arr[idx++] = bl;
        }
    }

    let vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);

    let vertex_buf = gl.createBuffer()!;
    gl.bindBuffer(GL_ARRAY_BUFFER, vertex_buf);
    gl.bufferData(GL_ARRAY_BUFFER, vertex_arr, GL_STATIC_DRAW);
    gl.enableVertexAttribArray(Attribute.Position);
    gl.vertexAttribPointer(Attribute.Position, 3, GL_FLOAT, false, 0, 0);

    let normal_buf = gl.createBuffer()!;
    gl.bindBuffer(GL_ARRAY_BUFFER, normal_buf);
    gl.bufferData(GL_ARRAY_BUFFER, normal_arr, GL_STATIC_DRAW);
    gl.enableVertexAttribArray(Attribute.Normal);
    gl.vertexAttribPointer(Attribute.Normal, 3, GL_FLOAT, false, 0, 0);

    let texcoord_buf = gl.createBuffer()!;
    gl.bindBuffer(GL_ARRAY_BUFFER, texcoord_buf);
    gl.bufferData(GL_ARRAY_BUFFER, texcoord_arr, GL_STATIC_DRAW);
    gl.enableVertexAttribArray(Attribute.TexCoord);
    gl.vertexAttribPointer(Attribute.TexCoord, 2, GL_FLOAT, false, 0, 0);

    let weights_buf = gl.createBuffer()!;
    gl.bindBuffer(GL_ARRAY_BUFFER, weights_buf);
    gl.bufferData(GL_ARRAY_BUFFER, weights_arr, GL_STATIC_DRAW);
    gl.enableVertexAttribArray(Attribute.Weights);
    gl.vertexAttribPointer(Attribute.Weights, 4, GL_FLOAT, false, 0, 0);

    let index_buf = gl.createBuffer()!;
    gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, index_buf);
    gl.bufferData(GL_ELEMENT_ARRAY_BUFFER, index_arr, GL_STATIC_DRAW);

    gl.bindVertexArray(null);

    return {
        Vao: vao,
        VertexBuffer: vertex_buf,
        VertexArray: vertex_arr,
        NormalBuffer: normal_buf,
        NormalArray: normal_arr,
        TexCoordBuffer: texcoord_buf,
        TexCoordArray: texcoord_arr,
        WeightsBuffer: weights_buf,
        WeightsArray: weights_arr,
        IndexBuffer: index_buf,
        IndexArray: index_arr,
        IndexCount: index_arr.length,
    };
}
