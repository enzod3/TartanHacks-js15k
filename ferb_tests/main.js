const c = document.getElementById("c");

function resize() {
  c.width = innerWidth;
  c.height = innerHeight;
}

resize();
addEventListener("resize", resize);

W.reset(c);

// Move camera UP (y: 2), BACK (z: 3), and TILT DOWN (rx: -30)
W.camera({ x: 0, y: 2, z: 3, rx: -30 }); 

W.clearColor("#111");
W.ambient(0.6);

W.plane({size: 150,
  x: 0, y: 0, z: 0,
  rx: -90,     // Rotates it flat to be a floor
  b: "f00"     // Make it RED so you can definitely see it
});
