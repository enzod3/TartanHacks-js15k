const c = document.getElementById("c");

function resize() {
  c.width = innerWidth;
  c.height = innerHeight;
}

resize();
addEventListener("resize", resize);

W.reset(c);
W.camera({x:0,y:0,z:0});
W.clearColor("#111");
W.ambient(0.6);
W.plane({size:150,b:"3d2",z:-100,y:-75,ns:1});
