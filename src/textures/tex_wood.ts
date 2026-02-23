import {GL_LINEAR, GL_RGBA, GL_PIXEL_UNSIGNED_BYTE, GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR} from "../../lib/webgl.js";

export function tex_wood(gl: WebGL2RenderingContext): WebGLTexture {
    let size = 128;
    let canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    let ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#5a3a1e";
    ctx.fillRect(0, 0, size, size);

    // Horizontal wood grain lines.
    for (let y = 0; y < size; y += 3 + Math.random() * 4) {
        let v = 70 + Math.random() * 30;
        ctx.strokeStyle = `rgba(${v},${v * 0.6 | 0},${v * 0.3 | 0},0.4)`;
        ctx.lineWidth = 1 + Math.random();
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < size; x += 10) {
            ctx.lineTo(x, y + (Math.random() - 0.5) * 2);
        }
        ctx.stroke();
    }

    // Per-pixel noise.
    let img = ctx.getImageData(0, 0, size, size);
    for (let i = 0; i < img.data.length; i += 4) {
        let n = (Math.random() - 0.5) * 15;
        img.data[i] += n;
        img.data[i + 1] += n * 0.7;
        img.data[i + 2] += n * 0.4;
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
