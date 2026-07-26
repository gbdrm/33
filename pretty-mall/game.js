(() => {
  "use strict";

  if (!window.THREE) {
    document.body.innerHTML =
      "<p style='padding:2rem;font-family:sans-serif;max-width:28rem;line-height:1.45'>Could not load the 3D engine. Open the newest <strong>v7</strong> link (Three.js is built into that file), or play from <code>pretty-mall/index.html</code> with the local vendor folder.</p>";
    return;
  }

  const THREE = window.THREE;
  const data = window.MALL_DATA;
  const art = window.MALL_ART;

  const storesById = Object.fromEntries(data.stores.map((s) => [s.id, s]));
  const itemsById = {};
  data.stores.forEach((store) => {
    store.items.forEach((item) => {
      itemsById[item.id] = { ...item, storeId: store.id, storeName: store.name };
    });
  });
  itemsById[data.prize.id] = { ...data.prize, storeId: "prize", storeName: "Prize" };

  const state = {
    floor: 1,
    storeId: null, // null = hallway
    inventory: [],
    owned: new Set(),
    equipped: { top: null, bottom: null, shoes: null, bag: null, accessory: null },
    bags: [],
    purchasedStores: new Set(),
    prizeClaimed: false,
    toastTimer: null,
    keys: new Set(),
    stick: { active: false, x: 0, y: 0 },
    looking: false,
    yaw: 0,
    pitch: 0,
    nearby: null,
    interactables: [],
    textureCache: new Map(),
  };

  const player = {
    x: 0,
    y: 1.6,
    z: 8,
    speed: 4.2,
    radius: 0.35,
  };

  // DOM
  const viewport = document.getElementById("viewport");
  const promptEl = document.getElementById("prompt");
  const locationBadge = document.getElementById("locationBadge");
  const lookHint = document.getElementById("lookHint");

  // Three.js setup — keep this simple for iPad / HTML preview WebGL
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "default" });
  } catch (err) {
    viewport.innerHTML =
      "<p style='padding:2rem;color:#fff;font-family:sans-serif'>WebGL is blocked in this browser preview. Try Safari settings → allow 3D / WebGL, or open the file outside the preview site.</p>";
    return;
  }
  renderer.setClearColor("#f5d0e8", 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }
  renderer.shadowMap.enabled = false;
  viewport.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#f7d6ea");
  scene.fog = new THREE.Fog("#f7d6ea", 35, 70);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(player.x, player.y, player.z);
  // Look down the hall immediately (human eye view)
  state.yaw = Math.PI;
  camera.rotation.order = "YXZ";
  camera.rotation.y = state.yaw;
  camera.rotation.x = 0;

  const clock = new THREE.Clock();
  const raycaster = new THREE.Raycaster();
  const centerNDC = new THREE.Vector2(0, 0);
  const worldGroup = new THREE.Group();
  scene.add(worldGroup);

  const colliders = []; // {minX,maxX,minZ,maxZ}
  let doorZones = []; // {storeId, minX,maxX,minZ,maxZ, label}
  let floorZones = [];

  function toast(message) {
    let node = document.getElementById("toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "toast";
      node.style.cssText =
        "position:fixed;left:50%;bottom:9rem;transform:translateX(-50%);z-index:40;background:#fff;border:1px solid rgba(255,143,183,.45);padding:.7rem 1rem;border-radius:999px;font-weight:800;box-shadow:0 10px 30px rgba(255,105,180,.25);max-width:90vw;text-align:center;";
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.hidden = false;
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => {
      node.hidden = true;
    }, 1600);
  }

  function openModal(id) {
    document.getElementById(id).hidden = false;
  }
  function closeModal(id) {
    document.getElementById(id).hidden = true;
  }
  function modalOpen() {
    return [...document.querySelectorAll(".modal")].some((m) => !m.hidden) || !lookHint.hidden;
  }

  function getTexture(url) {
    if (state.textureCache.has(url)) return state.textureCache.get(url);
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const tex = loader.load(
      url,
      undefined,
      undefined,
      () => {
        /* photo failed — solid color fallback stays visible */
      }
    );
    if (THREE.SRGBColorSpace && "colorSpace" in tex) tex.colorSpace = THREE.SRGBColorSpace;
    state.textureCache.set(url, tex);
    return tex;
  }

  function box(w, h, d, color, x, y, z, opts = {}) {
    const geo = new THREE.BoxGeometry(w, h, d);
    // MeshBasicMaterial = always visible on iPad (no lighting required)
    const mat = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    worldGroup.add(mesh);
    if (opts.collide) {
      colliders.push({
        minX: x - w / 2 - 0.05,
        maxX: x + w / 2 + 0.05,
        minZ: z - d / 2 - 0.05,
        maxZ: z + d / 2 + 0.05,
      });
    }
    return mesh;
  }

  function photoPlane(item, w, h, x, y, z, rotY = 0, meta = {}) {
    const url = art.photoUrlForItem(item);
    const tex = getTexture(url);
    const geo = new THREE.PlaneGeometry(w, h);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      color: item.swatch || "#ffffff",
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.y = rotY;
    // thin backing for 3D depth
    const back = box(w * 0.98, h * 0.98, 0.06, item.swatch || "#ddd", x, y, z);
    back.rotation.y = rotY;
    back.position.set(x - Math.sin(rotY) * 0.04, y, z - Math.cos(rotY) * 0.04);
    mesh.userData = {
      type: "item",
      itemId: item.id,
      label: item.name,
      ...meta,
    };
    worldGroup.add(mesh);
    state.interactables.push(mesh);
    return mesh;
  }

  function makeMannequin(x, z, item) {
    // blocky mannequin body
    box(0.28, 0.35, 0.2, "#f0d2c0", x, 1.25, z, { collide: true });
    box(0.18, 0.18, 0.18, "#f0d2c0", x, 1.55, z);
    box(0.08, 0.55, 0.08, "#e5c3ad", x - 0.08, 0.55, z);
    box(0.08, 0.55, 0.08, "#e5c3ad", x + 0.08, 0.55, z);
    box(0.25, 0.04, 0.25, "#d9c4b0", x, 0.25, z);
    photoPlane(item, 0.55, 0.55, x, 1.15, z + 0.22, 0, { kind: "mannequin" });
  }

  function makeHanger(x, z, item, rotY = 0) {
    box(0.7, 0.03, 0.03, "#c9a27c", x, 1.7, z);
    box(0.04, 0.2, 0.04, "#b08968", x, 1.8, z);
    photoPlane(item, 0.48, 0.62, x, 1.25, z + 0.05, rotY, { kind: "hanger" });
  }

  function makeShelfItem(x, y, z, item, rotY = 0) {
    box(0.55, 0.04, 0.35, "#d9b896", x, y - 0.28, z, { collide: true });
    photoPlane(item, 0.42, 0.42, x, y, z + 0.02, rotY, { kind: "shelf" });
  }

  function clearWorld() {
    while (worldGroup.children.length) {
      const obj = worldGroup.children.pop();
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    }
    colliders.length = 0;
    doorZones = [];
    floorZones = [];
    state.interactables = [];
  }

  function addLights() {
    // Basic materials don't need lights, but keep a tiny ambient for future use
    const ambient = new THREE.AmbientLight(0xffffff, 1);
    worldGroup.add(ambient);
  }

  function buildHallway(floor) {
    clearWorld();
    scene.background = new THREE.Color("#f3c9e0");
    scene.fog = new THREE.Fog("#f3c9e0", 40, 75);
    addLights();

    const stores = data.stores.filter((s) => s.floor === floor);
    const hallLen = Math.max(28, stores.length * 5.2 + 8);

    // Big visible floor / ceiling / walls (bright so they never look like "only blue")
    box(14, 0.25, hallLen + 10, "#f2b8d4", 0, -0.12, -hallLen / 2 + 2);
    box(14, 0.25, hallLen + 10, "#ffe9f4", 0, 3.5, -hallLen / 2 + 2);
    box(0.5, 3.6, hallLen + 10, "#ff8fb7", -6.5, 1.7, -hallLen / 2 + 2, { collide: true });
    box(0.5, 3.6, hallLen + 10, "#ff8fb7", 6.5, 1.7, -hallLen / 2 + 2, { collide: true });

    // Guide carpet down the middle
    box(2.2, 0.03, hallLen, "#ff4f9a", 0, 0.02, -hallLen / 2 + 2);

    // Welcome billboard right in front of spawn
    box(4.5, 1.4, 0.12, "#ffffff", 0, 1.8, 3.2);
    box(4.2, 1.1, 0.08, "#ff4f9a", 0, 1.8, 3.14);

    // elevator booth
    box(2.2, 2.6, 2.2, "#ffd36b", -4.2, 1.3, 5.5, { collide: true });
    box(1.4, 2.1, 0.08, "#ffffff", -4.2, 1.2, 6.65);
    const elev = box(1.5, 0.9, 0.2, "#fff4c2", -4.2, 1.3, 6.8);
    elev.userData = {
      type: "elevator",
      label: `Elevator to Level ${floor === 3 ? 1 : floor + 1}`,
      nextFloor: floor === 3 ? 1 : floor + 1,
    };
    state.interactables.push(elev);
    floorZones.push({
      type: "elevator",
      nextFloor: floor === 3 ? 1 : floor + 1,
      minX: -5.2,
      maxX: -3.2,
      minZ: 4.8,
      maxZ: 7.2,
      label: `Elevator to Level ${floor === 3 ? 1 : floor + 1}`,
    });

    // fountain
    box(1.8, 0.25, 1.8, "#8fd3ff", 0, 0.2, 1.2);
    box(0.25, 1.1, 0.25, "#ffffff", 0, 0.8, 1.2);

    stores.forEach((store, i) => {
      const z = -1.5 - i * 5.2;
      const side = i % 2 === 0 ? -1 : 1;
      const wallX = side * 4.35;
      // storefront building block
      box(2.8, 2.9, 4.2, "#fffafc", wallX, 1.45, z, { collide: true });
      box(3.0, 0.3, 4.4, store.fancy ? "#ff8fb7" : "#9ad0ff", wallX, 3.0, z);
      // sign
      box(2.1, 0.45, 0.1, store.color || "#333", wallX + side * -1.45, 2.4, z);
      // glass door facing the hallway
      const door = box(1.2, 2.2, 0.1, "#5ec2ff", wallX + side * -1.45, 1.15, z + 1.0);
      door.userData = { type: "door", storeId: store.id, label: `Enter ${store.name}` };
      state.interactables.push(door);
      // window product tease facing hallway
      const tease = store.items[0];
      if (tease) {
        photoPlane(
          itemsById[tease.id],
          0.85,
          0.85,
          wallX + side * -1.48,
          1.55,
          z - 0.3,
          side > 0 ? Math.PI / 2 : -Math.PI / 2
        );
      }
      doorZones.push({
        storeId: store.id,
        label: `Enter ${store.name}`,
        minX: Math.min(wallX + side * -2.0, wallX + side * -0.7),
        maxX: Math.max(wallX + side * -2.0, wallX + side * -0.7),
        minZ: z + 0.3,
        maxZ: z + 1.7,
      });
    });

    // Spawn in the hall looking at stores (not the empty sky)
    player.x = 0;
    player.z = 6.5;
    state.yaw = Math.PI;
    state.pitch = 0;
    camera.position.set(player.x, player.y, player.z);
    camera.rotation.order = "YXZ";
    camera.rotation.y = state.yaw;
    camera.rotation.x = state.pitch;
    updateLocationBadge();
  }

  function buildStore(storeId) {
    const store = storesById[storeId];
    clearWorld();
    scene.background = new THREE.Color("#ffe6f2");
    scene.fog = new THREE.Fog("#ffe6f2", 20, 40);
    addLights();
    state.storeId = storeId;

    // room shell
    box(12, 0.2, 12, store.floorColor || "#f4ebe3", 0, 0, 0, { roughness: 1 });
    box(12, 0.2, 12, "#ffffff", 0, 3.2, 0);
    box(0.3, 3.2, 12, "#fff7fb", -6, 1.6, 0, { collide: true });
    box(0.3, 3.2, 12, "#fff7fb", 6, 1.6, 0, { collide: true });
    box(12, 3.2, 0.3, store.color || "#333", 0, 1.6, -6, { collide: true });
    box(12, 3.2, 0.3, "#ffeaf3", 0, 1.6, 6, { collide: true });

    // brand sign
    box(4.5, 0.7, 0.12, store.color || "#222", 0, 2.6, -5.7);

    // exit
    const exit = box(1.8, 0.08, 1.0, "#4a2b3b", 0, 0.12, 5.1);
    exit.userData = { type: "exit", label: "Exit to mall hallway" };
    state.interactables.push(exit);
    doorZones.push({ type: "exit", label: "Exit to mall hallway", minX: -1.1, maxX: 1.1, minZ: 4.4, maxZ: 5.7 });

    // dressing room
    box(2.6, 2.4, 2.2, "#f1d4ff", -4.2, 1.2, -3.8, { collide: true });
    const dress = box(1.2, 2.0, 0.08, "#ff8fb7", -4.2, 1.1, -2.65);
    dress.userData = { type: "dressing", label: "Dressing Room — try on inventory" };
    state.interactables.push(dress);
    doorZones.push({
      type: "dressing",
      label: "Dressing Room — try on inventory",
      minX: -5.2,
      maxX: -3.2,
      minZ: -3.1,
      maxZ: -1.9,
    });

    // cashier counter
    box(2.8, 1.0, 1.1, "#e8d5a3", 4.0, 0.55, -3.6, { collide: true });
    box(0.35, 0.8, 0.25, "#ffd7bf", 4.0, 1.35, -3.6); // cashier body
    box(0.28, 0.28, 0.28, "#ffd7bf", 4.0, 1.85, -3.6); // head
    const cashier = box(1.6, 0.5, 0.4, "#fff4c2", 4.0, 1.2, -2.9);
    cashier.userData = { type: "cashier", label: `${store.name} Cashier` };
    state.interactables.push(cashier);
    doorZones.push({
      type: "cashier",
      label: `${store.name} Cashier`,
      minX: 2.8,
      maxX: 5.2,
      minZ: -3.3,
      maxZ: -1.8,
    });

    // place products in 3D
    let hi = 0;
    let mi = 0;
    let si = 0;
    store.items.forEach((raw) => {
      const item = itemsById[raw.id];
      if (raw.display === "hanger") {
        const x = -3.5 + (hi % 5) * 0.85;
        const z = 1.2 - Math.floor(hi / 5) * 1.1;
        makeHanger(x, z, item);
        hi += 1;
      } else if (raw.display === "mannequin") {
        const x = 0.2 + (mi % 3) * 1.3;
        const z = 0.8 - Math.floor(mi / 3) * 1.5;
        makeMannequin(x, z, item);
        mi += 1;
      } else {
        const x = -2.5 + (si % 6) * 0.85;
        const z = 3.2;
        const y = 1.05 + Math.floor(si / 6) * 0.7;
        makeShelfItem(x, y, z, item);
        si += 1;
      }
    });

    player.x = 0;
    player.z = 4.2;
    state.yaw = Math.PI;
    state.pitch = 0;
    updateLocationBadge();
    toast(`You walked into ${store.name}`);
  }

  function updateLocationBadge() {
    if (!state.storeId) locationBadge.textContent = `Mall Hallway · Level ${state.floor}`;
    else locationBadge.textContent = `${storesById[state.storeId].name} · Level ${state.floor}`;
  }

  function renderAvatar(target, equipped = state.equipped) {
    const top = equipped.top ? itemsById[equipped.top] : null;
    const bottom = equipped.bottom ? itemsById[equipped.bottom] : null;
    const shoes = equipped.shoes ? itemsById[equipped.shoes] : null;
    const bag = equipped.bag ? itemsById[equipped.bag] : null;
    const acc = equipped.accessory ? itemsById[equipped.accessory] : null;
    const torso = top ? top.swatch : "#ff9ec8";
    const legs = bottom ? bottom.swatch : "#f7c1d8";
    const shoe = shoes ? shoes.swatch : "#ffffff";
    const bagColor = bag ? bag.swatch : "#d4a017";
    const accColor = acc ? acc.swatch : "#ffd700";
    const showCrown = acc && acc.id === "prize-crown";
    target.innerHTML = `
      <div class="roblox" aria-hidden="true"><div class="roblox__body">
        <div class="roblox__hair"></div>
        <div class="roblox__acc ${acc ? "is-on" : ""}" style="background:${accColor}; ${
          showCrown ? "" : "clip-path:none;border-radius:10px;height:12px;top:44px;width:20px;left:45px;"
        }"></div>
        <div class="roblox__head"><div class="roblox__face"><div class="roblox__smile"></div></div></div>
        <div class="roblox__arm roblox__arm--l"><div class="roblox__sleeve" style="background:${torso}"></div></div>
        <div class="roblox__arm roblox__arm--r"><div class="roblox__sleeve" style="background:${torso}"></div></div>
        <div class="roblox__torso" style="background:${torso}"></div>
        <div class="roblox__leg roblox__leg--l" style="background:${legs}"></div>
        <div class="roblox__leg roblox__leg--r" style="background:${legs}"></div>
        <div class="roblox__shoe roblox__shoe--l" style="background:${shoe}"></div>
        <div class="roblox__shoe roblox__shoe--r" style="background:${shoe}"></div>
        <div class="roblox__bag ${bag ? "is-on" : ""}" style="background:${bagColor}"></div>
      </div></div>`;
  }

  function renderEquippedList() {
    const chips = Object.values(state.equipped)
      .filter(Boolean)
      .map((id) => `<span class="chip">${itemsById[id].name.split("—")[0].trim()}</span>`);
    document.getElementById("equippedList").innerHTML = chips.length
      ? chips.join("")
      : `<span class="chip">Base look</span>`;
  }

  function updateProgress() {
    document.getElementById("progressText").textContent = `${state.purchasedStores.size} / ${data.stores.length}`;
    const banner = document.getElementById("prizeBanner");
    if (state.purchasedStores.size >= data.stores.length) {
      banner.hidden = false;
      if (!state.prizeClaimed) {
        openModal("prizeModal");
        renderAvatar(document.getElementById("prizeAvatar"));
      }
    }
  }

  function renderInventoryGrid(target) {
    const slots = [];
    for (let i = 0; i < data.inventorySlots; i += 1) {
      const itemId = state.inventory[i];
      if (!itemId) {
        slots.push(`<div class="inv-slot empty"></div>`);
        continue;
      }
      const item = itemsById[itemId];
      const owned = state.owned.has(itemId);
      slots.push(`
        <button type="button" class="inv-slot ${owned ? "is-owned" : ""}" data-item="${itemId}">
          <img class="product-thumb" src="${art.photoUrlForItem(item)}" alt="${item.name}" loading="lazy" />
          <strong>${item.name}</strong>
          <span>${item.material || item.slot}${owned ? " · owned" : ""}</span>
        </button>`);
    }
    target.innerHTML = slots.join("");
  }

  function openInventory() {
    renderInventoryGrid(document.getElementById("inventoryGrid"));
    openModal("inventoryModal");
  }

  function addToInventory(itemId) {
    if (state.owned.has(itemId)) return toast("Already purchased");
    if (state.inventory.includes(itemId)) return toast("Already in Inventory");
    if (state.inventory.length >= data.inventorySlots) return toast("Inventory full");
    state.inventory.push(itemId);
    toast(`Took ${itemsById[itemId].name}`);
  }

  function tryOn(itemId) {
    const item = itemsById[itemId];
    if (!item) return;
    state.equipped[item.slot] = itemId;
    renderAvatar(document.getElementById("avatarStage"));
    renderAvatar(document.getElementById("fittingAvatar"));
    renderEquippedList();
    toast(`Tried on ${item.name}`);
  }

  function openDressingRoom() {
    renderInventoryGrid(document.getElementById("fittingInventory"));
    renderAvatar(document.getElementById("fittingAvatar"));
    openModal("fittingModal");
  }

  function openCashier() {
    const store = storesById[state.storeId];
    const pending = state.inventory.filter(
      (id) => itemsById[id]?.storeId === store.id && !state.owned.has(id)
    );
    document.getElementById("cashierStore").textContent = store.name;
    const extra = data.cashierLines[Math.floor(Math.random() * data.cashierLines.length)];
    document.getElementById("cashierLine").textContent = `${store.cashier} ${extra}`;
    const list = document.getElementById("checkoutList");
    const buyBtn = document.getElementById("btnBuyAll");
    if (!pending.length) {
      list.innerHTML = `<p class="tip">No unpaid items from ${store.name} yet. Look at hangers/mannequins and tap Do.</p>`;
      buyBtn.disabled = true;
    } else {
      buyBtn.disabled = false;
      list.innerHTML = pending
        .map((id) => {
          const item = itemsById[id];
          return `<label class="checkout-row">
            <input type="checkbox" name="buy" value="${id}" checked />
            <img src="${art.photoUrlForItem(item)}" alt="" />
            <div><strong>${item.name}</strong>
            <span style="display:block;color:var(--mute);font-size:.75rem;">$${Number(item.price).toLocaleString()} · $∞</span></div>
          </label>`;
        })
        .join("");
    }
    openModal("cashierModal");
  }

  function buySelected() {
    const store = storesById[state.storeId];
    const checked = [...document.querySelectorAll('#checkoutList input[name="buy"]:checked')].map((el) => el.value);
    if (!checked.length) return toast("Select at least one item");
    checked.forEach((id) => state.owned.add(id));
    state.purchasedStores.add(store.id);
    state.bags.push({ storeId: store.id, storeName: store.name, itemIds: [...checked], color: store.color });
    closeModal("cashierModal");
    toast(`${store.name} cashier: here’s your shopping bag`);
    updateProgress();
  }

  function renderBags() {
    const el = document.getElementById("bagsList");
    if (!state.bags.length) {
      el.innerHTML = `<p class="tip">No bags yet.</p>`;
      return;
    }
    el.innerHTML = state.bags
      .slice()
      .reverse()
      .map((bag) => {
        const names = bag.itemIds.map((id) => itemsById[id]?.name || "Item").join(", ");
        return `<div class="bag-card"><div class="bag-icon" style="background:linear-gradient(180deg, ${bag.color}aa, ${bag.color})"></div>
          <div><strong>${bag.storeName} Shopping Bag</strong>
          <span style="display:block;color:var(--mute);font-size:.8rem;">${names}</span></div></div>`;
      })
      .join("");
  }

  function claimPrize() {
    if (!state.inventory.includes(data.prize.id)) state.inventory.unshift(data.prize.id);
    state.owned.add(data.prize.id);
    state.equipped.accessory = data.prize.id;
    state.prizeClaimed = true;
    renderAvatar(document.getElementById("avatarStage"));
    renderEquippedList();
    closeModal("prizeModal");
    toast("Crown added to Inventory");
  }

  function blocked(nx, nz) {
    for (const c of colliders) {
      if (nx > c.minX && nx < c.maxX && nz > c.minZ && nz < c.maxZ) return true;
    }
    return false;
  }

  function findZone() {
    for (const z of doorZones) {
      if (player.x > z.minX && player.x < z.maxX && player.z > z.minZ && player.z < z.maxZ) return z;
    }
    for (const z of floorZones) {
      if (player.x > z.minX && player.x < z.maxX && player.z > z.minZ && player.z < z.maxZ) return z;
    }
    return null;
  }

  function updateNearby() {
    raycaster.setFromCamera(centerNDC, camera);
    const hits = raycaster.intersectObjects(state.interactables, false);
    let near = null;
    if (hits.length && hits[0].distance < 3.2) {
      const ud = hits[0].object.userData;
      if (ud?.type === "item") {
        const item = itemsById[ud.itemId];
        const status = state.owned.has(ud.itemId)
          ? " (owned)"
          : state.inventory.includes(ud.itemId)
            ? " (in inventory)"
            : "";
        near = {
          type: "item",
          itemId: ud.itemId,
          label: `${ud.kind || "Item"}: ${item.name}${status}`,
        };
      } else if (ud) {
        near = { ...ud };
      }
    }
    if (!near) {
      const zone = findZone();
      if (zone) near = { ...zone, type: zone.type || "door" };
    }
    state.nearby = near;
    if (near) {
      promptEl.hidden = false;
      promptEl.textContent = `${near.label} · tap / Do / E`;
    } else {
      promptEl.hidden = true;
    }
  }

  function doInteract() {
    const n = state.nearby;
    if (!n) return;
    if (n.type === "door" && n.storeId) buildStore(n.storeId);
    else if (n.type === "exit") {
      state.storeId = null;
      buildHallway(state.floor);
      toast("Back in the mall hallway");
    } else if (n.type === "elevator") {
      state.floor = n.nextFloor;
      state.storeId = null;
      buildHallway(state.floor);
      toast(`Elevator → Level ${state.floor}`);
    } else if (n.type === "dressing") openDressingRoom();
    else if (n.type === "cashier") openCashier();
    else if (n.type === "item") addToInventory(n.itemId);
  }

  function updateMovement(dt) {
    let mx = 0;
    let mz = 0;
    if (state.keys.has("ArrowUp") || state.keys.has("w") || state.keys.has("W")) mz -= 1;
    if (state.keys.has("ArrowDown") || state.keys.has("s") || state.keys.has("S")) mz += 1;
    if (state.keys.has("ArrowLeft") || state.keys.has("a") || state.keys.has("A")) mx -= 1;
    if (state.keys.has("ArrowRight") || state.keys.has("d") || state.keys.has("D")) mx += 1;
    if (state.stick.active) {
      mx += state.stick.x;
      mz += state.stick.y;
    }
    const len = Math.hypot(mx, mz);
    if (len > 1) {
      mx /= len;
      mz /= len;
    }
    const sin = Math.sin(state.yaw);
    const cos = Math.cos(state.yaw);
    const dx = (mx * cos + mz * sin) * player.speed * dt;
    const dz = (-mx * sin + mz * cos) * player.speed * dt;
    const nx = player.x + dx;
    const nz = player.z + dz;
    if (!blocked(nx, player.z)) player.x = nx;
    if (!blocked(player.x, nz)) player.z = nz;

    camera.position.set(player.x, player.y, player.z);
    camera.rotation.order = "YXZ";
    camera.rotation.y = state.yaw;
    camera.rotation.x = state.pitch;
  }

  function onLookMove(dx, dy) {
    state.yaw -= dx * 0.0025;
    state.pitch -= dy * 0.0022;
    state.pitch = Math.max(-1.2, Math.min(1.2, state.pitch));
  }

  // input
  window.addEventListener("keydown", (e) => {
    state.keys.add(e.key);
    if (e.key === "e" || e.key === "E") doInteract();
    if (e.key === "i" || e.key === "I") openInventory();
  });
  window.addEventListener("keyup", (e) => state.keys.delete(e.key));

  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  renderer.domElement.addEventListener("pointerdown", (e) => {
    if (modalOpen()) return;
    if (e.target.closest && e.target.closest(".stick, .interact-btn, .topbar, .side-panel")) return;
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    renderer.domElement.setPointerCapture(e.pointerId);
  });
  renderer.domElement.addEventListener("pointermove", (e) => {
    if (!dragging || modalOpen()) return;
    onLookMove(e.clientX - lastX, e.clientY - lastY);
    lastX = e.clientX;
    lastY = e.clientY;
  });
  renderer.domElement.addEventListener("pointerup", () => {
    dragging = false;
  });

  document.getElementById("btnStartLook").addEventListener("click", () => {
    lookHint.hidden = true;
    state.looking = true;
  });
  document.getElementById("btnInventory").addEventListener("click", openInventory);
  document.getElementById("btnBags").addEventListener("click", () => {
    renderBags();
    openModal("bagsModal");
  });
  document.getElementById("btnInteract").addEventListener("click", doInteract);
  document.getElementById("btnClearOutfit").addEventListener("click", () => {
    state.equipped = { top: null, bottom: null, shoes: null, bag: null, accessory: null };
    renderAvatar(document.getElementById("avatarStage"));
    renderAvatar(document.getElementById("fittingAvatar"));
    renderEquippedList();
  });
  document.getElementById("btnBuyAll").addEventListener("click", buySelected);
  document.getElementById("btnClaimPrize").addEventListener("click", claimPrize);
  document.getElementById("fittingInventory").addEventListener("click", (e) => {
    const slot = e.target.closest("[data-item]");
    if (slot) tryOn(slot.dataset.item);
  });
  document.getElementById("inventoryGrid").addEventListener("click", () => {
    toast("Walk into a Dressing Room to try items on");
  });
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.close));
  });
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.hidden = true;
    });
  });

  // stick
  const stick = document.getElementById("stick");
  const knob = document.getElementById("stickKnob");
  function setStick(clientX, clientY) {
    const rect = stick.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const max = 36;
    const len = Math.hypot(dx, dy) || 1;
    if (len > max) {
      dx = (dx / len) * max;
      dy = (dy / len) * max;
    }
    knob.style.left = `${35 + dx}px`;
    knob.style.top = `${35 + dy}px`;
    state.stick.active = true;
    state.stick.x = dx / max;
    state.stick.y = dy / max;
  }
  function clearStick() {
    state.stick.active = false;
    state.stick.x = 0;
    state.stick.y = 0;
    knob.style.left = "35px";
    knob.style.top = "35px";
  }
  stick.addEventListener("pointerdown", (e) => {
    stick.setPointerCapture(e.pointerId);
    setStick(e.clientX, e.clientY);
  });
  stick.addEventListener("pointermove", (e) => {
    if (state.stick.active) setStick(e.clientX, e.clientY);
  });
  stick.addEventListener("pointerup", clearStick);
  stick.addEventListener("pointercancel", clearStick);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function frame() {
    const dt = Math.min(0.033, clock.getDelta());
    if (!modalOpen()) {
      updateMovement(dt);
      updateNearby();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  // boot
  art.preloadAll(Object.values(itemsById));
  buildHallway(1);
  renderAvatar(document.getElementById("avatarStage"));
  renderEquippedList();
  updateProgress();
  requestAnimationFrame(frame);
})();
