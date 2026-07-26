// Juice layer: missions, chat, confetti, sounds, runway mini-game
window.MALL_FUN = (() => {
  const FRIEND_LINES = [
    "Omg wait that is SO cute on you!!",
    "Girl run to Sephora before it gets busy",
    "Okay the vibe is elite today",
    "If you buy that bag I need pics",
    "Main character energy unlocked",
    "Slay. Literally. In the mall.",
    "There’s a runway later — get cute fast",
    "Your style points are going crazy",
    "Cashier better give you a pretty bag",
    "I’d wear that to Berry Ave tbh",
  ];

  const MISSION_POOL = [
    {
      id: "pink3",
      title: "Pink Hunt",
      detail: "Grab 3 pink / rose items",
      goal: 3,
      check: (ctx) => ctx.inventory.filter((id) => /pink|rose|blush|berry|peony|dragée|sakura|confetti|foam|mist/i.test(ctx.items[id]?.name || "")).length,
      reward: 120,
    },
    {
      id: "sephora",
      title: "Sephora Dash",
      detail: "Take 2 things from Sephora",
      goal: 2,
      check: (ctx) => ctx.inventory.filter((id) => ctx.items[id]?.storeId === "sephora").length,
      reward: 100,
    },
    {
      id: "tryon",
      title: "Fitting Room Glow-up",
      detail: "Try on 2 inventory items",
      goal: 2,
      check: (ctx) => ctx.tryOns,
      reward: 90,
    },
    {
      id: "checkout",
      title: "Shopping Spree",
      detail: "Buy from any cashier",
      goal: 1,
      check: (ctx) => ctx.purchases,
      reward: 150,
    },
    {
      id: "stores2",
      title: "Mall Hopper",
      detail: "Enter 2 different stores",
      goal: 2,
      check: (ctx) => ctx.storesEntered.size,
      reward: 110,
    },
    {
      id: "runway",
      title: "Runway Ready",
      detail: "Do the runway mini-game once",
      goal: 1,
      check: (ctx) => ctx.runwayPlays,
      reward: 200,
    },
  ];

  let audioCtx = null;
  let musicTimer = null;
  let musicOn = false;

  function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function beep(freq, dur, type = "sine", gain = 0.03) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.stop(ctx.currentTime + dur);
  }

  function sfxGrab() {
    beep(660, 0.08, "triangle", 0.04);
    setTimeout(() => beep(880, 0.1, "triangle", 0.035), 70);
  }
  function sfxBuy() {
    beep(523, 0.09, "square", 0.03);
    setTimeout(() => beep(659, 0.09, "square", 0.03), 90);
    setTimeout(() => beep(784, 0.14, "square", 0.035), 180);
  }
  function sfxMission() {
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.12, "sine", 0.04), i * 90));
  }
  function sfxChat() {
    beep(990, 0.05, "sine", 0.02);
  }

  function startMusic() {
    const ctx = ensureAudio();
    if (!ctx || musicOn) return;
    musicOn = true;
    const notes = [262, 330, 392, 330, 349, 392, 523, 392];
    let i = 0;
    musicTimer = setInterval(() => {
      if (!musicOn) return;
      beep(notes[i % notes.length], 0.12, "triangle", 0.018);
      i += 1;
    }, 220);
  }

  function stopMusic() {
    musicOn = false;
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
  }

  function confetti(count = 40) {
    const layer = document.getElementById("fxLayer");
    if (!layer) return;
    for (let i = 0; i < count; i += 1) {
      const p = document.createElement("i");
      p.className = "confetti";
      p.style.left = `${Math.random() * 100}%`;
      p.style.background = ["#ff4f9a", "#ffd36b", "#ff8fb7", "#fff", "#b388ff"][i % 5];
      p.style.animationDelay = `${Math.random() * 0.2}s`;
      p.style.transform = `rotate(${Math.random() * 180}deg)`;
      layer.appendChild(p);
      setTimeout(() => p.remove(), 1400);
    }
  }

  function floatText(text) {
    const layer = document.getElementById("fxLayer");
    if (!layer) return;
    const el = document.createElement("div");
    el.className = "float-text";
    el.textContent = text;
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }

  function showChat(line) {
    const box = document.getElementById("friendChat");
    if (!box) return;
    box.hidden = false;
    box.querySelector(".friend-chat__text").textContent = line || FRIEND_LINES[Math.floor(Math.random() * FRIEND_LINES.length)];
    sfxChat();
    clearTimeout(showChat._t);
    showChat._t = setTimeout(() => {
      box.hidden = true;
    }, 2800);
  }

  function pickMission(excludeId) {
    const pool = MISSION_POOL.filter((m) => m.id !== excludeId);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function runwayScore(outfitSlotsFilled) {
    const base = 40 + outfitSlotsFilled * 12;
    const timing = 20 + Math.floor(Math.random() * 40);
    return Math.min(100, base + timing);
  }

  return {
    FRIEND_LINES,
    MISSION_POOL,
    pickMission,
    confetti,
    floatText,
    showChat,
    startMusic,
    stopMusic,
    sfxGrab,
    sfxBuy,
    sfxMission,
    runwayScore,
    ensureAudio,
  };
})();
