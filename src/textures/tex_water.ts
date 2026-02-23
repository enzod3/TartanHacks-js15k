import {GL_LINEAR, GL_RGBA, GL_PIXEL_UNSIGNED_BYTE, GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR} from "../../lib/webgl.js";

export function tex_water(gl: WebGL2RenderingContext): WebGLTexture {
    let size = 256;
    let canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    let ctx = canvas.getContext("2d")!;

    // Deep ocean base.
    ctx.fillStyle = "#0c1830";
    ctx.fillRect(0, 0, size, size);

    // Wave-like patterns via overlapping gradients.
    for (let i = 0; i < 6; i++) {
        let x = Math.random() * size;
        let y = Math.random() * size;
        let r = 40 + Math.random() * 60;
        let g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, "rgba(20,40,80,0.3)");
        g.addColorStop(1, "rgba(6,16,32,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
    }

    // Per-pixel wave noise.
    let img = ctx.getImageData(0, 0, size, size);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            let i = (y * size + x) * 4;
            let wave = Math.sin(x * 0.15) * Math.cos(y * 0.12) * 8;
            let noise = (Math.random() - 0.5) * 10;
            img.data[i] += wave + noise;
            img.data[i + 1] += wave + noise + 2;
            img.data[i + 2] += wave * 1.5 + noise + 4;
        }
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
