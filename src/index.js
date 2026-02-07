// --- Player state ---
const player = { x: 0, y: 1.5, z: 8, rx: 0, ry: 0, speed: 0.06 };
const keys = {};
let topDown = false;

// --- Init ---
W.reset(c);
W.clearColor("225");
W.ambient(0.35);
W.light({ x: 0.5, y: -1, z: -0.3 });

// --- Build scene ---

// Floor
W.plane({ n: "floor", y: 0, rx: -90, w: 40, h: 40, b: "496", mode: 4 });

// Walls around the perimeter
W.cube({ n: "wallN", x: 0, y: 1.5, z: -20, w: 40, h: 3, d: 0.3, b: "888" });
W.cube({ n: "wallS", x: 0, y: 1.5, z: 20, w: 40, h: 3, d: 0.3, b: "888" });
W.cube({ n: "wallE", x: 20, y: 1.5, z: 0, w: 0.3, h: 3, d: 40, b: "888" });
W.cube({ n: "wallW", x: -20, y: 1.5, z: 0, w: 0.3, h: 3, d: 40, b: "888" });

// Scattered obstacles (crates / pillars)
const obstacles = [
  { x: -5, z: -5 }, { x: 4, z: -8 }, { x: -8, z: 3 },
  { x: 7, z: 6 },  { x: 0, z: -3 }, { x: -3, z: 8 },
  { x: 10, z: -12 }, { x: -12, z: -10 },
];
obstacles.forEach((o, i) => {
  W.cube({ n: "crate" + i, x: o.x, y: 1, z: o.z, w: 2, h: 2, d: 2, b: "a75" });
});

// A few tall pillars
[{ x: -14, z: -14 }, { x: 14, z: 14 }, { x: -14, z: 14 }, { x: 14, z: -14 }].forEach((p, i) => {
  W.cube({ n: "pillar" + i, x: p.x, y: 2.5, z: p.z, w: 1.2, h: 5, d: 1.2, b: "766" });
});

// Colored spheres as "targets"
[{ x: -5, z: -12, b: "f22" }, { x: 8, z: -2, b: "22f" }, { x: -10, z: 7, b: "2f2" }].forEach((t, i) => {
  W.sphere({ n: "target" + i, x: t.x, y: 1.2, z: t.z, size: 1, b: t.b, s: 1 });
});

// --- Simple AABB collision (keeps player out of boxes) ---
function collides(px, pz) {
  const boxes = [
    ...obstacles.map(o => ({ x: o.x, z: o.z, hw: 1.3, hd: 1.3 })),
    { x: -14, z: -14, hw: 0.9, hd: 0.9 }, { x: 14, z: 14, hw: 0.9, hd: 0.9 },
    { x: -14, z: 14, hw: 0.9, hd: 0.9 },  { x: 14, z: -14, hw: 0.9, hd: 0.9 },
  ];
  for (const b of boxes) {
    if (Math.abs(px - b.x) < b.hw && Math.abs(pz - b.z) < b.hd) return true;
  }
  // Boundary walls
  if (Math.abs(px) > 19.5 || Math.abs(pz) > 19.5) return true;
  return false;
}

// --- Input ---
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);
document.addEventListener("keypress", e => {
  if (e.key.toLowerCase() === "v") topDown = !topDown;
});

c.addEventListener("click", () => c.requestPointerLock());
document.addEventListener("mousemove", e => {
  if (document.pointerLockElement !== c) return;
  player.ry -= e.movementX * 0.15;
  player.rx -= e.movementY * 0.15;
  player.rx = Math.max(-89, Math.min(89, player.rx));
});

// --- Game loop (runs alongside W.draw) ---
function tick() {
  requestAnimationFrame(tick);

  // Movement relative to facing direction
  const rad = player.ry * Math.PI / 180;
  let dx = 0, dz = 0;
  if (keys["w"]) { dx -= Math.sin(rad) * player.speed; dz -= Math.cos(rad) * player.speed; }
  if (keys["s"]) { dx += Math.sin(rad) * player.speed; dz += Math.cos(rad) * player.speed; }
  if (keys["a"]) { dx -= Math.cos(rad) * player.speed; dz += Math.sin(rad) * player.speed; }
  if (keys["d"]) { dx += Math.cos(rad) * player.speed; dz -= Math.sin(rad) * player.speed; }

  // Slide collision: try each axis independently
  if (!collides(player.x + dx, player.z)) player.x += dx;
  if (!collides(player.x, player.z + dz)) player.z += dz;

  // Update camera
  if (topDown) {
    // Top-down view centered on player
    W.camera({ x: player.x, y: 30, z: player.z + 0.01, rx: -90, ry: 0 });
  } else {
    // First-person
    W.camera({ x: player.x, y: player.y, z: player.z, rx: player.rx, ry: player.ry });
  }

  // HUD
  hud.textContent = `WASD: move | Mouse: look | V: toggle view (${topDown ? "TOP-DOWN" : "FPS"})`;
}
tick();
