import {mat4_distance_squared_from_point} from "../../lib/mat4.js";
import {Material} from "../../lib/material.js";
import {
    GL_BLEND,
    GL_FRAMEBUFFER,
    GL_TEXTURE0,
    GL_TEXTURE_2D,
    GL_UNSIGNED_SHORT,
} from "../../lib/webgl.js";
import {Entity} from "../../lib/world.js";
import {CameraEye, CameraKind} from "../components/com_camera.js";
import {Render, RenderKind, RenderPhase} from "../components/com_render.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Transform | Has.Render;

export function sys_render_forward(game: Game, delta: number) {
    for (let camera_entity of game.Cameras) {
        let camera = game.World.Camera[camera_entity];
        switch (camera.Kind) {
            case CameraKind.Canvas:
                game.Gl.bindFramebuffer(GL_FRAMEBUFFER, null);
                game.Gl.viewport(0, 0, camera.ViewportWidth, camera.ViewportHeight);
                game.Gl.clearColor(...camera.ClearColor);
                game.Gl.clear(camera.ClearMask);
                render_all(game, camera);
                break;
        }
    }
}

export function render_all(game: Game, eye: CameraEye, current_target?: WebGLTexture) {
    // Keep track of the current state to minimize switching.
    let current_material: Material<unknown> | null = null;
    let current_front_face: GLenum | null = null;

    // Transparent objects to be sorted by distance to camera and rendered later.
    let transparent_entities: Array<Entity> = [];

    // First render opaque objects.
    for (let ent = 0; ent < game.World.Signature.length; ent++) {
        if ((game.World.Signature[ent] & QUERY) === QUERY) {
            let render = game.World.Render[ent];

            if (render.Phase === RenderPhase.Transparent) {
                // Store transparent objects in a separate array to render them later.
                transparent_entities.push(ent);
                continue;
            }

            if (render.Material !== current_material) {
                current_material = render.Material;
                use_material(game, render, eye);
            }

            if (render.FrontFace !== current_front_face) {
                current_front_face = render.FrontFace;
                game.Gl.frontFace(render.FrontFace);
            }

            draw_entity(game, ent, current_target);
        }
    }

    // Sort transparent objects by distance to camera, from back to front, to
    // enforce overdraw and blend them in the correct order.
    transparent_entities.sort((a, b) => {
        let transform_a = game.World.Transform[a];
        let transform_b = game.World.Transform[b];
        return (
            mat4_distance_squared_from_point(transform_b.World, eye.Position) -
            mat4_distance_squared_from_point(transform_a.World, eye.Position)
        );
    });

    game.Gl.enable(GL_BLEND);

    for (let i = 0; i < transparent_entities.length; i++) {
        let ent = transparent_entities[i];
        let render = game.World.Render[ent];

        if (render.Material !== current_material) {
            current_material = render.Material;
            use_material(game, render, eye);
        }

        if (render.FrontFace !== current_front_face) {
            current_front_face = render.FrontFace;
            game.Gl.frontFace(render.FrontFace);
        }

        draw_entity(game, ent, current_target);
    }

    game.Gl.disable(GL_BLEND);
}

function use_material(game: Game, render: Render, eye: CameraEye) {
    switch (render.Kind) {
        case RenderKind.ColoredShaded:
            game.Gl.useProgram(render.Material.Program);
            game.Gl.uniformMatrix4fv(render.Material.Locations.Pv, false, eye.Pv);
            game.Gl.uniform3fv(render.Material.Locations.Eye, eye.Position);
            game.Gl.uniform4fv(render.Material.Locations.LightPositions, game.LightPositions);
            game.Gl.uniform4fv(render.Material.Locations.LightDetails, game.LightDetails);
            break;
        case RenderKind.TexturedShaded:
            game.Gl.useProgram(render.Material.Program);
            game.Gl.uniformMatrix4fv(render.Material.Locations.Pv, false, eye.Pv);
            game.Gl.uniform3fv(render.Material.Locations.Eye, eye.Position);
            game.Gl.uniform4fv(render.Material.Locations.LightPositions, game.LightPositions);
            game.Gl.uniform4fv(render.Material.Locations.LightDetails, game.LightDetails);
            break;
    }
}

function draw_entity(game: Game, entity: Entity, current_target?: WebGLTexture) {
    let transform = game.World.Transform[entity];
    let render = game.World.Render[entity];

    switch (render.Kind) {
        case RenderKind.ColoredShaded:
            game.Gl.uniformMatrix4fv(render.Material.Locations.World, false, transform.World);
            game.Gl.uniformMatrix4fv(render.Material.Locations.Self, false, transform.Self);
            game.Gl.uniform4fv(render.Material.Locations.DiffuseColor, render.DiffuseColor);
            game.Gl.uniform4fv(render.Material.Locations.SpecularColor, render.SpecularColor);
            game.Gl.uniform4fv(render.Material.Locations.EmissiveColor, render.EmissiveColor);
            game.Gl.bindVertexArray(render.Mesh.Vao);
            game.Gl.drawElements(
                render.Material.Mode,
                render.Mesh.IndexCount,
                GL_UNSIGNED_SHORT,
                0,
            );
            game.Gl.bindVertexArray(null);
            break;
        case RenderKind.TexturedShaded:
            if (render.Texture === current_target) {
                break;
            }

            game.Gl.uniformMatrix4fv(render.Material.Locations.World, false, transform.World);
            game.Gl.uniformMatrix4fv(render.Material.Locations.Self, false, transform.Self);
            game.Gl.uniform4fv(render.Material.Locations.DiffuseColor, render.DiffuseColor);
            game.Gl.uniform4fv(render.Material.Locations.SpecularColor, render.SpecularColor);
            game.Gl.uniform4fv(render.Material.Locations.EmissiveColor, render.EmissiveColor);

            game.Gl.activeTexture(GL_TEXTURE0);
            game.Gl.bindTexture(GL_TEXTURE_2D, render.Texture);
            game.Gl.uniform1i(render.Material.Locations.DiffuseMap, 0);

            game.Gl.bindVertexArray(render.Mesh.Vao);
            game.Gl.drawElements(
                render.Material.Mode,
                render.Mesh.IndexCount,
                GL_UNSIGNED_SHORT,
                0,
            );
            game.Gl.bindVertexArray(null);
            break;
    }
}
