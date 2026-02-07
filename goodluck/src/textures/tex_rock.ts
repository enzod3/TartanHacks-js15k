import {GL_LINEAR, GL_RGBA, GL_PIXEL_UNSIGNED_BYTE, GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR} from "../../lib/webgl.js";

export function tex_rock(gl: WebGL2RenderingContext): WebGLTexture {
    let size = 128;
    let canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    let ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#555550";
    ctx.fillRect(0, 0, size, size);

    // Random splotches for rocky variation.
    for (let i = 0; i < 20; i++) {
        let x = Math.random() * size;
        let y = Math.random() * size;
        let r = 10 + Math.random() * 25;
        let v = 60 + Math.random() * 40;
        let g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${v},${v - 5},${v - 8},0.6)`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
    }

    // Per-pixel grain noise.
    let img = ctx.getImageData(0, 0, size, size);
    for (let i = 0; i < img.data.length; i += 4) {
        let n = (Math.random() - 0.5) * 25;
        img.data[i] += n;
        img.data[i + 1] += n;
        img.data[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);

    let texture = gl.createTexture()!;
    gl.bindTexture(GL_TEXTURE_2D, texture);
    gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, GL_RGBA, GL_PIXEL_UNSIGNED_BYTE, canvas);
    gl.generateMipmap(GL_TEXTURE_2D);
    gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

    return texture;
}
