/* ==========================================================================
   DRAVAKA — 3D hero scene
   An animated underwater scene rendered with Three.js: an undulating water
   surface, drifting light shafts, rising bubbles and suspended particles,
   with a gentle parallax that follows the pointer.

   Progressive enhancement. If Three.js fails to load, WebGL is unavailable,
   or the visitor prefers reduced motion, the hero falls back to its CSS
   gradient and the lightweight CSS bubbles — nothing breaks.
   ========================================================================== */
(function () {
  "use strict";

  var hero = document.querySelector("[data-hero-3d]");
  if (!hero) return;

  var canvas = hero.querySelector(".hero-canvas");
  if (!canvas || !window.THREE) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var THREE = window.THREE;
  var renderer, scene, camera, clock;
  var surface, surfaceBase, underGrid, underBase;
  var bubbles, bubbleData = [], dummy;
  var particles, shafts = [];
  var pointer = { x: 0, y: 0 };
  var target = { x: 0, y: 0 };
  var running = false;
  var frame = null;

  var COLOR_DEEP = 0x062733;
  var COLOR_SURF = 0x2ec4b6;
  var COLOR_FOAM = 0xdff6f4;

  function init() {
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
    } catch (err) {
      return false;                       // no WebGL — keep the CSS hero
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(hero.clientWidth, hero.clientHeight, false);

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(COLOR_DEEP, 0.052);

    camera = new THREE.PerspectiveCamera(58, hero.clientWidth / hero.clientHeight, 0.1, 120);
    camera.position.set(0, 0, 13);

    clock = new THREE.Clock();
    dummy = new THREE.Object3D();

    buildSurface();
    buildUnderGrid();
    buildShafts();
    buildBubbles();
    buildParticles();

    scene.add(new THREE.AmbientLight(0x8fd8d0, 0.75));
    var key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(2, 8, 4);
    scene.add(key);
    var rim = new THREE.DirectionalLight(0x2ec4b6, 0.5);
    rim.position.set(-5, -3, -4);
    scene.add(rim);

    return true;
  }

  /* --- the water surface, seen from below --- */
  function buildSurface() {
    var geo = new THREE.PlaneGeometry(90, 60, 70, 46);
    geo.rotateX(-Math.PI / 2);
    surfaceBase = geo.attributes.position.array.slice();
    surface = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: COLOR_SURF,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    }));
    surface.position.y = 8.5;
    scene.add(surface);
  }

  /* --- a matching grid below, for depth --- */
  function buildUnderGrid() {
    var geo = new THREE.PlaneGeometry(90, 60, 44, 30);
    geo.rotateX(-Math.PI / 2);
    underBase = geo.attributes.position.array.slice();
    underGrid = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: 0x0f7c8a,
      wireframe: true,
      transparent: true,
      opacity: 0.10
    }));
    underGrid.position.y = -9;
    scene.add(underGrid);
  }

  /* --- god rays coming down through the surface --- */
  function buildShafts() {
    var mat = new THREE.MeshBasicMaterial({
      color: 0x8fe4dc,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    for (var i = 0; i < 8; i++) {
      var w = 0.7 + Math.random() * 2.2;
      var shaft = new THREE.Mesh(new THREE.PlaneGeometry(w, 34), mat.clone());
      shaft.position.set(-16 + i * 4.4 + Math.random() * 2, 2, -6 - Math.random() * 10);
      shaft.rotation.z = (Math.random() - 0.5) * 0.28;
      shaft.userData.sway = 0.15 + Math.random() * 0.25;
      shaft.userData.phase = Math.random() * Math.PI * 2;
      shaft.userData.baseX = shaft.position.x;
      shafts.push(shaft);
      scene.add(shaft);
    }
  }

  /* --- rising bubbles --- */
  function buildBubbles() {
    var count = window.innerWidth < 760 ? 44 : 88;
    var geo = new THREE.SphereGeometry(1, 14, 12);
    var mat = new THREE.MeshPhongMaterial({
      color: COLOR_FOAM,
      transparent: true,
      opacity: 0.34,
      shininess: 110,
      specular: 0xffffff,
      depthWrite: false
    });

    bubbles = new THREE.InstancedMesh(geo, mat, count);
    bubbles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    for (var i = 0; i < count; i++) {
      bubbleData.push({
        x: (Math.random() - 0.5) * 34,
        y: -12 + Math.random() * 26,
        z: -20 + Math.random() * 19,
        r: 0.05 + Math.pow(Math.random(), 2.4) * 0.34,
        speed: 0.5 + Math.random() * 1.5,
        sway: 0.25 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2
      });
    }
    scene.add(bubbles);
  }

  /* --- suspended particles --- */
  function buildParticles() {
    var count = window.innerWidth < 760 ? 320 : 700;
    var pos = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 34;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 6;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    particles = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0x9ee6de,
      size: 0.075,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
      depthWrite: false
    }));
    scene.add(particles);
  }

  /* --- per-frame updates --- */
  function ripple(mesh, base, t, amp, freq) {
    var pos = mesh.geometry.attributes.position;
    var arr = pos.array;
    for (var i = 0; i < arr.length; i += 3) {
      var x = base[i], z = base[i + 2];
      arr[i + 1] = base[i + 1] +
        Math.sin(x * freq + t) * amp +
        Math.cos(z * freq * 1.4 + t * 0.85) * amp * 0.75;
    }
    pos.needsUpdate = true;
  }

  function update(t, dt) {
    ripple(surface, surfaceBase, t * 0.9, 0.55, 0.32);
    ripple(underGrid, underBase, t * 0.55, 0.35, 0.22);

    for (var i = 0; i < shafts.length; i++) {
      var s = shafts[i];
      s.position.x = s.userData.baseX + Math.sin(t * 0.28 + s.userData.phase) * s.userData.sway;
      s.material.opacity = 0.035 + Math.abs(Math.sin(t * 0.35 + s.userData.phase)) * 0.045;
    }

    for (var j = 0; j < bubbleData.length; j++) {
      var b = bubbleData[j];
      b.y += b.speed * dt;
      if (b.y > 13) {
        b.y = -13;
        b.x = (Math.random() - 0.5) * 34;
        b.z = -20 + Math.random() * 19;
      }
      dummy.position.set(b.x + Math.sin(t * 0.9 + b.phase) * b.sway, b.y, b.z);
      dummy.scale.setScalar(b.r);
      dummy.updateMatrix();
      bubbles.setMatrixAt(j, dummy.matrix);
    }
    bubbles.instanceMatrix.needsUpdate = true;

    particles.rotation.y = t * 0.012;
    particles.position.y = Math.sin(t * 0.18) * 0.6;

    // pointer parallax
    target.x += (pointer.x * 1.5 - target.x) * 0.045;
    target.y += (pointer.y * 0.9 - target.y) * 0.045;
    camera.position.x = target.x + Math.sin(t * 0.13) * 0.4;
    camera.position.y = -target.y + Math.sin(t * 0.19) * 0.3;
    camera.lookAt(0, 0.5, 0);
  }

  function loop() {
    if (!running) return;
    frame = requestAnimationFrame(loop);
    var dt = Math.min(clock.getDelta(), 0.05);
    update(clock.elapsedTime, dt);
    renderer.render(scene, camera);
  }

  function start() {
    if (running || reduced) return;
    running = true;
    clock.getDelta();                     // discard the paused interval
    loop();
  }

  function stop() {
    running = false;
    if (frame) cancelAnimationFrame(frame);
    frame = null;
  }

  function resize() {
    var w = hero.clientWidth, h = hero.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    renderer.render(scene, camera);
  }

  /* --- boot --- */
  if (!init()) return;

  var cssBubbles = hero.querySelector(".hero-bubbles");
  if (cssBubbles) cssBubbles.remove();     // the 3D scene replaces them
  canvas.classList.add("is-ready");

  update(0, 0);
  renderer.render(scene, camera);           // paint one frame immediately

  if (reduced) return;                      // static frame is the whole story

  window.addEventListener("resize", resize, { passive: true });

  hero.addEventListener("pointermove", function (e) {
    var r = hero.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    pointer.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
  }, { passive: true });

  hero.addEventListener("pointerleave", function () {
    pointer.x = 0; pointer.y = 0;
  }, { passive: true });

  document.addEventListener("visibilitychange", function () {
    document.hidden ? stop() : start();
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0.01 }).observe(hero);
  } else {
    start();
  }
})();
