(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const overlay = document.getElementById("overlay");
  const titleEl = document.getElementById("title");
  const subtitleEl = document.getElementById("subtitle");
  const bestEl = document.getElementById("best");
  const startBtn = document.getElementById("start");
  const hud = document.getElementById("hud");
  const scoreEl = document.getElementById("score");
  const waveEl = document.getElementById("wave");
  const shieldsEl = document.getElementById("shields");

  const W = canvas.width;
  const H = canvas.height;
  const STORAGE_KEY = "thr33-best-score";
  const TARGET = 33;

  const STATE = {
    menu: "menu",
    playing: "playing",
    paused: "paused",
    over: "over",
  };

  let state = STATE.menu;
  let score = 0;
  let best = Number(localStorage.getItem(STORAGE_KEY) || 0);
  let shields = 3;
  let wave = 1;
  let collected = 0;
  let spawnTimer = 0;
  let invuln = 0;
  let shake = 0;
  let pulse = 0;
  let lastTs = 0;
  let combo = 0;
  let comboTimer = 0;
  let flashEffect = 0;
  let powerups = {
    magnet: 0,
    timeSlow: 0,
    doublePoints: 0,
  };

  const keys = new Set();
  const particles = [];
  const floaters = [];
  const stars = Array.from({ length: 70 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    z: 0.35 + Math.random() * 1.4,
    a: 0.25 + Math.random() * 0.6,
  }));

  const ship = {
    x: W * 0.5,
    y: H - 88,
    r: 16,
    vx: 0,
    trail: [],
  };

  /** @type {{x:number,y:number,r:number,vy:number,vx:number,type:string,spin:number}[]} */
  let objects = [];

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function showMenu(kind) {
    state = kind;
    hud.hidden = true;
    overlay.hidden = false;

    if (kind === STATE.menu) {
      titleEl.textContent = "THR33";
      subtitleEl.textContent =
        "Drift the ring. Collect cores. Grab power-ups. Avoid crimson shards.";
      startBtn.textContent = "Enter orbit";
    } else {
      titleEl.textContent = "Orbit lost";
      subtitleEl.textContent = `You scored ${score}. Collect ${TARGET} cores in a run for a THR33 burst.`;
      startBtn.textContent = "Re-enter";
    }

    bestEl.textContent = best > 0 ? `Best orbit · ${best}` : "";
  }

  function startGame() {
    score = 0;
    shields = 3;
    wave = 1;
    collected = 0;
    spawnTimer = 0;
    invuln = 0;
    shake = 0;
    pulse = 0;
    combo = 0;
    comboTimer = 0;
    flashEffect = 0;
    powerups = { magnet: 0, timeSlow: 0, doublePoints: 0 };
    objects = [];
    particles.length = 0;
    floaters.length = 0;
    ship.x = W * 0.5;
    ship.vx = 0;
    ship.trail = [];
    state = STATE.playing;
    overlay.hidden = true;
    hud.hidden = false;
    updateHud();
    lastTs = performance.now();
  }

  function updateHud() {
    scoreEl.textContent = String(score);
    waveEl.textContent = String(wave);
    shieldsEl.textContent = "●".repeat(shields) + "○".repeat(Math.max(0, 3 - shields));
  }

  function spawnBurst(x, y, color, count = 10) {
    for (let i = 0; i < count; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const s = rand(40, 180);
      particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: rand(0.35, 0.8),
        max: 0.8,
        color,
        size: rand(1.5, 3.5),
      });
    }
  }

  function addFloater(x, y, text, color) {
    floaters.push({ x, y, text, color, life: 0.9 });
  }

  function spawnObject() {
    const roll = Math.random();
    let type = "core";
    
    if (roll > 0.97 && wave > 2) type = "powerup-magnet";
    else if (roll > 0.94 && wave > 3) type = "powerup-slow";
    else if (roll > 0.91 && wave > 4) type = "powerup-double";
    else if (roll > 0.88 && shields < 3) type = "powerup-shield";
    else if (roll > 0.72) type = "hazard";
    else if (roll > 0.58) type = "amber";

    const r = type === "hazard" ? rand(11, 16) : type.startsWith("powerup") ? 10 : rand(8, 12);
    objects.push({
      x: rand(28, W - 28),
      y: -20,
      r,
      vy: rand(120, 170) + wave * 18,
      vx: rand(-35, 35),
      type,
      spin: rand(-3, 3),
    });
  }

  function endGame() {
    best = Math.max(best, score);
    localStorage.setItem(STORAGE_KEY, String(best));
    showMenu(STATE.over);
  }

  function hitShip() {
    if (invuln > 0) return;
    shields -= 1;
    invuln = 1.2;
    shake = 10;
    spawnBurst(ship.x, ship.y, "#ff4d6d", 18);
    combo = 0;
    updateHud();
    if (shields <= 0) endGame();
  }

  function collect(obj) {
    if (obj.type === "hazard") {
      hitShip();
      return;
    }

    if (obj.type.startsWith("powerup")) {
      activatePowerup(obj.type);
      return;
    }

    const base = obj.type === "amber" ? 5 : 1;
    combo += 1;
    comboTimer = 1.4;
    const multiplier = powerups.doublePoints > 0 ? 2 : 1;
    const points = (base + Math.floor(combo / 3)) * multiplier;
    score += points;
    collected += 1;
    pulse = 0.25;

    if (obj.type === "amber") {
      spawnBurst(obj.x, obj.y, "#ffb347", 14);
      addFloater(obj.x, obj.y, `+${points}`, "#ffb347");
    } else {
      spawnBurst(obj.x, obj.y, "#3dffb5", 10);
      addFloater(obj.x, obj.y, `+${points}`, "#3dffb5");
    }

    if (collected > 0 && collected % TARGET === 0) {
      score += TARGET * multiplier;
      shields = Math.min(3, shields + 1);
      wave += 1;
      shake = 8;
      flashEffect = 0.4;
      spawnBurst(ship.x, ship.y, "#3dffb5", 28);
      addFloater(ship.x, ship.y - 30, "THR33 +33", "#d7e4ef");
    }

    wave = 1 + Math.floor(score / 40);
    updateHud();
  }

  function activatePowerup(type) {
    const duration = 8;
    
    switch(type) {
      case "powerup-magnet":
        powerups.magnet = duration;
        spawnBurst(ship.x, ship.y, "#a78bfa", 20);
        addFloater(ship.x, ship.y - 30, "MAGNET", "#a78bfa");
        break;
      case "powerup-slow":
        powerups.timeSlow = duration;
        spawnBurst(ship.x, ship.y, "#60a5fa", 20);
        addFloater(ship.x, ship.y - 30, "TIME SLOW", "#60a5fa");
        break;
      case "powerup-double":
        powerups.doublePoints = duration;
        spawnBurst(ship.x, ship.y, "#fbbf24", 20);
        addFloater(ship.x, ship.y - 30, "2X POINTS", "#fbbf24");
        break;
      case "powerup-shield":
        shields = Math.min(3, shields + 1);
        spawnBurst(ship.x, ship.y, "#34d399", 20);
        addFloater(ship.x, ship.y - 30, "SHIELD+", "#34d399");
        updateHud();
        break;
    }
    pulse = 0.35;
  }

  function update(dt) {
    if (state !== STATE.playing) return;

    pulse = Math.max(0, pulse - dt);
    invuln = Math.max(0, invuln - dt);
    shake = Math.max(0, shake - dt * 28);
    comboTimer = Math.max(0, comboTimer - dt);
    flashEffect = Math.max(0, flashEffect - dt * 2.5);
    if (comboTimer === 0) combo = 0;

    powerups.magnet = Math.max(0, powerups.magnet - dt);
    powerups.timeSlow = Math.max(0, powerups.timeSlow - dt);
    powerups.doublePoints = Math.max(0, powerups.doublePoints - dt);

    let input = 0;
    if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) input -= 1;
    if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) input += 1;

    ship.vx += input * 2800 * dt;
    ship.vx *= Math.pow(0.01, dt);
    ship.x = clamp(ship.x + ship.vx * dt, 24, W - 24);

    ship.trail.push({ x: ship.x, y: ship.y + 10, life: 0.35 });
    if (ship.trail.length > 14) ship.trail.shift();
    for (const t of ship.trail) t.life -= dt;

    for (const s of stars) {
      s.y += (28 + s.z * 40) * dt;
      if (s.y > H) {
        s.y = -4;
        s.x = Math.random() * W;
      }
    }

    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnObject();
      if (Math.random() < 0.35) spawnObject();
      spawnTimer = Math.max(0.28, 0.85 - wave * 0.05);
    }

    const timeScale = powerups.timeSlow > 0 ? 0.4 : 1;

    for (let i = objects.length - 1; i >= 0; i -= 1) {
      const o = objects[i];
      o.y += o.vy * dt * timeScale;
      o.x += o.vx * dt * timeScale;
      o.spin += dt;

      if (o.x < o.r || o.x > W - o.r) o.vx *= -1;

      if (powerups.magnet > 0 && (o.type === "core" || o.type === "amber")) {
        const dx = ship.x - o.x;
        const dy = ship.y - o.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          const magnetForce = 400;
          o.x += (dx / dist) * magnetForce * dt;
          o.y += (dy / dist) * magnetForce * dt;
        }
      }

      const dx = o.x - ship.x;
      const dy = o.y - ship.y;
      if (dx * dx + dy * dy < (o.r + ship.r - 4) ** 2) {
        collect(o);
        objects.splice(i, 1);
        continue;
      }

      if (o.y > H + 40) objects.splice(i, 1);
    }

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
      if (p.life <= 0) particles.splice(i, 1);
    }

    for (let i = floaters.length - 1; i >= 0; i -= 1) {
      const f = floaters[i];
      f.life -= dt;
      f.y -= 40 * dt;
      if (f.life <= 0) floaters.splice(i, 1);
    }
  }

  function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0b1824");
    g.addColorStop(0.55, "#0a141e");
    g.addColorStop(1, "#071018");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    if (flashEffect > 0) {
      ctx.fillStyle = `rgba(61, 255, 181, ${flashEffect * 0.15})`;
      ctx.fillRect(0, 0, W, H);
    }

    for (const s of stars) {
      ctx.globalAlpha = s.a;
      ctx.fillStyle = "#d7e4ef";
      ctx.fillRect(s.x, s.y, s.z, s.z);
    }
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(W * 0.5, H * 0.42);
    ctx.strokeStyle = "rgba(61, 255, 181, 0.08)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 150, 46, -0.35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 179, 71, 0.06)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 210, 70, 0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawShip() {
    for (const t of ship.trail) {
      if (t.life <= 0) continue;
      ctx.globalAlpha = Math.max(0, t.life);
      ctx.fillStyle = "#3dffb5";
      ctx.beginPath();
      ctx.arc(t.x, t.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const blink = invuln > 0 && Math.floor(invuln * 16) % 2 === 0;
    if (blink) return;

    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.vx * 0.0008);

    ctx.shadowColor = "#3dffb5";
    ctx.shadowBlur = 18 + pulse * 40;

    ctx.fillStyle = "#d7e4ef";
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(14, 14);
    ctx.lineTo(0, 8);
    ctx.lineTo(-14, 14);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#3dffb5";
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(5, 6);
    ctx.lineTo(-5, 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    ctx.shadowBlur = 0;
  }

  function drawObject(o) {
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(o.spin);

    if (o.type === "hazard") {
      ctx.fillStyle = "#ff4d6d";
      ctx.shadowColor = "#ff4d6d";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      for (let i = 0; i < 5; i += 1) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? o.r : o.r * 0.55;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    } else if (o.type.startsWith("powerup")) {
      let color, symbol;
      switch(o.type) {
        case "powerup-magnet":
          color = "#a78bfa";
          symbol = "M";
          break;
        case "powerup-slow":
          color = "#60a5fa";
          symbol = "S";
          break;
        case "powerup-double":
          color = "#fbbf24";
          symbol = "2X";
          break;
        case "powerup-shield":
          color = "#34d399";
          symbol = "+";
          break;
      }
      
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(0, 0, o.r, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, o.r - 2, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px Figtree, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(symbol, 0, 0);
    } else {
      const color = o.type === "amber" ? "#ffb347" : "#3dffb5";
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, o.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.arc(-o.r * 0.3, -o.r * 0.3, o.r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    ctx.shadowBlur = 0;
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function drawFloaters() {
    ctx.font = "700 16px Figtree, sans-serif";
    ctx.textAlign = "center";
    for (const f of floaters) {
      ctx.globalAlpha = Math.max(0, f.life);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  function drawPaused() {
    ctx.fillStyle = "rgba(7, 16, 24, 0.55)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#d7e4ef";
    ctx.font = "800 36px Syne, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Paused", W / 2, H / 2);
    ctx.font = "600 14px Figtree, sans-serif";
    ctx.fillStyle = "#8aa0b5";
    ctx.fillText("Press Space to continue", W / 2, H / 2 + 28);
  }

  function draw() {
    ctx.save();
    if (shake > 0) {
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    }

    drawBackground();

    if (state === STATE.playing || state === STATE.paused) {
      if (powerups.magnet > 0) {
        ctx.strokeStyle = `rgba(167, 139, 250, ${0.15 + Math.sin(Date.now() * 0.006) * 0.1})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, 120, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (const o of objects) drawObject(o);
      drawParticles();
      drawShip();
      drawFloaters();

      if (combo > 2) {
        ctx.fillStyle = "#ffb347";
        ctx.font = "700 14px Figtree, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`Combo x${combo}`, 16, H - 18);
      }

      const powerupY = 24;
      let powerupX = 16;
      
      if (powerups.magnet > 0) {
        ctx.fillStyle = "#a78bfa";
        ctx.font = "600 12px Figtree, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`MAGNET ${Math.ceil(powerups.magnet)}s`, powerupX, powerupY);
        powerupX += 90;
      }
      
      if (powerups.timeSlow > 0) {
        ctx.fillStyle = "#60a5fa";
        ctx.font = "600 12px Figtree, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`SLOW ${Math.ceil(powerups.timeSlow)}s`, powerupX, powerupY);
        powerupX += 80;
      }
      
      if (powerups.doublePoints > 0) {
        ctx.fillStyle = "#fbbf24";
        ctx.font = "600 12px Figtree, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`2X ${Math.ceil(powerups.doublePoints)}s`, powerupX, powerupY);
      }
    }

    if (state === STATE.paused) drawPaused();
    ctx.restore();
  }

  function frame(ts) {
    const dt = Math.min(0.033, (ts - lastTs) / 1000 || 0.016);
    lastTs = ts;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  function pointerToX(clientX) {
    const rect = canvas.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * W;
  }

  startBtn.addEventListener("click", () => {
    startGame();
  });

  window.addEventListener("keydown", (e) => {
    if (["ArrowLeft", "ArrowRight", " ", "a", "A", "d", "D"].includes(e.key)) {
      e.preventDefault();
    }
    keys.add(e.key);

    if (e.key === " " || e.code === "Space") {
      if (state === STATE.playing) state = STATE.paused;
      else if (state === STATE.paused) {
        state = STATE.playing;
        lastTs = performance.now();
      } else if (state === STATE.menu || state === STATE.over) {
        startGame();
      }
    }

    if ((e.key === "Enter" || e.key === " ") && (state === STATE.menu || state === STATE.over)) {
      startGame();
    }
  });

  window.addEventListener("keyup", (e) => {
    keys.delete(e.key);
  });

  canvas.addEventListener(
    "pointerdown",
    (e) => {
      if (state !== STATE.playing) return;
      canvas.setPointerCapture(e.pointerId);
      ship.x = clamp(pointerToX(e.clientX), 24, W - 24);
    },
    { passive: true }
  );

  canvas.addEventListener(
    "pointermove",
    (e) => {
      if (state !== STATE.playing) return;
      if (e.buttons === 0 && e.pointerType === "mouse") return;
      ship.x = clamp(pointerToX(e.clientX), 24, W - 24);
      ship.vx = 0;
    },
    { passive: true }
  );

  showMenu(STATE.menu);
  requestAnimationFrame(frame);
})();
