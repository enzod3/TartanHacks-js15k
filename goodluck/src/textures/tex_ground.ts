import {GL_LINEAR, GL_RGBA, GL_PIXEL_UNSIGNED_BYTE, GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR} from "../../lib/webgl.js";

export function tex_ground(gl: WebGL2RenderingContext): WebGLTexture {
    let size = 512;
    let canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    let ctx = canvas.getContext("2d")!;

    // Dark ocean water background.
    ctx.fillStyle = "#0c1828";
    ctx.fillRect(0, 0, size, size);

    // Radial gradient for circular sand island.
    let cx = size / 2;
    let radius = size * 0.4;
    let grad = ctx.createRadialGradient(cx, cx, 0, cx, cx, radius);
    grad.addColorStop(0, "#6b5530");
    grad.addColorStop(0.7, "#3a2a15");
    grad.addColorStop(1, "#0c1828");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Sand grain noise.
    let img = ctx.getImageData(0, 0, size, size);
    for (let i = 0; i < img.data.length; i += 4) {
        let noise = (Math.random() - 0.5) * 12;
        img.data[i] += noise;
        img.data[i + 1] += noise;
        img.data[i + 2] += noise;
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
