// project.js
// Fondo animado tipo "mesh" + nube de puntos para la sección PROYECTO

const section = document.getElementById('project');
const canvas  = document.getElementById('project-network');

if (section && canvas) {
  const ctx = canvas.getContext('2d');
  const paragraphs = Array.from(section.querySelectorAll('.project-text'));

  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;

  let particles = [];
  let vLines = [];
  let hLines = [];

  const mouse = { x: 0, y: 0, inside: false };
  let lastTime = performance.now();

  /* ------------------ RESIZE + SETUP ------------------ */

  function resizeCanvas() {
    const rect = section.getBoundingClientRect();
    width  = rect.width;
    height = rect.height;

    if (width <= 0 || height <= 0) return;

    dpr = window.devicePixelRatio || 1;
    canvas.width  = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width  = width + 'px';
    canvas.style.height = height + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildBackground();
  }

  function buildBackground() {
    // --- partículas flotando ---
    particles = [];
    const count = 120;
    for (let i = 0; i < count; i++) {
      const depth = Math.random(); // 0 = cerca, 1 = lejos
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12 * (0.4 + depth),
        vy: (Math.random() - 0.5) * 0.12 * (0.4 + depth),
        r: 1.2 + depth * 1.8,
        depth
      });
    }

    // --- columnas de malla vertical (curvas) ---
    vLines = [];
    const cols = 6;
    for (let i = 0; i < cols; i++) {
      const t = (i + 0.4) / (cols + 0.2);
      vLines.push({
        baseX: width * t,
        amp: 40 + Math.random() * 55,
        speed: 0.2 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2
      });
    }

    // --- filas de malla horizontal (curvas) ---
    hLines = [];
    const rows = 4;
    for (let j = 0; j < rows; j++) {
      const t = (j + 0.6) / (rows + 1.2);
      hLines.push({
        baseY: height * t,
        amp: 35 + Math.random() * 45,
        speed: 0.2 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  /* ------------------ UPDATE ------------------ */

  function update(dt) {
    const t = performance.now() / 1000;

    // partículas
    particles.forEach(p => {
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;

      // re-aparecen del otro lado para que no se acaben
      if (p.x < -40)        p.x = width + 40;
      if (p.x > width + 40) p.x = -40;
      if (p.y < -40)        p.y = height + 40;
      if (p.y > height + 40)p.y = -40;
    });

    // resaltar párrafo más cercano al mouse
    if (mouse.inside) {
      const rect = section.getBoundingClientRect();
      const mx = mouse.x - rect.left;
      const my = mouse.y - rect.top;

      let bestIndex = null;
      let bestDist2 = 140 * 140;

      paragraphs.forEach((p, i) => {
        const pr = p.getBoundingClientRect();
        const cx = pr.left - rect.left + pr.width / 2;
        const cy = pr.top  - rect.top  + pr.height / 2;
        const dx = cx - mx;
        const dy = cy - my;
        const d2 = dx*dx + dy*dy;
        if (d2 < bestDist2) {
          bestDist2 = d2;
          bestIndex = i;
        }
      });

      paragraphs.forEach((p, i) => {
        if (i === bestIndex) p.classList.add('is-active');
        else p.classList.remove('is-active');
      });
    } else {
      paragraphs.forEach(p => p.classList.remove('is-active'));
    }
  }

  /* ------------------ DRAW ------------------ */

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const t = performance.now() / 1000;

    ctx.lineWidth = 1;
    ctx.lineCap = 'round';

    // malla vertical
    vLines.forEach(line => {
      const { baseX, amp, speed, phase } = line;
      ctx.beginPath();
      for (let y = -40; y <= height + 40; y += 40) {
        const offset = Math.sin(y * 0.005 + t * speed + phase) * amp;
        const x = baseX + offset;
        if (y === -40) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.stroke();
    });

    // malla horizontal
    hLines.forEach(line => {
      const { baseY, amp, speed, phase } = line;
      ctx.beginPath();
      for (let x = -60; x <= width + 60; x += 70) {
        const offset = Math.sin(x * 0.006 + t * speed + phase) * amp;
        const y = baseY + offset;
        if (x === -60) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.stroke();
    });

    // partículas
    const rect = section.getBoundingClientRect();
    const mx = mouse.x - rect.left;
    const my = mouse.y - rect.top;

    particles.forEach(p => {
      const baseAlpha = 0.22 + (1 - p.depth) * 0.25;
      let alpha = baseAlpha;

      if (mouse.inside) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const d2 = dx*dx + dy*dy;
        if (d2 < 140*140) alpha = 0.6;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    });
  }

  /* ------------------ LOOP ------------------ */

  function loop(now) {
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    if (width > 0 && height > 0) {
      update(dt);
      draw();
    }

    requestAnimationFrame(loop);
  }

  /* ------------------ EVENTOS ------------------ */

  function onMouseMove(ev) {
    mouse.inside = true;
    mouse.x = ev.clientX;
    mouse.y = ev.clientY;
  }

  function onMouseLeave() {
    mouse.inside = false;
  }

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('scroll', resizeCanvas);
  section.addEventListener('mousemove', onMouseMove);
  section.addEventListener('mouseleave', onMouseLeave);

  // cuando haces clic en "Proyecto", recalculamos el canvas
  const navProject = document.getElementById('nav-project');
  if (navProject) {
    navProject.addEventListener('click', () => {
      setTimeout(resizeCanvas, 80);
    });
  }

  // init
  resizeCanvas();
  requestAnimationFrame(loop);
}
