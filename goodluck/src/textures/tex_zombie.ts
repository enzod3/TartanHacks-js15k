import {GL_LINEAR, GL_RGBA, GL_PIXEL_UNSIGNED_BYTE, GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR} from "../../lib/webgl.js";

export function tex_zombie(gl: WebGL2RenderingContext): WebGLTexture {
    let size = 64;
    let canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    let ctx = canvas.getContext("2d")!;

    // Dark green base.
    ctx.fillStyle = "#1a3a1a";
    ctx.fillRect(0, 0, size, size);

    // Splotchy variation.
    for (let i = 0; i < 15; i++) {
        let x = Math.random() * size;
        let y = Math.random() * size;
        let r = 5 + Math.random() * 15;
        let g = ctx.createRadialGradient(x, y, 0, x, y, r);
        let v = 20 + Math.random() * 30;
        g.addColorStop(0, `rgba(${v},${v + 20},${v},0.5)`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
    }

    // Per-pixel grain noise.
    let img = ctx.getImageData(0, 0, size, size);
    for (let i = 0; i < img.data.length; i += 4) {
        let n = (Math.random() - 0.5) * 30;
        img.data[i] += n;
        img.data[i + 1] += n + (Math.random() - 0.5) * 10;
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
