(() => {
  "use strict";

  const data = window.MALL_DATA;
  const art = window.MALL_ART;
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  // iPad / older Safari may not have roundRect
  if (!ctx.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      const radius = typeof r === "number" ? r : 10;
      this.moveTo(x + radius, y);
      this.arcTo(x + w, y, x + w, y + h, radius);
      this.arcTo(x + w, y + h, x, y + h, radius);
      this.arcTo(x, y + h, x, y, radius);
      this.arcTo(x, y, x + w, y, radius);
      this.closePath();
      return this;
    };
  }

  const storesById = Object.fromEntries(data.stores.map((s) => [s.id, s]));
  const itemsById = {};
  data.stores.forEach((store) => {
    store.items.forEach((item) => {
      itemsById[item.id] = { ...item, storeId: store.id, storeName: store.name };
    });
  });
  itemsById[data.prize.id] = { ...data.prize, storeId: "prize", storeName: "Prize" };

  const state = {
    scene: "mall", // mall | store
    floor: 1,
    storeId: null,
    inventory: [],
    owned: new Set(),
    equipped: { top: null, bottom: null, shoes: null, bag: null, accessory: null },
    bags: [],
    purchasedStores: new Set(),
    prizeClaimed: false,
    toastTimer: null,
    interactables: [],
    keys: new Set(),
    stick: { active: false, x: 0, y: 0 },
    nearby: null,
    camX: 0,
  };

  const player = {
    x: 180,
    y: 360,
    w: 28,
    h: 44,
    speed: 210,
    facing: 1,
  };

  // Mall corridor geometry
  const MALL_W = 2200;
  const MALL_H = 640;
  const STORE_W = 160;
  const STORE_H = 150;

  function floorStores(floor) {
    return data.stores.filter((s) => s.floor === floor);
  }

  function mallStoreRects(floor) {
    const list = floorStores(floor);
    return list.map((store, i) => {
      const x = 120 + i * (STORE_W + 40);
      return {
        store,
        x,
        y: 70,
        w: STORE_W,
        h: STORE_H,
        door: { x: x + STORE_W / 2 - 18, y: 70 + STORE_H - 8, w: 36, h: 18 },
      };
    });
  }

  function buildStoreInterior(storeId) {
    const store = storesById[storeId];
    const interactables = [];
    const room = { x: 40, y: 40, w: 1020, h: 560 };

    // Place items on hangers / mannequins / shelves
    let hx = 80;
    let mx = 80;
    let sx = 80;
    store.items.forEach((item, idx) => {
      const full = itemsById[item.id];
      if (item.display === "hanger") {
        interactables.push({
          type: "item",
          kind: "hanger",
          itemId: item.id,
          x: hx,
          y: 120 + (idx % 2) * 20,
          w: 54,
          h: 90,
          label: full.name,
        });
        hx += 70;
        if (hx > 520) hx = 80;
      } else if (item.display === "mannequin") {
        interactables.push({
          type: "item",
          kind: "mannequin",
          itemId: item.id,
          x: 560 + (mx % 280),
          y: 150 + Math.floor((mx - 80) / 280) * 130,
          w: 50,
          h: 110,
          label: full.name,
        });
        mx += 90;
      } else {
        interactables.push({
          type: "item",
          kind: "shelf",
          itemId: item.id,
          x: 70 + (sx % 8) * 70,
          y: 380 + Math.floor((sx - 80) / (70 * 8)) * 70,
          w: 56,
          h: 56,
          label: full.name,
        });
        sx += 70;
      }
    });

    interactables.push({
      type: "dressing",
      x: 820,
      y: 80,
      w: 200,
      h: 130,
      label: "Dressing Room",
    });
    interactables.push({
      type: "cashier",
      x: 820,
      y: 280,
      w: 200,
      h: 120,
      label: "Cashier",
    });
    interactables.push({
      type: "exit",
      x: 460,
      y: 540,
      w: 180,
      h: 40,
      label: "EXIT to Mall",
    });

    return { store, room, interactables };
  }

  let storeWorld = null;

  function enterStore(storeId) {
    state.scene = "store";
    state.storeId = storeId;
    storeWorld = buildStoreInterior(storeId);
    state.interactables = storeWorld.interactables;
    player.x = 520;
    player.y = 500;
    updateLocationBadge();
    toast(`Welcome to ${storesById[storeId].name}`);
  }

  function exitStore() {
    const storeId = state.storeId;
    state.scene = "mall";
    state.storeId = null;
    storeWorld = null;
    state.interactables = [];
    const rects = mallStoreRects(state.floor);
    const rect = rects.find((r) => r.store.id === storeId);
    if (rect) {
      player.x = rect.door.x + 10;
      player.y = rect.door.y + 30;
    }
    updateLocationBadge();
  }

  function changeFloor(floor) {
    state.floor = floor;
    player.x = 180;
    player.y = 360;
    updateLocationBadge();
    toast(`Elevator → Level ${floor}`);
  }

  function updateLocationBadge() {
    const el = document.getElementById("locationBadge");
    if (state.scene === "mall") {
      el.textContent = `Mall Corridor · Level ${state.floor}`;
    } else {
      el.textContent = `${storesById[state.storeId].name} · Floor ${state.floor}`;
    }
  }

  function toast(message) {
    let node = document.getElementById("toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "toast";
      node.style.cssText =
        "position:fixed;left:50%;bottom:6.5rem;transform:translateX(-50%);z-index:40;background:#fff;border:1px solid rgba(255,143,183,.45);padding:.7rem 1rem;border-radius:999px;font-weight:800;box-shadow:0 10px 30px rgba(255,105,180,.25);max-width:90vw;text-align:center;";
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

  function openInventory() {
    renderInventoryGrid(document.getElementById("inventoryGrid"));
    openModal("inventoryModal");
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
      <div class="roblox" aria-hidden="true">
        <div class="roblox__body">
          <div class="roblox__hair"></div>
          <div class="roblox__acc ${acc ? "is-on" : ""}" style="background:${accColor}; ${
            showCrown ? "" : "clip-path:none;border-radius:10px;height:12px;top:48px;width:22px;left:49px;"
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
        </div>
      </div>`;
  }

  function renderEquippedList() {
    const chips = Object.values(state.equipped)
      .filter(Boolean)
      .map((id) => `<span class="chip">${itemsById[id].name.split("—")[0].trim()}</span>`);
    document.getElementById("equippedList").innerHTML = chips.length
      ? chips.join("")
      : `<span class="chip">Base Roblox look</span>`;
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
      const photo = art.photoUrlForItem(item);
      slots.push(`
        <button type="button" class="inv-slot ${owned ? "is-owned" : ""}" data-item="${itemId}">
          <img class="product-thumb" src="${photo}" alt="${item.name}" loading="lazy" />
          <strong>${item.name}</strong>
          <span>${item.material || item.slot}${owned ? " · owned" : ""}</span>
        </button>`);
    }
    target.innerHTML = slots.join("");
  }

  function addToInventory(itemId) {
    if (state.owned.has(itemId)) {
      toast("Already purchased");
      return false;
    }
    if (state.inventory.includes(itemId)) {
      toast("Already in inventory — open Inventory button to see it");
      return false;
    }
    if (state.inventory.length >= data.inventorySlots) {
      toast("Inventory full");
      return false;
    }
    state.inventory.push(itemId);
    const item = itemsById[itemId];
    toast(`Took ${item.name} → Inventory`);
    return true;
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
      list.innerHTML = `<p class="tip">No unpaid ${store.name} items yet. Click hangers or mannequins to take items, then come back.</p>`;
      buyBtn.disabled = true;
    } else {
      buyBtn.disabled = false;
      list.innerHTML = pending
        .map((id) => {
          const item = itemsById[id];
          const photo = art.photoUrlForItem(item);
          return `<label class="checkout-row">
            <input type="checkbox" name="buy" value="${id}" checked />
            <img src="${photo}" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:10px;flex:0 0 44px;" />
            <div><strong>${item.name}</strong>
            <span style="display:block;color:var(--mute);font-size:.75rem;">$${Number(item.price).toLocaleString()} · ${item.material || ""} · $∞ wallet</span></div>
          </label>`;
        })
        .join("");
    }
    openModal("cashierModal");
  }

  function buySelected() {
    const store = storesById[state.storeId];
    const checked = [...document.querySelectorAll('#checkoutList input[name="buy"]:checked')].map(
      (el) => el.value
    );
    if (!checked.length) {
      toast("Select at least one item");
      return;
    }
    checked.forEach((id) => state.owned.add(id));
    state.purchasedStores.add(store.id);
    state.bags.push({
      storeId: store.id,
      storeName: store.name,
      itemIds: [...checked],
      color: store.color,
    });
    closeModal("cashierModal");
    toast(`${store.name} cashier handed you a shopping bag`);
    updateProgress();
  }

  function renderBags() {
    const el = document.getElementById("bagsList");
    if (!state.bags.length) {
      el.innerHTML = `<p class="tip">No bags yet — walk to a cashier and buy something.</p>`;
      return;
    }
    el.innerHTML = state.bags
      .slice()
      .reverse()
      .map((bag) => {
        const names = bag.itemIds.map((id) => itemsById[id]?.name || "Item").join(", ");
        return `<div class="bag-card">
          <div class="bag-icon" style="background:linear-gradient(180deg, ${bag.color}aa, ${bag.color})"></div>
          <div><strong>${bag.storeName} Shopping Bag</strong>
          <span style="display:block;color:var(--mute);font-size:.8rem;">${names}</span></div>
        </div>`;
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
    toast("Mall Princess Crown added to Inventory");
  }

  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function playerBox() {
    return { x: player.x, y: player.y, w: player.w, h: player.h };
  }

  function findNearby() {
    if (state.scene === "mall") {
      const rects = mallStoreRects(state.floor);
      for (const r of rects) {
        if (overlaps(playerBox(), { x: r.door.x - 10, y: r.door.y - 10, w: r.door.w + 20, h: 40 })) {
          return { type: "door", storeId: r.store.id, label: `Enter ${r.store.name}` };
        }
      }
      // elevators
      const elevators = [
        { floor: 1, x: 40, y: 300, w: 50, h: 80 },
        { floor: 2, x: 40, y: 300, w: 50, h: 80 },
        { floor: 3, x: 40, y: 300, w: 50, h: 80 },
      ];
      // single elevator panel with floor buttons area
      if (player.x < 100 && player.y > 260 && player.y < 420) {
        const next = state.floor === 3 ? 1 : state.floor + 1;
        return { type: "elevator", floor: next, label: `Elevator to Level ${next}` };
      }
      return null;
    }

    let best = null;
    let bestDist = 70;
    for (const obj of state.interactables) {
      const cx = obj.x + obj.w / 2;
      const cy = obj.y + obj.h / 2;
      const px = player.x + player.w / 2;
      const py = player.y + player.h / 2;
      const dist = Math.hypot(cx - px, cy - py);
      const near = dist < bestDist || overlaps(playerBox(), obj);
      if (near && dist < bestDist + 40) {
        bestDist = dist;
        if (obj.type === "item") {
          const item = itemsById[obj.itemId];
          const status = state.owned.has(obj.itemId)
            ? " (owned)"
            : state.inventory.includes(obj.itemId)
              ? " (in inventory)"
              : "";
          best = {
            type: "item",
            itemId: obj.itemId,
            label: `${obj.kind === "hanger" ? "Hanger" : obj.kind === "mannequin" ? "Mannequin" : "Display"}: ${item.name}${status}`,
            obj,
          };
        } else {
          best = { type: obj.type, label: obj.label, obj };
        }
      }
    }
    return best;
  }

  function doInteract() {
    const n = state.nearby;
    if (!n) return;
    if (n.type === "door") enterStore(n.storeId);
    else if (n.type === "elevator") changeFloor(n.floor);
    else if (n.type === "exit") exitStore();
    else if (n.type === "dressing") openDressingRoom();
    else if (n.type === "cashier") openCashier();
    else if (n.type === "item") addToInventory(n.itemId);
  }

  function canvasToWorld(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX + (state.scene === "mall" ? state.camX : 0),
      y: (clientY - rect.top) * scaleY,
    };
  }

  function clickInteractable(clientX, clientY) {
    const p = canvasToWorld(clientX, clientY);
    if (state.scene === "mall") {
      for (const r of mallStoreRects(state.floor)) {
        if (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) {
          // walk hint — if close enough enter
          if (overlaps(playerBox(), { x: r.door.x - 20, y: r.door.y - 20, w: 60, h: 50 })) {
            enterStore(r.store.id);
          } else {
            toast(`Walk to the ${r.store.name} door to go inside`);
          }
          return;
        }
      }
      return;
    }
    for (const obj of state.interactables) {
      if (p.x >= obj.x && p.x <= obj.x + obj.w && p.y >= obj.y && p.y <= obj.y + obj.h) {
        const px = player.x + player.w / 2;
        const py = player.y + player.h / 2;
        const dist = Math.hypot(obj.x + obj.w / 2 - px, obj.y + obj.h / 2 - py);
        if (dist > 120) {
          toast("Walk closer, then click");
          return;
        }
        if (obj.type === "item") addToInventory(obj.itemId);
        else if (obj.type === "dressing") openDressingRoom();
        else if (obj.type === "cashier") openCashier();
        else if (obj.type === "exit") exitStore();
        return;
      }
    }
  }

  function movePlayer(dt) {
    let mx = 0;
    let my = 0;
    if (state.keys.has("ArrowLeft") || state.keys.has("a") || state.keys.has("A")) mx -= 1;
    if (state.keys.has("ArrowRight") || state.keys.has("d") || state.keys.has("D")) mx += 1;
    if (state.keys.has("ArrowUp") || state.keys.has("w") || state.keys.has("W")) my -= 1;
    if (state.keys.has("ArrowDown") || state.keys.has("s") || state.keys.has("S")) my += 1;
    if (state.stick.active) {
      mx += state.stick.x;
      my += state.stick.y;
    }
    const len = Math.hypot(mx, my);
    if (len > 1) {
      mx /= len;
      my /= len;
    }
    if (mx !== 0) player.facing = mx > 0 ? 1 : -1;
    player.x += mx * player.speed * dt;
    player.y += my * player.speed * dt;

    if (state.scene === "mall") {
      player.x = Math.max(20, Math.min(MALL_W - 50, player.x));
      player.y = Math.max(240, Math.min(MALL_H - 60, player.y));
      // block into store fronts except doors
      for (const r of mallStoreRects(state.floor)) {
        const body = { x: r.x, y: r.y, w: r.w, h: r.h - 10 };
        if (overlaps(playerBox(), body) && !overlaps(playerBox(), { x: r.door.x - 8, y: r.door.y - 20, w: 50, h: 40 })) {
          // push down
          player.y = Math.max(player.y, r.y + r.h);
        }
      }
      state.camX = Math.max(0, Math.min(MALL_W - canvas.width, player.x - canvas.width / 2));
    } else if (storeWorld) {
      const room = storeWorld.room;
      player.x = Math.max(room.x + 8, Math.min(room.x + room.w - player.w - 8, player.x));
      player.y = Math.max(room.y + 8, Math.min(room.y + room.h - player.h - 8, player.y));
      state.camX = 0;
    }
  }

  function drawRobloxPlayer(x, y) {
    const top = state.equipped.top ? itemsById[state.equipped.top].swatch : "#ff9ec8";
    const bottom = state.equipped.bottom ? itemsById[state.equipped.bottom].swatch : "#f7c1d8";
    const shoes = state.equipped.shoes ? itemsById[state.equipped.shoes].swatch : "#ffffff";
    ctx.save();
    ctx.translate(x + player.w / 2, y);
    ctx.scale(player.facing, 1);
    // shadow
    ctx.fillStyle = "rgba(74,43,59,0.15)";
    ctx.beginPath();
    ctx.ellipse(0, player.h - 2, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // legs
    ctx.fillStyle = bottom;
    ctx.fillRect(-10, 24, 8, 16);
    ctx.fillRect(2, 24, 8, 16);
    // torso
    ctx.fillStyle = top;
    ctx.fillRect(-12, 10, 24, 16);
    // arms
    ctx.fillStyle = "#ffd7bf";
    ctx.fillRect(-18, 12, 6, 14);
    ctx.fillRect(12, 12, 6, 14);
    ctx.fillStyle = top;
    ctx.fillRect(-18, 12, 6, 6);
    ctx.fillRect(12, 12, 6, 6);
    // head
    ctx.fillStyle = "#ffd7bf";
    ctx.fillRect(-10, -8, 20, 18);
    ctx.fillStyle = "#6b3a2c";
    ctx.fillRect(-12, -12, 24, 8);
    // face
    ctx.fillStyle = "#4a2b3b";
    ctx.fillRect(-5, -1, 3, 3);
    ctx.fillRect(2, -1, 3, 3);
    // shoes
    ctx.fillStyle = shoes;
    ctx.fillRect(-11, 38, 10, 5);
    ctx.fillRect(1, 38, 10, 5);
    ctx.restore();
  }

  function drawHanger(obj, item) {
    const taken = state.inventory.includes(item.id) || state.owned.has(item.id);
    ctx.save();
    ctx.globalAlpha = taken ? 0.35 : 1;
    ctx.strokeStyle = "#c9a27c";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(obj.x, obj.y);
    ctx.lineTo(obj.x + obj.w, obj.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(obj.x + obj.w / 2, obj.y - 6, 6, Math.PI, 0);
    ctx.stroke();
    // real-looking product photo on the hanger
    art.drawProductPhoto(ctx, item, obj.x + 6, obj.y + 8, obj.w - 12, 58, item.swatch);
    ctx.fillStyle = "#4a2b3b";
    ctx.font = "700 9px Nunito, sans-serif";
    ctx.fillText("HANGER", obj.x + 6, obj.y + obj.h - 2);
    ctx.restore();
  }

  function drawMannequin(obj, item) {
    const taken = state.inventory.includes(item.id) || state.owned.has(item.id);
    ctx.save();
    ctx.globalAlpha = taken ? 0.35 : 1;
    const cx = obj.x + obj.w / 2;
    // Brookhaven-ish blocky mannequin stand
    ctx.fillStyle = "#e8d5c4";
    ctx.fillRect(cx - 10, obj.y + obj.h - 10, 20, 10);
    ctx.fillStyle = "#f0d2c0";
    ctx.fillRect(cx - 9, obj.y + 4, 18, 16);
    ctx.fillRect(cx - 14, obj.y + 22, 28, 34);
    ctx.fillRect(cx - 12, obj.y + 56, 10, 24);
    ctx.fillRect(cx + 2, obj.y + 56, 10, 24);
    // product photo plaque in front
    art.drawProductPhoto(ctx, item, obj.x + 4, obj.y + 28, obj.w - 8, obj.w - 8, item.swatch);
    ctx.fillStyle = "#4a2b3b";
    ctx.font = "700 8px Nunito, sans-serif";
    ctx.fillText("MANNEQUIN", obj.x - 2, obj.y + obj.h + 10);
    ctx.restore();
  }

  function drawShelf(obj, item) {
    const taken = state.inventory.includes(item.id) || state.owned.has(item.id);
    ctx.save();
    ctx.globalAlpha = taken ? 0.35 : 1;
    ctx.fillStyle = "#d9b896";
    ctx.fillRect(obj.x - 4, obj.y + obj.h - 12, obj.w + 8, 10);
    ctx.fillStyle = "#b08968";
    ctx.fillRect(obj.x - 2, obj.y + obj.h - 2, 4, 8);
    ctx.fillRect(obj.x + obj.w - 2, obj.y + obj.h - 2, 4, 8);
    art.drawProductPhoto(ctx, item, obj.x + 4, obj.y, obj.w - 8, obj.h - 16, item.swatch);
    ctx.restore();
  }

  function drawMall() {
    const cam = state.camX;
    // Brookhaven-like sky
    const sky = ctx.createLinearGradient(0, 0, 0, 220);
    sky.addColorStop(0, "#9ad9ff");
    sky.addColorStop(1, "#ffe6f2");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-cam, 0);

    // clouds
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    for (let i = 0; i < 10; i += 1) {
      const cx = 80 + i * 210;
      ctx.fillRect(cx, 36 + (i % 3) * 10, 70, 22);
      ctx.fillRect(cx + 20, 24 + (i % 3) * 10, 50, 20);
    }

    // grass plaza strip
    ctx.fillStyle = "#7dce6f";
    ctx.fillRect(0, 210, MALL_W, 50);
    // sidewalk
    ctx.fillStyle = "#ece7ef";
    ctx.fillRect(0, 255, MALL_W, 40);
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    for (let x = 0; x < MALL_W; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 255);
      ctx.lineTo(x, 295);
      ctx.stroke();
    }
    // road / walkway
    ctx.fillStyle = "#d5c6d0";
    ctx.fillRect(0, 295, MALL_W, MALL_H - 295);
    ctx.fillStyle = "#fff";
    for (let x = 0; x < MALL_W; x += 60) {
      ctx.fillRect(x, 420, 28, 6);
    }

    // fountain plaza (Berry Ave vibes)
    ctx.fillStyle = "#8fd3ff";
    ctx.beginPath();
    ctx.arc(980, 470, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(972, 430, 16, 40);
    ctx.fillStyle = "#bde7ff";
    ctx.beginPath();
    ctx.arc(980, 430, 12, 0, Math.PI * 2);
    ctx.fill();

    // elevators as blocky booth
    ctx.fillStyle = "#ffd36b";
    ctx.fillRect(24, 250, 70, 120);
    ctx.fillStyle = "#fff";
    ctx.fillRect(34, 270, 50, 80);
    ctx.fillStyle = "#5a3b00";
    ctx.font = "800 12px Nunito, sans-serif";
    ctx.fillText("ELEV", 40, 245);
    ctx.fillText(`L${state.floor}`, 50, 315);

    // trees + lamps + benches
    for (let i = 0; i < 14; i += 1) {
      art.drawBlockyTree(ctx, 160 + i * 150, 250);
      if (i % 2 === 0) art.drawStreetLamp(ctx, 230 + i * 150, 300);
      if (i % 3 === 0) art.drawBench(ctx, 300 + i * 150, 310);
    }

    // stores as Brookhaven buildings
    for (const r of mallStoreRects(state.floor)) {
      art.drawBrookhavenStore(ctx, r, r.store, state.purchasedStores.has(r.store.id));
    }

    ctx.fillStyle = "rgba(74,43,59,0.7)";
    ctx.font = "800 20px Playfair Display, serif";
    ctx.fillText(`Rose Quartz Mall · Level ${state.floor}`, 120, 580);
    ctx.font = "700 13px Nunito, sans-serif";
    ctx.fillText("Brookhaven-style street — walk to a store ENTER door", 120, 608);

    drawRobloxPlayer(player.x, player.y);
    ctx.restore();
  }

  function drawStore() {
    const store = storeWorld.store;
    // interior walls like a Roblox shop
    ctx.fillStyle = "#f2d6e4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = store.floorColor || "#f7efe8";
    ctx.fillRect(storeWorld.room.x, storeWorld.room.y + 80, storeWorld.room.w, storeWorld.room.h - 80);
    // tile grid
    ctx.strokeStyle = "rgba(0,0,0,0.04)";
    for (let x = storeWorld.room.x; x < storeWorld.room.x + storeWorld.room.w; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, storeWorld.room.y + 80);
      ctx.lineTo(x, storeWorld.room.y + storeWorld.room.h);
      ctx.stroke();
    }

    // blocky room walls
    ctx.fillStyle = "#fffafc";
    ctx.fillRect(storeWorld.room.x, storeWorld.room.y, storeWorld.room.w, 80);
    ctx.strokeStyle = store.color;
    ctx.lineWidth = 4;
    ctx.strokeRect(storeWorld.room.x, storeWorld.room.y, storeWorld.room.w, storeWorld.room.h);

    // signage board
    ctx.fillStyle = store.color;
    ctx.fillRect(60, 50, 300, 44);
    ctx.fillStyle = "#fff";
    ctx.font = "800 22px Nunito, sans-serif";
    ctx.fillText(store.name, 75, 80);

    ctx.fillStyle = "#9a6b80";
    ctx.font = "700 12px Nunito, sans-serif";
    ctx.fillText("Tap real-looking items on hangers & mannequins", 380, 75);

    for (const obj of state.interactables) {
      if (obj.type === "item") {
        const item = itemsById[obj.itemId];
        if (obj.kind === "hanger") drawHanger(obj, item);
        else if (obj.kind === "mannequin") drawMannequin(obj, item);
        else drawShelf(obj, item);
      } else if (obj.type === "dressing") {
        ctx.fillStyle = "#f1d4ff";
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        ctx.strokeStyle = "#c084fc";
        ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
        ctx.fillStyle = "#4a2b3b";
        ctx.font = "800 14px Nunito, sans-serif";
        ctx.fillText("DRESSING ROOM", obj.x + 30, obj.y + 40);
        ctx.font = "600 11px Nunito, sans-serif";
        ctx.fillText("Walk in to try on inventory", obj.x + 28, obj.y + 65);
        // curtain
        ctx.fillStyle = "#ff8fb7";
        ctx.fillRect(obj.x + 20, obj.y + 80, 160, 35);
      } else if (obj.type === "cashier") {
        ctx.fillStyle = "#fff4c2";
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        ctx.strokeStyle = "#d4a017";
        ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
        ctx.fillStyle = "#5a3b00";
        ctx.font = "800 14px Nunito, sans-serif";
        ctx.fillText("CASHIER", obj.x + 60, obj.y + 35);
        ctx.font = "600 11px Nunito, sans-serif";
        ctx.fillText("Walk here to buy & get a bag", obj.x + 28, obj.y + 60);
        // counter
        ctx.fillStyle = "#e8d5a3";
        ctx.fillRect(obj.x + 20, obj.y + 75, 160, 30);
        // cashier person
        ctx.fillStyle = "#ffd7bf";
        ctx.fillRect(obj.x + 90, obj.y + 50, 16, 16);
        ctx.fillStyle = "#ff9ec8";
        ctx.fillRect(obj.x + 88, obj.y + 66, 20, 12);
      } else if (obj.type === "exit") {
        ctx.fillStyle = "#4a2b3b";
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        ctx.fillStyle = "#fff";
        ctx.font = "800 14px Nunito, sans-serif";
        ctx.fillText("EXIT TO MALL", obj.x + 35, obj.y + 26);
      }
    }

    drawRobloxPlayer(player.x, player.y);
  }

  function draw() {
    if (state.scene === "mall") drawMall();
    else drawStore();

    // highlight nearby
    if (state.nearby?.obj && state.scene === "store") {
      const o = state.nearby.obj;
      ctx.strokeStyle = "#ff4f9a";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(o.x - 4, o.y - 4, o.w + 8, o.h + 8);
      ctx.setLineDash([]);
    }
  }

  function updatePrompt() {
    const prompt = document.getElementById("prompt");
    state.nearby = findNearby();
    if (state.nearby) {
      prompt.hidden = false;
      prompt.textContent = `${state.nearby.label} · tap / E / Do`;
    } else {
      prompt.hidden = true;
    }
  }

  let last = performance.now();
  function frame(ts) {
    const dt = Math.min(0.033, (ts - last) / 1000);
    last = ts;
    const modalOpen = [...document.querySelectorAll(".modal")].some((m) => !m.hidden);
    if (!modalOpen) {
      movePlayer(dt);
      updatePrompt();
    }
    draw();
    requestAnimationFrame(frame);
  }

  // UI events — Inventory button is primary access
  const inventoryBtn = document.getElementById("btnInventory");
  inventoryBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openInventory();
  });

  document.getElementById("btnBags").addEventListener("click", () => {
    renderBags();
    openModal("bagsModal");
  });
  document.getElementById("btnClearOutfit").addEventListener("click", () => {
    state.equipped = { top: null, bottom: null, shoes: null, bag: null, accessory: null };
    renderAvatar(document.getElementById("avatarStage"));
    renderAvatar(document.getElementById("fittingAvatar"));
    renderEquippedList();
  });
  document.getElementById("btnBuyAll").addEventListener("click", buySelected);
  document.getElementById("btnClaimPrize").addEventListener("click", claimPrize);
  document.getElementById("btnInteract").addEventListener("click", doInteract);

  document.getElementById("fittingInventory").addEventListener("click", (e) => {
    const slot = e.target.closest("[data-item]");
    if (slot) tryOn(slot.dataset.item);
  });

  document.getElementById("inventoryGrid").addEventListener("click", (e) => {
    const slot = e.target.closest("[data-item]");
    if (!slot) return;
    toast("Walk into a Dressing Room to try this on");
  });

  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.close));
  });
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.hidden = true;
    });
  });

  window.addEventListener("keydown", (e) => {
    state.keys.add(e.key);
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
    if (e.key === "e" || e.key === "E") doInteract();
    if (e.key === "i" || e.key === "I") openInventory();
  });
  window.addEventListener("keyup", (e) => state.keys.delete(e.key));

  canvas.addEventListener("pointerdown", (e) => {
    clickInteractable(e.clientX, e.clientY);
  });

  // Virtual stick
  const stick = document.getElementById("stick");
  const knob = document.getElementById("stickKnob");
  function setStick(clientX, clientY) {
    const rect = stick.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const max = 34;
    const len = Math.hypot(dx, dy) || 1;
    if (len > max) {
      dx = (dx / len) * max;
      dy = (dy / len) * max;
    }
    knob.style.left = `${32 + dx}px`;
    knob.style.top = `${32 + dy}px`;
    state.stick.active = true;
    state.stick.x = dx / max;
    state.stick.y = dy / max;
  }
  function clearStick() {
    state.stick.active = false;
    state.stick.x = 0;
    state.stick.y = 0;
    knob.style.left = "32px";
    knob.style.top = "32px";
  }
  stick.addEventListener("pointerdown", (e) => {
    stick.setPointerCapture(e.pointerId);
    setStick(e.clientX, e.clientY);
  });
  stick.addEventListener("pointermove", (e) => {
    if (!state.stick.active) return;
    setStick(e.clientX, e.clientY);
  });
  stick.addEventListener("pointerup", clearStick);
  stick.addEventListener("pointercancel", clearStick);

  // Boot
  art.preloadAll(Object.values(itemsById));
  renderAvatar(document.getElementById("avatarStage"));
  renderEquippedList();
  updateProgress();
  updateLocationBadge();
  requestAnimationFrame(frame);
})();
